import { useEthers } from "@usedapp/core" 
import { stringify } from "querystring"
import helperConfig from "../helper-config.json"
import networkMapping from "../chain-info/deployments/map.json"
import {constants} from "ethers"
import brownieConfig from "../brownie-config.json"
import dapp from "../dapp.png"
import dai from "../dai.png"
import eth from "../eth.png"
import {YourWallet} from "./yourWallet"
import {makeStyles} from "@material-ui/core"
import { classicNameResolver } from "typescript"

export type Token = {
    image : string
    address : string
    name : string
}

const useStyles = makeStyles((theme)=>({
    title: {
        color: theme.palette.common.white,
        textAlign: "center",
        padding: theme.spacing(4)
    }
}))

export const Main = () => {
    const {chainId, error} = useEthers()
    const networkName = chainId ? helperConfig[chainId] : "dev"
    const classes = useStyles()

    const dappTokenAddress = chainId ? networkMapping[String(chainId)]["DappToken"][0] : constants.AddressZero
    const wethTokenAddress = chainId ? brownieConfig["networks"][networkName]["weth_token"] : constants.AddressZero
    const fauTokenAddress = chainId ? brownieConfig["networks"][networkName]["fau_token"] : constants.AddressZero

    const supportedTokens: Array<Token> = [
        {
            image: dapp,
            address: dappTokenAddress,
            name: "DAPP"
        },
        {
            image: eth,
            address: wethTokenAddress,
            name: "WETH"
        },
        {
            image: dai,
            address: fauTokenAddress,
            name: "DAI"
        },        

    ]
    return(
        <>
            <h1 className={classes.title}>Dapp Token App</h1>
            <YourWallet supportedTokens={supportedTokens} />
        </>
    )
}