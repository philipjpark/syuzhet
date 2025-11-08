/**
 * OpenAI Orchestration Layer for Syuzhet
 * 
 * Transforms messy user input into structured, tradable prediction theses
 * and generates narrative updates for existing markets.
 */

import OpenAI from 'openai';

// Initialize OpenAI client lazily to avoid throwing during module load
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required. Please set it in your .env file.');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface GeneratedPrediction {
  title: string;             // short, tradeable name
  thesis: string;            // narrative description
  timeHorizon: string;       // e.g. "by 2035", "within 3 years"
  eventType: "binary" | "range" | "multi";
  suggestedProbability: number;  // 0–1
  reasoningBullets: string[];
  parameters: {
    expiryTimestamp: number;    // seconds since epoch
    initialYesPrice: number;    // 0–1
    initialLiquidityUsdc: number;
  };
}

export interface NarrativeUpdate {
  updateText: string;
  newSuggestedProbability: number;
  reasoningBullets: string[];
}

interface GeneratePredictionInput {
  corpusSummary: string;
  userNotes?: string;
  preferences?: {
    timeHorizon?: string;
    riskTolerance?: "low" | "medium" | "high";
    [key: string]: any;
  };
}

interface GenerateUpdateInput {
  marketThesis: string;
  lastUpdate?: string;
  newEvidence: string;
}

const SYSTEM_PROMPT_PREDICTION = `You are SYUZHET, an advanced AI agent that transforms messy research, intuition, and notes into crisp, tradable prediction theses for on-chain markets.

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
  - expiryTimestamp: Unix timestamp in SECONDS (not milliseconds) for when the prediction resolves. MUST be in the future. Current timestamp is approximately ${Math.floor(Date.now() / 1000)}. For predictions "by 2035", use a timestamp around 2035-01-01. For "within 3 years", use current timestamp + 3 years. Always ensure the timestamp is significantly in the future (at least 1 day from now).
  - initialYesPrice: Suggested initial price (0-1) for YES shares, typically close to suggestedProbability
  - initialLiquidityUsdc: Suggested seed liquidity in USDC (reasonable amount: 100-10000)

CRITICAL: The expiryTimestamp MUST be a Unix timestamp in SECONDS (not milliseconds) and MUST be in the future. If the time horizon is "by 2035", use a timestamp like 2035-01-01 00:00:00 UTC. If it's "within 3 years", add approximately 94608000 seconds (3 years) to the current timestamp.

Be precise, defensible, and investable. Think like a cross between an investigative journalist and a quantitative analyst.`;

const SYSTEM_PROMPT_UPDATE = `You are SYUZHET's narrative update agent. You analyze new evidence and developments related to an existing prediction market thesis.

Your job:
1. Review the original market thesis and any previous updates.
2. Analyze the new evidence provided.
3. Determine how the new information affects the probability of the prediction.
4. Draft a clear, concise update narrative.
5. Provide updated probability estimate with reasoning.

Output requirements:
- updateText: Clear narrative update (2-4 sentences) explaining the new evidence and its implications
- newSuggestedProbability: Updated probability (0-1) reflecting the new information
- reasoningBullets: 2-4 bullet points explaining why the probability changed

Be objective, evidence-based, and transparent about uncertainty.`;

/**
 * Generates a structured prediction thesis from messy user input
 */
