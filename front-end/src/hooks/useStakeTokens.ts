import {useEthers, useContractFunction} from "@usedapp/core"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import networkMapping from "../chain-info/deployments/map.json"
import { constants, utils } from "ethers"
import {Contract} from "@ethersproject/contracts"
import ERC20 from "../chain-info/contracts/MockERC20.json"
import { useEffect, useState } from "react"

export const useStakeTokens = (tokenAddress: string) => {
    const { chainId } = useEthers()
    const { abi } = TokenFarm
    const tokenFarmContractAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero
    const tokenFarmInterface = new utils.Interface(abi)
    const tokenFarmContract = new Contract(tokenFarmContractAddress, tokenFarmInterface)

    const {send: stakeSend, state: stakeState} = useContractFunction(tokenFarmContract, "stakeTokens", {transactionName: "Stake Tokens"})

    const erc20Abi = ERC20.abi
    const erc20Interface = new utils.Interface(erc20Abi)
    const erc20Contract = new Contract(tokenAddress, erc20Interface)

    const {send: approveTokenSend, state: approveTokenState} = useContractFunction(erc20Contract, "approve", {transactionName: "Approve ERC20 Token"})

    const approve = (amount: string) => {
        setAmount(amount)
        return approveTokenSend(tokenFarmContractAddress, amount)
    }

    const [amount, setAmount] = useState("0")

    useEffect(()=>{
        if (approveTokenState.status=="Success") {
            stakeSend(amount, tokenAddress)
        }
    }, [approveTokenState])
    
    const [state, setState] = useState(approveTokenState)

    useEffect(()=>{
        if (approveTokenState.status=="Success") {
            setState(stakeState)
        }
        else {
            setState(approveTokenState)
        }
    }, [approveTokenState, stakeState])

    return {approve, state}
}