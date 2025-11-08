# Claude Code + Raindrop MCP Integration

This repository is designed to be extended with **Claude Code** and **Raindrop MCP** (Model Context Protocol), enabling AI agents to help evolve the Syuzhet foresight markets platform.

## What is Raindrop MCP?

Raindrop MCP allows Claude and other AI coding assistants to understand and modify your codebase with full context. It's particularly powerful for:

- **Arc contract design** - Let AI help design and optimize smart contracts
- **Prediction market logic** - Evolve market mechanisms with AI assistance
- **Onchain interactions** - Generate and test contract interaction code
- **Full-stack development** - AI can work across frontend, backend, and smart contracts

## Quick Start

### 1. Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

### 2. Install Raindrop MCP

```bash
npm install -g @liquidmetal-ai/raindrop
```

### 3. Authenticate

```bash
raindrop auth login
```

### 4. Install MCP for Claude Code

```bash
raindrop mcp install-claude
```

### 5. Launch Claude Code with MCP

1. Open Claude Code
2. Run the command: `/mcp`
3. Select `raindrop-mcp` from the list

## Using Raindrop with Syuzhet

Once Raindrop MCP is active, you can ask Claude to:

- **"Help me deploy the PredictionMarket contract to Arc Testnet"**
- **"Generate a function to interact with USDC on Arc"**
- **"Create a component for displaying prediction market data"**
- **"Optimize the smart contract gas costs"**
- **"Add Circle Wallets integration"**

Claude will have full context of:
- Your Solidity contracts
- Your Next.js frontend
- Your deployment scripts
- Your environment configuration
- Arc Testnet specifics

## Project Context for AI Agents

This project:

- **Uses Arc L1** and **USDC** for all onchain settlement
- **Implements AI-assisted prediction markets** where intuition becomes a liquid asset
- **Targets Arc Testnet** (chainId: 1243) for deployment
- **Uses Hardhat** for contract development and deployment
- **Uses Next.js 14** with TypeScript for the frontend
- **Integrates Dynamic Labs** (current) and **Circle Wallets** (scaffolded) for account abstraction

## MCP Manifest

The project structure is designed to be MCP-friendly:

- Clear separation of concerns (contracts, frontend, lib utilities)
- Comprehensive TODO comments marking integration points
- Environment-based configuration
- Type-safe TypeScript throughout

## Resources

- **Raindrop MCP Setup**: https://docs.liquidmetal.ai/tutorials/claude-code-mcp-setup/
- **Claude Code**: https://claude.ai/code
- **Arc Network Docs**: https://docs.arc.network

## Next Steps

1. Install the tools above
2. Launch Claude Code with `/mcp` and select `raindrop-mcp`
3. Start asking Claude to help evolve the Syuzhet platform!

