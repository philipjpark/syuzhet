# Deploying Syuzhet on Streamlit Cloud

## Quick Start

1. **Create a Streamlit Cloud account** at https://streamlit.io/cloud

2. **Push your code to GitHub** (make sure `streamlit_app.py` is in the root)

3. **Deploy on Streamlit Cloud:**
   - Go to https://share.streamlit.io
   - Click "New app"
   - Connect your GitHub repository
   - Set the main file path to: `streamlit_app.py`
   - Click "Deploy"

## Environment Variables

Set these in Streamlit Cloud (Settings → Secrets):

```toml
OPENAI_API_KEY = "sk-proj-your-api-key-here"
```

## Local Development

1. **Install dependencies:**
   ```bash
   pip install -r requirements_streamlit.txt
   ```

2. **Set environment variable:**
   ```bash
   export OPENAI_API_KEY="sk-proj-your-api-key-here"
   ```
   Or create a `.streamlit/secrets.toml` file:
   ```toml
   OPENAI_API_KEY = "sk-proj-your-api-key-here"
   ```

3. **Run the app:**
   ```bash
   streamlit run streamlit_app.py
   ```

## Features

- ✅ Homepage with branding
- ✅ Multi-step prediction creation wizard
- ✅ AI-powered prediction generation (OpenAI GPT-4o-mini)
- ✅ File upload support (PDF, TXT, MD)
- ✅ URL input for research
- ✅ Market creation (demo mode)
- ✅ Markets viewing
- ✅ Wallet connection (demo)
- ✅ Green theme matching the Next.js app

## Notes

- PDF parsing requires additional libraries (like `pdf-parse`) which may not work in Streamlit Cloud
- For production, consider using Streamlit's file uploader with server-side processing
- The app uses demo mode for market creation (generates mock market IDs and transaction hashes)
- To enable real blockchain integration, you'll need to add web3.py and configure Arc Testnet RPC