export async function generatePredictionFromCorpus(
  input: GeneratePredictionInput
): Promise<GeneratedPrediction> {
  const { corpusSummary, userNotes, preferences } = input;

  // Truncate corpus if too large (limit to ~20k tokens, roughly 15k characters)
  const MAX_CORPUS_LENGTH = 15000;
  let truncatedCorpus = corpusSummary;
  if (corpusSummary.length > MAX_CORPUS_LENGTH) {
    truncatedCorpus = corpusSummary.substring(0, MAX_CORPUS_LENGTH) + '\n\n[... Content truncated due to length. Using first ' + Math.round(MAX_CORPUS_LENGTH / 1000) + 'k characters ...]';
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const currentDate = new Date().toISOString().split('T')[0];
  
  const userPrompt = `Generate a prediction thesis from the following input:

CORPUS/RESEARCH:
${truncatedCorpus}

${userNotes ? `USER NOTES:\n${userNotes}\n` : ''}
${preferences ? `PREFERENCES:\n${JSON.stringify(preferences, null, 2)}\n` : ''}

IMPORTANT CONTEXT:
- Current date: ${currentDate}
- Current Unix timestamp (seconds): ${currentTimestamp}
- The expiryTimestamp MUST be in SECONDS (not milliseconds) and MUST be significantly in the future (at least 1 day from now)

Generate a structured, tradable prediction thesis. Return ONLY valid JSON matching this exact structure:
{
  "title": "string (max 100 chars)",
  "thesis": "string (2-4 sentences)",
  "timeHorizon": "string (e.g., 'by 2035', 'within 3 years')",
  "eventType": "binary",
  "suggestedProbability": 0.0-1.0,
  "reasoningBullets": ["string", "string", ...],
  "parameters": {
    "expiryTimestamp": ${currentTimestamp + 31536000}, // Example: 1 year from now in SECONDS (must be > ${currentTimestamp})
    "initialYesPrice": 0.0-1.0,
    "initialLiquidityUsdc": 100-10000
  }
}

Remember: expiryTimestamp must be a Unix timestamp in SECONDS (not milliseconds) and must be greater than ${currentTimestamp}.`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini for higher rate limits (1M TPM) and lower cost
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_PREDICTION },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(response) as GeneratedPrediction;

    // Validate and sanitize
    if (parsed.suggestedProbability < 0 || parsed.suggestedProbability > 1) {
      throw new Error('Invalid probability range');
    }
    
    // Fix expiry timestamp if it's in the past or too close to now
    const now = Math.floor(Date.now() / 1000);
    const minFutureTime = now + 86400; // At least 1 day in the future
    
    // If timestamp is in milliseconds (too large), convert to seconds
    if (parsed.parameters.expiryTimestamp > 1000000000000) {
      parsed.parameters.expiryTimestamp = Math.floor(parsed.parameters.expiryTimestamp / 1000);
    }
    
    if (parsed.parameters.expiryTimestamp <= minFutureTime) {
      // Auto-fix: If it's in the past or too close, set it to 1 year from now
      // or use the time horizon to estimate a better date
      const oneYearFromNow = now + (365 * 24 * 60 * 60);
      console.warn(`Expiry timestamp ${parsed.parameters.expiryTimestamp} is too close to now (${now}). Auto-correcting to ${oneYearFromNow}`);
      parsed.parameters.expiryTimestamp = oneYearFromNow;
    }
    
    if (parsed.parameters.initialYesPrice < 0 || parsed.parameters.initialYesPrice > 1) {
      throw new Error('Invalid initial price range');
    }

    return parsed;
  } catch (error: any) {
    console.error('Error generating prediction:', error);
    throw new Error(`Failed to generate prediction: ${error.message}`);
  }
}

/**
 * Generates a narrative update for an existing prediction market
 */
export async function generateNarrativeUpdate(
  input: GenerateUpdateInput
): Promise<NarrativeUpdate> {
  const { marketThesis, lastUpdate, newEvidence } = input;

  // Truncate new evidence if too large
  const MAX_EVIDENCE_LENGTH = 10000;
  let truncatedEvidence = newEvidence;
  if (newEvidence.length > MAX_EVIDENCE_LENGTH) {
    truncatedEvidence = newEvidence.substring(0, MAX_EVIDENCE_LENGTH) + '\n\n[... Evidence truncated due to length ...]';
  }

  const userPrompt = `Generate a narrative update for this prediction market:

ORIGINAL THESIS:
${marketThesis}

${lastUpdate ? `LAST UPDATE:\n${lastUpdate}\n` : 'No previous updates.\n'}
NEW EVIDENCE:
${truncatedEvidence}

Generate an update. Return ONLY valid JSON matching this exact structure:
{
  "updateText": "string (2-4 sentences)",
  "newSuggestedProbability": 0.0-1.0,
  "reasoningBullets": ["string", "string", ...]
}`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini for higher rate limits (1M TPM) and lower cost
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_UPDATE },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(response) as NarrativeUpdate;

    // Validate
    if (parsed.newSuggestedProbability < 0 || parsed.newSuggestedProbability > 1) {
      throw new Error('Invalid probability range');
    }

    return parsed;
  } catch (error: any) {
    console.error('Error generating narrative update:', error);
    throw new Error(`Failed to generate update: ${error.message}`);
  }
}

