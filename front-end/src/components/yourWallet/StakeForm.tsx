import {Token} from "../Main"
import {useEthers, useTokenBalance, useNotifications} from "@usedapp/core"
import {formatUnits} from "@ethersproject/units"
import {Button, Input, CircularProgress, Snackbar} from "@material-ui/core"
import React, {useState, useEffect} from "react"
import {useStakeTokens} from "../../hooks/useStakeTokens"
import { utils } from "ethers"
import Alert from "@material-ui/lab/Alert"

export interface StakeFormProps{
    token: Token
}

export const StakeForm = ({token}: StakeFormProps) => {
    const {address: tokenAddress, name} = token
    const {account} = useEthers()
    const tokenBalance = useTokenBalance(tokenAddress, account)
    const formattedTokenBalance: number = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)): 0
    const notifications = useNotifications()

    const [amount, setAmount] = useState<number | string | Array<number | string>>(0)
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? "" : Number(event.target.value)
        setAmount(newAmount)
        console.log(newAmount)
    }

    const {approve, state} = useStakeTokens(tokenAddress)
    const handleStakeSubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString())
        return approve(amountAsWei.toString())
    }

    const isMining = state.status === "Mining"
    const [showTokensApprovedState, setTokensApprovedState] = useState(false)
    const [showTokensStakedState, setTokensStakedState] = useState(false)

    const handleCloseSnackbar = () => {
        setTokensApprovedState(false)
        setTokensStakedState(false)
    }


    useEffect(()=>{
        if (notifications["notifications"].filter(
            (notification: any) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Approve ERC20 Token").length > 0) {
                    console.log("approved!")
                    setTokensApprovedState(true)
                    setTokensStakedState(false)

            }
        if (notifications["notifications"].filter(
            (notification: any) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Stake Tokens").length > 0) {
                    console.log("tokens staked!")
                    setTokensApprovedState(false)
                    setTokensStakedState(true)
      
            }

    },[notifications])
    return(
        <>
            <div>
                <Input onChange={handleInputChange}/>
                <Button onClick={handleStakeSubmit} color="primary" size="large" disabled={isMining}>
                    {isMining ? <CircularProgress size={26} /> : "Stake!"}
                </Button>
            </div>
            <Snackbar open={showTokensApprovedState} autoHideDuration={5000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success">
                    ERC-20 token approved! please proceed to the next transaction.
                </Alert>
            </Snackbar>
            <Snackbar open={showTokensStakedState} autoHideDuration={5000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success">
                    Token staked!
                </Alert>
            </Snackbar>

        </>
    )
}