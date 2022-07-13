import { useState } from 'react'

import { utils } from 'ethers'

import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import { Token } from 'constants/tokens'
import { useAccount } from 'hooks/useAccount'
import { ISSUANCE_ABI } from 'utils/abi/ISSUANCE'
import { IssuanceContractAddress } from 'constants/ethContractAddresses'

const ISSUANCEInterface = new utils.Interface(ISSUANCE_ABI)

/**
 * Approve the spending of an ERC20
 */
export const useIssuanceQuote = (
  token?: Token,
  amount?: BigNumber,
  isIssue?: Boolean
) => {
  const { provider } = useAccount()
  const [estimatedUSDC, setEStimatedUSDC] = useState<BigNumber>(
    BigNumber.from('0')
  )
  const getQuote = async () => {
    if (
      !provider ||
      !token?.optimismAddress ||
      amount?.eq(BigNumber.from('0'))
    ) {
      return
    }
    try {
      const contract = new Contract(
        IssuanceContractAddress,
        ISSUANCEInterface,
        provider.getSigner()
      )
      if (isIssue) {
        const quote =
          await contract.callStatic.getUsdcAmountInForFixedSetOffChain(
            token.optimismAddress,
            amount
          )
        setEStimatedUSDC(BigNumber.from(quote.toString()))
      } else {
        const quote =
          await contract.callStatic.getUsdcAmountOutForFixedSetOffChain(
            token.optimismAddress,
            amount
          )
        setEStimatedUSDC(BigNumber.from(quote.toString()))
      }
    } catch (error) {
      console.log('Error getting quote for perp issuance', error)
      return
    }
  }

  return {
    estimatedUSDC,
    getQuote,
  }
}
