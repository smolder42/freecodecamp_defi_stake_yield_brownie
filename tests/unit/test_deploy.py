from scripts.helpful_scripts import (
    get_account,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
    get_contract,
)
from scripts.deploy import deploy_token_farm_and_dapp_token
from brownie import DappToken, TokenFarm, network
import pytest


def test_set_price_feed_contract():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip()
    account = get_account()
    non_owner = get_account(index=1)
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()

    price_feed_address = get_contract("dai_usd_price_feed")
    token_farm.setPriceFeedContract(dapp_token, price_feed_address, {"from": account})

    assert token_farm.tokenPriceFeedMapping(dapp_token) == price_feed_address
    with pytest.raises(AttributeError):
        token_farm.setPriceFeedContract(
            dapp_token, price_feed_address, {"from": non_owner}
        )


def test_stake_tokens(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip()
    account = get_account()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    dapp_token.approve(token_farm.address, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, dapp_token, {"from": account})

    assert token_farm.stakingBalance(dapp_token, account.address) == amount_staked
