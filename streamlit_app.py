"""
Syuzhet - Predictions Investment Platform
Streamlit Application

Express your intuition, predict the ending, make money along the way
Be the Michael Saylor of the Foresight Markets
"""

import streamlit as st
import openai
import json
import time
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import os
from pathlib import Path

# Page configuration
st.set_page_config(
    page_title="Syuzhet - Predictions Investment Platform",
    page_icon="🔮",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for green theme
st.markdown("""
<style>
    .main {
        background: linear-gradient(180deg, #064e3b 0%, #065f46 50%, #064e3b 100%);
    }
    .stButton>button {
        background: linear-gradient(90deg, #84cc16, #65a30d);
        color: #064e3b;
        font-weight: bold;
        border: none;
        border-radius: 8px;
        padding: 0.5rem 1.5rem;
    }
    .stButton>button:hover {
        background: linear-gradient(90deg, #a3e635, #84cc16);
        box-shadow: 0 0 20px rgba(196, 253, 56, 0.5);
    }
    h1 {
        color: #d9f99d;
        text-shadow: 0 0 20px rgba(196, 253, 56, 0.5);
    }
    h2, h3 {
        color: #d9f99d;
    }
    .prediction-card {
        background: linear-gradient(135deg, #065f46 0%, #047857 50%, #065f46 100%);
        border: 1px solid rgba(196, 253, 56, 0.3);
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'markets' not in st.session_state:
    st.session_state.markets = []
if 'current_step' not in st.session_state:
    st.session_state.current_step = 'home'
if 'prediction_data' not in st.session_state:
    st.session_state.prediction_data = {}
if 'wallet_connected' not in st.session_state:
    st.session_state.wallet_connected = False
if 'wallet_address' not in st.session_state:
    st.session_state.wallet_address = None

# OpenAI client initialization
def get_openai_client():
    """Initialize OpenAI client"""
    api_key = os.getenv('OPENAI_API_KEY') or st.secrets.get('OPENAI_API_KEY', '')
    if not api_key:
        st.error("⚠️ OPENAI_API_KEY not configured. Please set it in Streamlit secrets or environment variables.")
        return None
    return openai.OpenAI(api_key=api_key)

# Generate prediction from corpus
def generate_prediction(corpus: str, user_notes: str = "", market_sentiment: str = "", time_horizon: str = "") -> Optional[Dict]:
    """Generate prediction thesis from corpus using OpenAI"""
    client = get_openai_client()
    if not client:
        return None
    
    current_timestamp = int(time.time())
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    system_prompt = """You are SYUZHET, an advanced AI agent that transforms messy research, intuition, and notes into crisp, tradable prediction theses for on-chain markets.

Your job:
1. Analyze the user's corpus and notes to identify a clear, falsifiable prediction.
2. Structure it as a binary event (YES/NO outcome) suitable for a prediction market.
3. Estimate probability based on evidence and reasoning.
4. Suggest market parameters (expiry, initial price, liquidity) appropriate for Arc Testnet (USDC-based).

Output requirements:
- Title: Short, tradeable name (max 100 chars)
- Thesis: Clear narrative description (2-4 sentences)
- Time horizon: Specific timeframe (e.g., "by 2035", "within 3 years")
- Event type: Always "binary" for now
- Suggested probability: 0-1 based on evidence
- Reasoning bullets: 3-5 key points supporting the probability estimate
- Parameters:
  - expiryTimestamp: Unix timestamp in SECONDS (not milliseconds) for when the prediction resolves. MUST be in the future.
  - initialYesPrice: Suggested initial price (0-1) for YES shares, typically close to suggestedProbability
  - initialLiquidityUsdc: Suggested seed liquidity in USDC (reasonable amount: 100-10000)

CRITICAL: The expiryTimestamp MUST be a Unix timestamp in SECONDS (not milliseconds) and MUST be significantly in the future (at least 1 day from now).

Be precise, defensible, and investable. Think like a cross between an investigative journalist and a quantitative analyst."""

    user_prompt = f"""Generate a prediction thesis from the following input:

CORPUS/RESEARCH:
{corpus[:15000]}

{f'USER NOTES:\n{user_notes}\n' if user_notes else ''}
{f'MARKET SENTIMENT: {market_sentiment}\n' if market_sentiment else ''}
{f'TIME HORIZON: {time_horizon}\n' if time_horizon else ''}

IMPORTANT CONTEXT:
- Current date: {current_date}
- Current Unix timestamp (seconds): {current_timestamp}
- The expiryTimestamp MUST be in SECONDS (not milliseconds) and MUST be significantly in the future (at least 1 day from now)

Generate a structured, tradable prediction thesis. Return ONLY valid JSON matching this exact structure:
{{
  "title": "string (max 100 chars)",
  "thesis": "string (2-4 sentences)",
  "timeHorizon": "string (e.g., 'by 2035', 'within 3 years')",
  "eventType": "binary",
  "suggestedProbability": 0.0-1.0,
  "reasoningBullets": ["string", "string", ...],
  "parameters": {{
    "expiryTimestamp": {current_timestamp + 31536000},
    "initialYesPrice": 0.0-1.0,
    "initialLiquidityUsdc": 100-10000
  }}
}}

Remember: expiryTimestamp must be a Unix timestamp in SECONDS (not milliseconds) and must be greater than {current_timestamp}."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Validate and fix expiry timestamp
        now = int(time.time())
        min_future_time = now + 86400  # At least 1 day
        
        if result['parameters']['expiryTimestamp'] > 1000000000000:
            result['parameters']['expiryTimestamp'] = result['parameters']['expiryTimestamp'] // 1000
        
        if result['parameters']['expiryTimestamp'] <= min_future_time:
            result['parameters']['expiryTimestamp'] = now + (365 * 24 * 60 * 60)  # 1 year from now
        
        return result
    except Exception as e:
        st.error(f"Error generating prediction: {str(e)}")
        return None

# Create market (demo mode)
def create_market(prediction: Dict) -> Dict:
    """Create a market (demo mode - returns mock data)"""
    market_id = random.randint(1000, 999999)
    tx_hash = '0x' + ''.join([random.choice('0123456789abcdef') for _ in range(64)])
    
    market = {
        'id': market_id,
        'title': prediction['title'],
        'thesis': prediction['thesis'],
        'timeHorizon': prediction['timeHorizon'],
        'suggestedProbability': prediction['suggestedProbability'],
        'expiryTimestamp': prediction['parameters']['expiryTimestamp'],
        'initialLiquidityUsdc': prediction['parameters']['initialLiquidityUsdc'],
        'txHash': tx_hash,
        'createdAt': int(time.time()),
        'demo': True
    }
    
    st.session_state.markets.append(market)
    return market

# Homepage
def show_homepage():
    """Display homepage"""
    st.markdown("""
    <div style="text-align: center; padding: 3rem 0;">
        <h1 style="font-size: 4rem; margin-bottom: 0.5rem;">🔮 Syuzhet</h1>
        <p style="font-size: 1.2rem; color: #a3e635; font-style: italic;">(Sue-jet)</p>
        <p style="font-size: 2rem; color: #d9f99d; margin: 2rem 0;">
            Express your intuition, predict the ending, make money along the way
        </p>
        <p style="font-size: 1.2rem; color: #a3e635; margin: 1rem 0;">
            Be the Michael Saylor of the Foresight Markets
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if st.button("🚀 Get Started", use_container_width=True, type="primary"):
            st.session_state.current_step = 'create'
            st.rerun()
    
    st.markdown("---")
    
    # Features
    st.markdown("### ✨ Why Syuzhet?")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="prediction-card">
            <h3>🤖 AI-Powered Predictions</h3>
            <p>Upload your research and let AI generate investable prediction theses. No manual analysis needed.</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="prediction-card">
            <h3>📈 Trade Like Stocks</h3>
            <p>Buy and sell prediction shares with USDC. Real-time pricing, portfolio tracking, and market insights.</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="prediction-card">
            <h3>🔒 Blockchain Secured</h3>
            <p>Built on Arc blockchain with smart contracts. Your predictions are immutable and tradable assets.</p>
        </div>
        """, unsafe_allow_html=True)
    
    # How it works
    st.markdown("---")
    st.markdown("### 🔄 How It Works")
    steps = [
        ("1️⃣", "Upload Research", "Add PDFs, articles, or paste text"),
        ("2️⃣", "AI Generates Prediction", "Get an investable thesis with probability"),
        ("3️⃣", "Publish to Market", "List your prediction for others to trade"),
        ("4️⃣", "Trade & Profit", "Buy/sell shares as the market evolves"),
    ]
    
    cols = st.columns(4)
    for i, (emoji, title, desc) in enumerate(steps):
        with cols[i]:
            st.markdown(f"### {emoji}")
            st.markdown(f"**{title}**")
            st.markdown(desc)

# Create Prediction Wizard
def show_create_wizard():
    """Multi-step prediction creation wizard"""
    st.title("🔮 Create Prediction")
    
    # Progress indicator
    steps = ['Idea & Corpus', 'Review & Edit', 'Mint On-Chain']
    current_step_idx = st.session_state.get('wizard_step', 0)
    
    progress_cols = st.columns(3)
    for i, step_name in enumerate(steps):
        with progress_cols[i]:
            if i <= current_step_idx:
                st.success(f"✓ {step_name}")
            else:
                st.info(step_name)
    
    st.markdown("---")
    
    # Step 1: Input
    if current_step_idx == 0:
        st.subheader("📝 Step 1: Describe Your Intuition")
        st.markdown("Enter your idea and research notes. AI will transform it into a structured prediction thesis.")
        
        # Market Sentiment
        market_sentiment = st.text_input(
            "Market Sentiment",
            value="mars news",
            help="e.g., mars news, AI developments, space exploration"
        )
        
        # File upload
        uploaded_files = st.file_uploader(
            "Upload Research Files (PDF, TXT, MD)",
            type=['pdf', 'txt', 'md'],
            accept_multiple_files=True
        )
        
        # URL input
        st.markdown("#### Research URLs")
        url_input = st.text_input("Add URL", placeholder="https://example.com/article")
        urls = st.session_state.get('research_urls', [])
        
        col1, col2 = st.columns([3, 1])
        with col1:
            if url_input and st.button("➕ Add URL"):
                urls.append(url_input)
                st.session_state.research_urls = urls
                st.rerun()
        
        if urls:
            st.markdown("**Added URLs:**")
            for i, url in enumerate(urls):
                col1, col2 = st.columns([10, 1])
                with col1:
                    st.markdown(f"- {url}")
                with col2:
                    if st.button("❌", key=f"remove_{i}"):
                        urls.pop(i)
                        st.session_state.research_urls = urls
                        st.rerun()
        
        # Corpus input
        corpus = st.text_area(
            "Research Corpus & Notes *",
            height=300,
            placeholder="Paste your research, articles, notes, links, or any relevant information here...",
            help="Required: Enter your research and notes"
        )
        
        # Additional notes
        user_notes = st.text_area(
            "Additional Notes (Optional)",
            height=150,
            placeholder="Any additional context or preferences..."
        )
        
        # Preferences
        col1, col2 = st.columns(2)
        with col1:
            time_horizon = st.text_input(
                "Time Horizon (Optional)",
                placeholder="e.g., by 2035, within 3 years"
            )
        with col2:
            risk_tolerance = st.selectbox(
                "Risk Tolerance",
                ["low", "medium", "high"],
                index=1
            )
        
        # Generate button
        if st.button("✨ Generate Prediction Thesis", type="primary", use_container_width=True):
            if not corpus.strip() and not uploaded_files:
                st.error("Please enter your research corpus or upload files")
            else:
                # Process uploaded files
                file_content = ""
                if uploaded_files:
                    for file in uploaded_files:
                        if file.type == "application/pdf":
                            st.warning("PDF parsing not available in Streamlit demo. Please paste text content.")
                        file_content += f"\n\n[File: {file.name}]\n"
                        file_content += "(PDF content extraction requires additional libraries)"
                        # In production, you'd use pdf-parse here
                        # For now, we'll just note the file
                        try:
                            # Try to read as text if it's actually a text file
                            file_content += file.read().decode('utf-8', errors='ignore')
                        except:
                            pass
                        file_content += "\n"
                else:
                    # Try to read text files
                    for file in uploaded_files:
                        if file.type.startswith('text/'):
                            file_content += f"\n\n[File: {file.name}]\n"
                            file_content += str(file.read(), 'utf-8')
                            file_content += "\n"
                
                # Combine URLs
                if urls:
                    file_content += "\n\n--- Research URLs ---\n"
                    file_content += "\n".join([f"- {url}" for url in urls])
                    file_content += "\n"
                
                full_corpus = corpus + "\n\n" + file_content if file_content else corpus
                
                with st.spinner("🤖 AI is generating your prediction thesis..."):
                    prediction = generate_prediction(
                        full_corpus,
                        user_notes,
                        market_sentiment,
                        time_horizon
                    )
                    
                    if prediction:
                        st.session_state.prediction_data = prediction
                        st.session_state.wizard_step = 1
                        st.success("✅ Prediction generated successfully!")
                        time.sleep(1)
                        st.rerun()
                    else:
                        st.error("Failed to generate prediction. Please check your OpenAI API key.")
    
    # Step 2: Review & Edit
    elif current_step_idx == 1:
        st.subheader("👁️ Step 2: Review & Edit Prediction")
        
        if not st.session_state.prediction_data:
            st.error("No prediction data found. Please go back to step 1.")
            if st.button("← Back to Input"):
                st.session_state.wizard_step = 0
                st.rerun()
            return
        
        pred = st.session_state.prediction_data
        
        # Editable fields
        title = st.text_input("Title", value=pred.get('title', ''))
        thesis = st.text_area("Thesis", value=pred.get('thesis', ''), height=150)
        time_horizon = st.text_input("Time Horizon", value=pred.get('timeHorizon', ''))
        
        # Probability slider
        prob = st.slider(
            "Suggested Probability",
            min_value=0.0,
            max_value=1.0,
            value=pred.get('suggestedProbability', 0.5),
            step=0.01,
            format="%.1f%%"
        )
        
        # Reasoning bullets
        st.markdown("**Reasoning:**")
        reasoning = pred.get('reasoningBullets', [])
        for i, bullet in enumerate(reasoning):
            st.markdown(f"- {bullet}")
        
        # Update prediction data
        st.session_state.prediction_data = {
            **pred,
            'title': title,
            'thesis': thesis,
            'timeHorizon': time_horizon,
            'suggestedProbability': prob,
        }
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("← Back", use_container_width=True):
                st.session_state.wizard_step = 0
                st.rerun()
        with col2:
            if st.button("Continue to On-Chain Setup →", type="primary", use_container_width=True):
                st.session_state.wizard_step = 2
                st.rerun()
    
    # Step 3: Mint
    elif current_step_idx == 2:
        st.subheader("⚙️ Step 3: Mint Prediction Asset")
        
        if not st.session_state.prediction_data:
            st.error("No prediction data found.")
            if st.button("← Back to Review"):
                st.session_state.wizard_step = 1
                st.rerun()
            return
        
        pred = st.session_state.prediction_data
        params = pred.get('parameters', {})
        
        # Expiry date
        expiry_ts = params.get('expiryTimestamp', int(time.time()) + 31536000)
        expiry_date = datetime.fromtimestamp(expiry_ts)
        expiry_input = st.date_input(
            "Expiry Date",
            value=expiry_date.date(),
            min_value=datetime.now().date()
        )
        expiry_time = st.time_input("Expiry Time", value=expiry_date.time())
        expiry_datetime = datetime.combine(expiry_input, expiry_time)
        expiry_timestamp = int(expiry_datetime.timestamp())
        
        # Initial liquidity
        liquidity = st.number_input(
            "Initial Liquidity (USDC)",
            min_value=100.0,
            value=float(params.get('initialLiquidityUsdc', 1000)),
            step=100.0
        )
        
        # Summary
        st.markdown("### Summary")
        st.json({
            "Title": pred.get('title', ''),
            "Expiry": expiry_datetime.strftime("%Y-%m-%d %H:%M:%S"),
            "Liquidity": f"{liquidity} USDC",
            "Initial Price": f"{pred.get('suggestedProbability', 0.5) * 100:.1f}%"
        })
        
        # Update parameters
        params['expiryTimestamp'] = expiry_timestamp
        params['initialLiquidityUsdc'] = liquidity
        st.session_state.prediction_data['parameters'] = params
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("← Back", use_container_width=True):
                st.session_state.wizard_step = 1
                st.rerun()
        with col2:
            if st.button("🚀 Mint Prediction Asset", type="primary", use_container_width=True):
                with st.spinner("Minting prediction asset on-chain..."):
                    # Create market (demo mode)
                    market = create_market(st.session_state.prediction_data)
                    
                    st.success(f"✅ Prediction market created successfully!")
                    st.info(f"Market ID: {market['id']} | TX Hash: {market['txHash']}")
                    
                    # Reset wizard
                    st.session_state.wizard_step = 0
                    st.session_state.prediction_data = {}
                    st.session_state.research_urls = []
                    
                    time.sleep(2)
                    st.session_state.current_step = 'markets'
                    st.rerun()

# Markets View
def show_markets():
    """Display all created markets"""
    st.title("📊 Prediction Markets")
    
    if not st.session_state.markets:
        st.info("No markets created yet. Create your first prediction!")
        if st.button("Create Prediction"):
            st.session_state.current_step = 'create'
            st.rerun()
    else:
        for market in reversed(st.session_state.markets):
            with st.expander(f"🔮 {market['title']}", expanded=False):
                st.markdown(f"**Thesis:** {market['thesis']}")
                st.markdown(f"**Time Horizon:** {market['timeHorizon']}")
                st.markdown(f"**Probability:** {market['suggestedProbability'] * 100:.1f}%")
                st.markdown(f"**Expiry:** {datetime.fromtimestamp(market['expiryTimestamp']).strftime('%Y-%m-%d %H:%M:%S')}")
                st.markdown(f"**Liquidity:** {market['initialLiquidityUsdc']} USDC")
                st.markdown(f"**Market ID:** {market['id']}")
                st.markdown(f"**TX Hash:** `{market['txHash']}`")
                if market.get('demo'):
                    st.info("🎭 Demo Mode - This is a simulated market")

# Sidebar Navigation
def show_sidebar():
    """Sidebar navigation"""
    with st.sidebar:
        st.image("https://via.placeholder.com/120x120/065f46/84cc16?text=🔮", width=120)
        st.title("Syuzhet")
        st.caption("(Sue-jet)")
        
        st.markdown("---")
        
        # Navigation
        if st.button("🏠 Home", use_container_width=True):
            st.session_state.current_step = 'home'
            st.session_state.wizard_step = 0
            st.rerun()
        
        if st.button("🔮 Create Prediction", use_container_width=True):
            st.session_state.current_step = 'create'
            st.rerun()
        
        if st.button("📊 Markets", use_container_width=True):
            st.session_state.current_step = 'markets'
            st.rerun()
        
        st.markdown("---")
        
        # Wallet connection
        st.subheader("💼 Wallet")
        if st.session_state.wallet_connected:
            st.success("✅ Connected")
            st.code(st.session_state.wallet_address[:20] + "...")
            if st.button("Disconnect"):
                st.session_state.wallet_connected = False
                st.session_state.wallet_address = None
                st.rerun()
        else:
            if st.button("🔌 Connect Wallet", use_container_width=True):
                # Demo wallet connection
                st.session_state.wallet_connected = True
                st.session_state.wallet_address = "0x" + ''.join([random.choice('0123456789abcdef') for _ in range(40)])
                st.success("✅ Wallet connected!")
                st.rerun()
        
        st.markdown("---")
        st.caption("Built on Arc Testnet")
        st.caption("Express intuition, predict the ending")

# Main app
def main():
    """Main application"""
    show_sidebar()
    
    current_step = st.session_state.current_step
    
    if current_step == 'home':
        show_homepage()
    elif current_step == 'create':
        show_create_wizard()
    elif current_step == 'markets':
        show_markets()
    else:
        show_homepage()

if __name__ == "__main__":
    main()

