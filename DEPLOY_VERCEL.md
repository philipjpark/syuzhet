# Deploy Syuzhet to Vercel (Free)

This guide walks you through deploying Syuzhet to Vercel's free tier.

## Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)

## Step 1: Push Your Code to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Syuzhet prediction market platform"

# Add your GitHub remote (replace with your repo URL)
git remote add origin https://github.com/philipjpark/syuzhet.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy Smart Contracts First

**Important:** Deploy your smart contracts to Arc Testnet BEFORE deploying the frontend:

```bash
# Make sure your .env has:
# - PRIVATE_KEY (your wallet private key)
# - ARC_RPC_URL (Arc Testnet RPC)
# - NEXT_PUBLIC_USDC_CONTRACT (Arc Testnet USDC address)

# Deploy contracts
npm run deploy

# Copy the deployed contract address from the output
# You'll need this for Vercel environment variables
```

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in (or create account)

2. **Click "Add New Project"**

3. **Import your GitHub repository**
   - Select your `syuzhet` repository
   - Click "Import"

4. **Configure Project Settings:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install --legacy-peer-deps` (important for dependency resolution)
   - **Node Version:** 20.x (recommended)

5. **Add Environment Variables:**
   
   Click "Environment Variables" and add these (from your `.env` file`):
   
   **Required:**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   > ⚠️ **Important:** Replace `your_openai_api_key_here` with your actual OpenAI API key from your local `.env` file. Never commit your actual API key to GitHub!
   
   ```
   NEXT_PUBLIC_ARC_RPC_URL=https://rpc-testnet.arc.network
   ```
   
   ```
   NEXT_PUBLIC_USDC_CONTRACT=0x3600000000000000000000000000000000000000
   ```
   
   ```
   NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT=<your_deployed_contract_address>
   ```
   
   **Optional (for Dynamic Labs wallet):**
   ```
   NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
   ```
   
   **Important:** 
   - Mark `OPENAI_API_KEY` as available for **Production, Preview, and Development**
   - Mark all `NEXT_PUBLIC_*` variables as available for **Production, Preview, and Development**
   - Do NOT add `PRIVATE_KEY` or `ARC_RPC_URL` (these are only for local deployment)

6. **Click "Deploy"**

7. **Wait for deployment** (usually 2-3 minutes)

8. **Your app will be live!** Vercel will give you a URL like `syuzhet.vercel.app`

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? syuzhet
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_ARC_RPC_URL
vercel env add NEXT_PUBLIC_USDC_CONTRACT
vercel env add NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT

# Deploy to production
vercel --prod
```

## Step 4: Verify Deployment

1. **Visit your Vercel URL** (e.g., `syuzhet.vercel.app`)

2. **Test the flow:**
   - Navigate to `/create`
   - Try generating a prediction
   - Check that API routes work

3. **Check Vercel Dashboard:**
   - Go to your project dashboard
   - Check "Functions" tab for API route logs
   - Check "Deployments" for build logs

## Troubleshooting

### Build Fails

- **Error: "npm error Invalid Version"** → 
  - The project includes `vercel.json` and `.npmrc` with `--legacy-peer-deps` to handle dependency conflicts
  - If this persists, try deleting `package-lock.json` and pushing again
  - Vercel will regenerate the lock file during build
  
- **Error: "Module not found"** → Make sure all dependencies are in `package.json`
- **Error: "Hardhat compilation"** → This is expected - Hardhat won't run on Vercel. The frontend only needs contract addresses.

### API Routes Not Working

- Check that `OPENAI_API_KEY` is set in Vercel environment variables
- Check Vercel Function logs in the dashboard
- Make sure API routes are in `app/api/` directory

### Wallet Connection Issues

- Make sure `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` is set (if using Dynamic Labs)
- Check browser console for errors
- Verify Arc Testnet network is configured correctly

### Contract Interaction Fails

- Verify `NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT` is set correctly
- Check that contract is deployed on Arc Testnet
- Verify wallet is connected to Arc Testnet

## Environment Variables Summary

**Required for Vercel:**
- `OPENAI_API_KEY` - Your OpenAI API key
- `NEXT_PUBLIC_ARC_RPC_URL` - Arc Testnet RPC URL
- `NEXT_PUBLIC_USDC_CONTRACT` - USDC contract address on Arc
- `NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT` - Your deployed PredictionMarket address

**Optional:**
- `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` - For Dynamic Labs wallet

**NOT needed on Vercel:**
- `PRIVATE_KEY` - Only for local contract deployment
- `ARC_RPC_URL` - Only for local contract deployment

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Free Tier Limits

Vercel's free tier includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (100GB-hours/month)
- ✅ Automatic HTTPS
- ✅ Preview deployments for every PR

This is more than enough for development and testing!

## Next Steps

After deployment:
1. Test the full flow: create → generate → mint → update
2. Share your Vercel URL with others
3. Monitor usage in Vercel dashboard
4. Set up custom domain (optional)

