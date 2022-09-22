// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract TokenFarm is Ownable {
    mapping(address => uint256) public uniqueTokensStaked;
    mapping(address => mapping(address => uint256)) public stakingBalance;
    mapping(address => address) public tokenPriceFeedMapping;
    address[] public stakers;
    address[] public allowedTokens;
    IERC20 public dappToken;

    constructor(address _dappToken) public {
        dappToken = IERC20(_dappToken);
    }

    function setPriceFeedContract(address token, address priceFeedAddress)
        public
        onlyOwner
    {
        tokenPriceFeedMapping[token] = priceFeedAddress;
    }

    function issueTokens() public {
        for (
            uint256 stakersIndex = 0;
            stakersIndex < stakers.length;
            stakersIndex++
        ) {
            address recipient = stakers[stakersIndex];
            uint256 userTotalValue = getUserTotalValue(recipient);
            dappToken.transfer(recipient, userTotalValue); // is this a 1-1 token issue?
        }
    }

    function getUserTotalValue(address user) public returns (uint256) {
        uint256 totalValue = 0;
        require(uniqueTokensStaked[user] > 0, "No tokens staked!");
        for (
            uint256 allowedTokensIndex = 0;
            allowedTokensIndex < allowedTokens.length;
            allowedTokensIndex++
        ) {
            totalValue =
                totalValue +
                getUserSingleTokenValue(
                    user,
                    allowedTokens[allowedTokensIndex]
                );
        }

        return totalValue;
    }

    function getUserSingleTokenValue(address user, address token)
        public
        view
        returns (uint256)
    {
        if (uniqueTokensStaked[user] <= 0) {
            return 0; // looks same as require() statement in getUserTotalValue?
        }
        (uint256 price, uint256 decimals) = getTokenValue(token);
        uint256 tokenValue = (stakingBalance[token][user] * price) /
            (10**decimals);

        return tokenValue;
    }

    function getTokenValue(address token)
        public
        view
        returns (uint256, uint256)
    {
        address priceFeedAddress = tokenPriceFeedMapping[token];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            priceFeedAddress
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        uint256 decimals = uint256(priceFeed.decimals());

        return (uint256(price), decimals);
    }

    function unstakeTokens(address _token) public {
        uint256 balance = stakingBalance[_token][msg.sender];
        require(balance > 0, "Balance cannot be 0");
        IERC20(_token).transfer(msg.sender, balance);
        stakingBalance[_token][msg.sender] = 0;
        uniqueTokensStaked[msg.sender] = uniqueTokensStaked[msg.sender] - 1;
    }

    function stakeTokens(uint256 _amount, address _token) public {
        require(_amount > 0, "Balance cannot be 0");
        require(tokenIsAllowed(_token), "Token not allowed!");
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        updateUniqueTokensStaked(msg.sender, _token);
        stakingBalance[_token][msg.sender] =
            stakingBalance[_token][msg.sender] +
            _amount;

        if (uniqueTokensStaked[msg.sender] == 1) {
            stakers.push(msg.sender); // will there be multiple pushes if same token is staked more than once?
        }
    }

    function updateUniqueTokensStaked(address user, address token) internal {
        if (stakingBalance[token][user] <= 0) {
            uniqueTokensStaked[user] = uniqueTokensStaked[user] + 1;
        }
    }

    function tokenIsAllowed(address _token) public returns (bool) {
        for (
            uint256 allowedTokensIndex = 0;
            allowedTokensIndex < allowedTokens.length;
            allowedTokensIndex++
        ) {
            if (allowedTokens[allowedTokensIndex] == _token) {
                return true;
            }
        }

        return false;
    }

    function addAllowedToken(address _token) public onlyOwner {
        allowedTokens.push(_token);
    }
}
