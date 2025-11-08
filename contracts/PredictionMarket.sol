// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictionMarket
 * @dev Minimal prediction market contract for Arc Testnet (USDC-based)
 * 
 * Arc Testnet deployment tutorial:
 * https://docs.arc.network/arc/tutorials/deploy-on-arc
 * 
 * All markets are collateralized and settled in USDC (ERC-20) on Arc.
 * USDC on Arc uses 6 decimals (not 18).
 */
contract PredictionMarket is Ownable {
    struct Market {
        string title;
        string thesis;
        uint256 expiry;
        address creator;
        bool resolved;
        bool outcome; // for binary yes/no
        uint256 totalYesShares;
        uint256 totalNoShares;
        uint256 liquidityUsdc;
    }

    IERC20 public usdc;
    uint256 public nextMarketId;
    mapping(uint256 => Market) public markets;

    event MarketCreated(
        uint256 indexed marketId,
        string title,
        string thesis,
        uint256 expiry,
        address creator,
        uint256 initialLiquidityUsdc
    );

    event MarketUpdated(
        uint256 indexed marketId,
        string updateUri,
        uint256 newSuggestedProbability
    );

    /**
     * @param _usdc USDC token address on Arc (6 decimals)
     * All market deposits/settlements are in USDC on Arc
     */
    constructor(address _usdc) Ownable(msg.sender) {
        require(_usdc != address(0), "USDC address cannot be zero");
        usdc = IERC20(_usdc);
    }

    /**
     * @dev Create a new prediction market with seed liquidity
     * @param _title Short, tradeable name
     * @param _thesis Narrative description
     * @param _expiry Unix timestamp (seconds) when prediction resolves
     * @param _initialLiquidityUsdc Seed liquidity in USDC (6 decimals)
     */
    function createMarket(
        string memory _title,
        string memory _thesis,
        uint256 _expiry,
        uint256 _initialLiquidityUsdc
    ) external {
        require(_expiry > block.timestamp, "expiry must be in the future");
        require(_initialLiquidityUsdc > 0, "liquidity > 0");

        // Pull USDC from creator as seed liquidity
        require(
            usdc.transferFrom(msg.sender, address(this), _initialLiquidityUsdc),
            "USDC transfer failed"
        );

        uint256 marketId = nextMarketId++;
        markets[marketId] = Market({
            title: _title,
            thesis: _thesis,
            expiry: _expiry,
            creator: msg.sender,
            resolved: false,
            outcome: false,
            totalYesShares: 0,
            totalNoShares: 0,
            liquidityUsdc: _initialLiquidityUsdc
        });

        emit MarketCreated(
            marketId,
            _title,
            _thesis,
            _expiry,
            msg.sender,
            _initialLiquidityUsdc
        );
    }

    /**
     * @dev Record a narrative update (off-chain content referenced by URI)
     * @param _marketId The market ID
     * @param _updateUri URI pointing to update content (e.g., IPFS hash, inline text)
     * @param _newSuggestedProbability Updated probability suggestion (0-100, representing 0-1)
     * 
     * TODO: Add access control if needed (e.g., only creator or authorized updaters)
     * TODO: In production, pin update content to IPFS and use IPFS hash as URI
     */
    function recordNarrativeUpdate(
        uint256 _marketId,
        string memory _updateUri,
        uint256 _newSuggestedProbability
    ) external {
        require(_marketId < nextMarketId, "invalid market");
        // TODO: Add access control (e.g., require(msg.sender == markets[_marketId].creator))
        
        emit MarketUpdated(_marketId, _updateUri, _newSuggestedProbability);
    }

    /**
     * @dev Get market details
     */
    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }
}
