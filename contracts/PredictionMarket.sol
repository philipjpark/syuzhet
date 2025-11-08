// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictionMarket
 * @dev A prediction market contract where each prediction is represented as an ERC-20 token
 * Users can buy/sell shares of predictions, and the price is determined by market dynamics
 */
contract PredictionMarket is Ownable {
    struct Prediction {
        string title;
        string description;
        uint256 initialPrice; // Price in USDC (6 decimals)
        uint256 totalSupply;
        uint256 timeframe; // Unix timestamp
        address creator;
        bool resolved;
        bool outcome; // true if prediction came true
        uint256 createdAt;
    }

    // Mapping from prediction ID to Prediction struct
    mapping(uint256 => Prediction) public predictions;
    
    // Mapping from prediction ID to ERC20 token contract
    mapping(uint256 => address) public predictionTokens;
    
    // Total number of predictions
    uint256 public predictionCount;
    
    // USDC token address (6 decimals on Arc)
    address public usdcToken;
    
    event PredictionCreated(
        uint256 indexed predictionId,
        address indexed creator,
        string title,
        uint256 initialPrice
    );
    
    event PredictionResolved(
        uint256 indexed predictionId,
        bool outcome
    );
    
    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = _usdcToken;
    }
    
    /**
     * @dev Create a new prediction and mint initial shares
     * @param title The prediction title
     * @param description The prediction description
     * @param initialPrice Initial price per share in USDC (6 decimals)
     * @param initialSupply Initial number of shares to mint
     * @param timeframe Unix timestamp when prediction should be resolved
     */
    function createPrediction(
        string memory title,
        string memory description,
        uint256 initialPrice,
        uint256 initialSupply,
        uint256 timeframe
    ) external returns (uint256) {
        require(initialPrice > 0, "Price must be greater than 0");
        require(initialSupply > 0, "Supply must be greater than 0");
        require(timeframe > block.timestamp, "Timeframe must be in the future");
        
        uint256 predictionId = predictionCount++;
        
        predictions[predictionId] = Prediction({
            title: title,
            description: description,
            initialPrice: initialPrice,
            totalSupply: initialSupply,
            timeframe: timeframe,
            creator: msg.sender,
            resolved: false,
            outcome: false,
            createdAt: block.timestamp
        });
        
        // Deploy ERC20 token for this prediction
        PredictionToken token = new PredictionToken(
            string(abi.encodePacked("YES-", title)),
            string(abi.encodePacked("YES", title)),
            initialSupply,
            msg.sender
        );
        
        predictionTokens[predictionId] = address(token);
        
        emit PredictionCreated(predictionId, msg.sender, title, initialPrice);
        
        return predictionId;
    }
    
    /**
     * @dev Buy shares of a prediction
     * @param predictionId The ID of the prediction
     * @param shares Number of shares to buy
     */
    function buyShares(uint256 predictionId, uint256 shares) external {
        require(predictionId < predictionCount, "Invalid prediction ID");
        Prediction storage pred = predictions[predictionId];
        require(!pred.resolved, "Prediction already resolved");
        
        address tokenAddress = predictionTokens[predictionId];
        require(tokenAddress != address(0), "Token not found");
        
        // Calculate cost (simplified - in production, use AMM or order book)
        uint256 cost = pred.initialPrice * shares;
        
        // Transfer USDC from buyer
        IERC20(usdcToken).transferFrom(msg.sender, address(this), cost);
        
        // Transfer shares to buyer
        PredictionToken(tokenAddress).transfer(msg.sender, shares);
    }
    
    /**
     * @dev Sell shares of a prediction
     * @param predictionId The ID of the prediction
     * @param shares Number of shares to sell
     */
    function sellShares(uint256 predictionId, uint256 shares) external {
        require(predictionId < predictionCount, "Invalid prediction ID");
        Prediction storage pred = predictions[predictionId];
        require(!pred.resolved, "Prediction already resolved");
        
        address tokenAddress = predictionTokens[predictionId];
        require(tokenAddress != address(0), "Token not found");
        
        // Transfer shares from seller
        PredictionToken(tokenAddress).transferFrom(msg.sender, address(this), shares);
        
        // Calculate proceeds (simplified - in production, use AMM or order book)
        uint256 proceeds = pred.initialPrice * shares;
        
        // Transfer USDC to seller
        IERC20(usdcToken).transfer(msg.sender, proceeds);
    }
    
    /**
     * @dev Resolve a prediction (only owner for now, in production use oracle)
     * @param predictionId The ID of the prediction
     * @param outcome Whether the prediction came true
     */
    function resolvePrediction(uint256 predictionId, bool outcome) external onlyOwner {
        require(predictionId < predictionCount, "Invalid prediction ID");
        Prediction storage pred = predictions[predictionId];
        require(!pred.resolved, "Already resolved");
        require(block.timestamp >= pred.timeframe, "Too early to resolve");
        
        pred.resolved = true;
        pred.outcome = outcome;
        
        emit PredictionResolved(predictionId, outcome);
    }
    
    /**
     * @dev Get prediction details
     */
    function getPrediction(uint256 predictionId) external view returns (Prediction memory) {
        return predictions[predictionId];
    }
}

/**
 * @title PredictionToken
 * @dev ERC20 token representing shares in a prediction
 */
contract PredictionToken is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialHolder
    ) ERC20(name, symbol) {
        _mint(initialHolder, initialSupply);
    }
}

