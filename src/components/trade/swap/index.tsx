import { useCallback, useEffect, useState } from 'react'

import { colors, useICColorMode } from '@/lib/styles/colors'

import { UpDownIcon } from '@chakra-ui/icons'
import { Box, Flex, IconButton, Text, useDisclosure } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { useConnectModal } from '@rainbow-me/rainbowkit'

import { Token } from '@/constants/tokens'
import { useApproval } from '@/lib/hooks/useApproval'
import { useBestQuote } from '@/lib/hooks/useBestQuote'
import { useNetwork } from '@/lib/hooks/useNetwork'
import { useTokenComponents } from '@/lib/hooks/useTokenComponents'
import { useTrade } from '@/lib/hooks/useTrade'
import { useTradeTokenLists } from '@/lib/hooks/useTradeTokenLists'
import { useWallet } from '@/lib/hooks/useWallet'
import { useBalanceData } from '@/lib/providers/Balances'
import { useProtection } from '@/lib/providers/Protection'
import { useSlippage } from '@/lib/providers/Slippage'
import { isValidTokenInput, toWei } from '@/lib/utils'
import { getBlockExplorerContractUrl } from '@/lib/utils/blockExplorer'
import { getZeroExRouterAddress } from '@/lib/utils/contracts'
import { getNativeToken, isPerpToken } from '@/lib/utils/tokens'

import { TradeButtonContainer } from '../_shared/footer'
import {
  formattedBalance,
  formattedFiat,
  getFormattedOuputTokenAmount,
  getFormattedPriceImpact,
  getFormattedTokenPrices,
  getHasInsufficientFunds,
  getTradeInfoData0x,
  shouldShowWarningSign,
} from '../_shared/QuickTradeFormatter'
import TradeInputSelector from '../_shared/TradeInputSelector'
import {
  getSelectTokenListItems,
  SelectTokenModal,
} from '../_shared/SelectTokenModal'

import { BetterQuoteState, BetterQuoteView } from './BetterQuoteView'
import { TradeDetail } from './TradeDetail'
import { TradeInfoItem } from './TradeInfo'
import { RethSupplyCapOverrides } from '@/components/supply'

export type QuickTradeProps = {
  isNarrowVersion?: boolean
  onOverrideSupplyCap?: (overrides: RethSupplyCapOverrides | undefined) => void
  onShowSupplyCap?: (show: boolean) => void
  switchTabs?: () => void
}

const QuickTrade = (props: QuickTradeProps) => {
  const { openConnectModal } = useConnectModal()
  const { address } = useWallet()
  const { chainId, isSupportedNetwork } = useNetwork()
  const { isDarkMode } = useICColorMode()
  const {
    isOpen: isSelectInputTokenOpen,
    onOpen: onOpenSelectInputToken,
    onClose: onCloseSelectInputToken,
  } = useDisclosure()
  const {
    isOpen: isSelectOutputTokenOpen,
    onOpen: onOpenSelectOutputToken,
    onClose: onCloseSelectOutputToken,
  } = useDisclosure()

  const protection = useProtection()

  const { slippage } = useSlippage()
  const {
    isBuying,
    buyToken,
    buyTokenList,
    buyTokenPrice,
    nativeTokenPrice,
    sellToken,
    sellTokenList,
    sellTokenPrice,
    changeBuyToken,
    changeSellToken,
    swapTokenLists,
  } = useTradeTokenLists()
  const { isLoading: isLoadingBalance, getTokenBalance } = useBalanceData()

  const supportedNetwork = isSupportedNetwork

  const [buttonLabel, setButtonLabel] = useState('')
  const [inputTokenAmountFormatted, setInputTokenAmountFormatted] = useState('')
  const [buyTokenAmountFormatted, setBuyTokenAmountFormatted] = useState('0.0')
  const [inputTokenBalanceFormatted, setInputTokenBalanceFormatted] =
    useState('0.0')
  const [outputTokenBalanceFormatted, setOutputTokenBalanceFormatted] =
    useState('0.0')
  const [sellTokenAmount, setSellTokenAmount] = useState('0')
  const [tradeInfoData, setTradeInfoData] = useState<TradeInfoItem[]>([])
  const [gasCostsInUsd, setGasCostsInUsd] = useState(0)
  const [navData, setNavData] = useState<TradeInfoItem>()

  const indexToken = isBuying ? buyToken : sellToken
  const { nav } = useTokenComponents(indexToken, isPerpToken(indexToken))

  useEffect(() => {
    if (tradeInfoData.length < 1) return
    if (nav <= 0) return
    const navTokenAmount = isBuying ? buyTokenAmountFormatted : sellTokenAmount
    const tokenFiat = isBuying
      ? parseFloat(buyTokenAmountFormatted) * buyTokenPrice
      : parseFloat(sellTokenAmount) * sellTokenPrice
    const proRatedMarketPrice = tokenFiat * Number(navTokenAmount)
    const proRatedNavPrice = nav * Number(navTokenAmount)
    const navDivergence =
      (proRatedMarketPrice - proRatedNavPrice) / proRatedMarketPrice / 100
    const navData: TradeInfoItem = {
      title: 'NAV',
      values: [
        proRatedNavPrice.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
      ],
      subValue: '(' + navDivergence.toFixed(2) + '%)',
      tooltip:
        'Net Asset Value (NAV) for an Index Coop token is the net value of the underlying tokens minus the value of the debt taken on (only applicable for leveraged tokens). Sometimes the price of a token will trade at a different value than its NAV',
    }
    const navIndex = 2
    var updatedInfoData = tradeInfoData
    updatedInfoData[navIndex] = navData
    setNavData(navData)
    setTradeInfoData(updatedInfoData)
  }, [nav, buyTokenAmountFormatted, sellTokenAmount])

  const {
    isFetchingZeroEx,
    isFetchingMoreOptions,
    fetchAndCompareOptions,
    quoteResult,
    quoteResultOptions,
  } = useBestQuote()

  const hasFetchingError = quoteResult.error !== null && !isFetchingZeroEx

  const zeroExAddress = getZeroExRouterAddress(chainId)

  const sellTokenAmountInWei = toWei(sellTokenAmount, sellToken.decimals)

  const sellTokenFiat = formattedFiat(
    parseFloat(sellTokenAmount),
    sellTokenPrice
  )
  const buyTokenFiat = formattedFiat(
    parseFloat(buyTokenAmountFormatted),
    buyTokenPrice
  )

  const priceImpact = isFetchingZeroEx
    ? null
    : getFormattedPriceImpact(
        parseFloat(sellTokenAmount),
        sellTokenPrice,
        parseFloat(buyTokenAmountFormatted),
        buyTokenPrice,
        isDarkMode
      )

  const {
    isApproved: isApprovedForSwap,
    isApproving: isApprovingForSwap,
    approve: onApproveForSwap,
  } = useApproval(sellToken, zeroExAddress, sellTokenAmountInWei)

  const { executeTrade, isTransacting } = useTrade()

  const hasInsufficientFunds = getHasInsufficientFunds(
    false,
    sellTokenAmountInWei,
    getTokenBalance(sellToken.symbol, chainId)
  )

  const contractBestOption = getZeroExRouterAddress(chainId)
  const contractBlockExplorerUrl = getBlockExplorerContractUrl(
    contractBestOption,
    chainId
  )

  const determineBestOption = async () => {
    if (quoteResult.error !== null) {
      setTradeInfoData([])
      return
    }

    const quoteZeroEx = quoteResult.quotes.zeroEx

    const formattedBuyTokenAmount = getFormattedOuputTokenAmount(
      false,
      buyToken.decimals,
      quoteZeroEx?.minOutput ?? BigNumber.from(0),
      BigNumber.from(0)
    )

    const gasCostsInUsd = quoteZeroEx?.gasCostsInUsd ?? 0
    setBuyTokenAmountFormatted(formattedBuyTokenAmount)
    const tradeInfoData = getTradeInfoData0x(
      buyToken,
      quoteZeroEx?.gasCosts ?? BigNumber.from(0),
      gasCostsInUsd,
      quoteZeroEx?.minOutput ?? BigNumber.from(0),
      quoteZeroEx?.sources ?? [],
      chainId,
      navData,
      slippage,
      shouldShowWarningSign(slippage)
    )
    setGasCostsInUsd(gasCostsInUsd)
    setTradeInfoData(tradeInfoData)
  }

  const resetTradeData = () => {
    setSellTokenAmount('0')
    setBuyTokenAmountFormatted('0.0')
    setGasCostsInUsd(0)
    setTradeInfoData([])
  }

  /**
   * Determine the best trade option.
   */
  useEffect(() => {
    determineBestOption()
  }, [quoteResult])

  useEffect(() => {
    resetTradeData()
  }, [chainId])

  const fetchOptions = useCallback(() => {
    if (requiresProtection) return
    // Right now we only allow setting the sell amount, so no need to check
    // buy token amount here
    const sellTokenInWei = toWei(sellTokenAmount, sellToken.decimals)
    if (sellTokenInWei.isZero() || sellTokenInWei.isNegative()) return
    fetchAndCompareOptions(
      sellToken,
      sellTokenAmount,
      sellTokenPrice,
      buyToken,
      buyTokenPrice,
      nativeTokenPrice,
      isBuying,
      slippage
    )
  }, [buyToken, sellToken, sellTokenAmount, slippage])

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  // Does user need protecting from productive assets?
  const [requiresProtection, setRequiresProtection] = useState(false)
  useEffect(() => {
    if (
      protection.isProtectable &&
      (sellToken.isDangerous || buyToken.isDangerous)
    ) {
      setRequiresProtection(true)
    } else {
      setRequiresProtection(false)
    }
  }, [protection, sellToken, buyToken])

  const getIsApproved = () => {
    return isApprovedForSwap
  }

  const getIsApproving = () => {
    return isApprovingForSwap
  }

  const getOnApprove = () => {
    return onApproveForSwap()
  }

  /**
   * Get the correct trade button label according to different states
   * @returns string label for trade button
   */
  useEffect(() => {
    const label = () => {
      if (!address) return 'Connect Wallet'
      if (!supportedNetwork) return 'Wrong Network'

      if (sellTokenAmount === '0') {
        return 'Enter an amount'
      }

      if (hasInsufficientFunds) {
        return 'Insufficient funds'
      }

      if (hasFetchingError) {
        return 'Try again'
      }

      const nativeToken = getNativeToken(chainId)
      const isNativeToken = nativeToken?.symbol === sellToken.symbol
      if (!isNativeToken && getIsApproving()) {
        return 'Approving...'
      }

      if (!isNativeToken && !getIsApproved()) {
        return 'Approve Tokens'
      }

      if (isTransacting) return 'Trading...'

      return 'Trade'
    }
    setButtonLabel(label())
  }, [
    address,
    isSupportedNetwork,
    isTransacting,
    sellToken,
    hasFetchingError,
    hasInsufficientFunds,
    sellTokenAmount,
    chainId,
  ])

  const onClickBetterQuote = () => {
    if (!quoteResultOptions.hasBetterQuote) return
    if (props.switchTabs) {
      props.switchTabs()
    }
  }

  const onChangeInputTokenAmount = (token: Token, input: string) => {
    if (input === '') {
      resetTradeData()
    }
    setInputTokenAmountFormatted(input || '')
    if (!isValidTokenInput(input, token.decimals)) return
    setSellTokenAmount(input || '')
  }

  const onClickInputBalance = () => {
    if (!inputTokenBalanceFormatted) return
    const fullTokenBalance = formatUnits(
      getTokenBalance(sellToken.symbol, chainId) ?? '0.0',
      sellToken.decimals
    )
    setInputTokenAmountFormatted(fullTokenBalance)
    setSellTokenAmount(fullTokenBalance)
  }

  const onClickOutputBalance = () => {
    if (!outputTokenBalanceFormatted) return
    const fullTokenBalance = formatUnits(
      getTokenBalance(buyToken.symbol, chainId) ?? '0.0',
      buyToken.decimals
    )
    setBuyTokenAmountFormatted(fullTokenBalance)
  }

  useEffect(() => {
    if (isLoadingBalance) return
    const tokenBal = getTokenBalance(sellToken.symbol, chainId)
    setInputTokenBalanceFormatted(formattedBalance(sellToken, tokenBal))
  }, [getTokenBalance, sellToken, isLoadingBalance])

  useEffect(() => {
    if (isLoadingBalance) return
    const tokenBal = getTokenBalance(buyToken.symbol, chainId)
    setOutputTokenBalanceFormatted(formattedBalance(buyToken, tokenBal))
  }, [getTokenBalance, buyToken, isLoadingBalance])

  const onClickTradeButton = async () => {
    if (!address && openConnectModal) {
      openConnectModal()
      return
    }

    if (hasInsufficientFunds) return

    if (hasFetchingError) {
      fetchOptions()
      return
    }

    const nativeToken = getNativeToken(chainId)
    const isNativeToken = nativeToken?.symbol === sellToken.symbol
    if (!getIsApproved() && !isNativeToken) {
      await getOnApprove()
      return
    }

    await executeTrade(quoteResult.quotes.zeroEx)
  }

  const onSwitchTokens = () => {
    swapTokenLists()
    resetTradeData()
  }

  const getButtonDisabledState = () => {
    if (!supportedNetwork) return true
    if (!address) return true
    if (hasFetchingError) return false
    return sellTokenAmount === '0' || hasInsufficientFunds || isTransacting
  }

  const isNarrow = props.isNarrowVersion ?? false

  // TradeButtonContainer
  const isButtonDisabled = getButtonDisabledState()
  const isLoading = getIsApproving() || isFetchingZeroEx

  // SelectTokenModal
  const inputTokenBalances = sellTokenList.map(
    (sellToken) =>
      getTokenBalance(sellToken.symbol, chainId) ?? BigNumber.from(0)
  )
  const outputTokenBalances = buyTokenList.map(
    (buyToken) => getTokenBalance(buyToken.symbol, chainId) ?? BigNumber.from(0)
  )
  const inputTokenItems = getSelectTokenListItems(
    sellTokenList,
    inputTokenBalances,
    chainId
  )
  const outputTokenItems = getSelectTokenListItems(
    buyTokenList,
    outputTokenBalances,
    chainId
  )

  // TradeDetail
  const showWarning = shouldShowWarningSign(slippage)
  const tokenPrices = getFormattedTokenPrices(
    sellToken.symbol,
    sellTokenPrice,
    buyToken.symbol,
    buyTokenPrice
  )

  const getBetterQuoteState = useCallback(() => {
    if (isFetchingMoreOptions) {
      return BetterQuoteState.fetchingQuote
    }

    if (quoteResultOptions.hasBetterQuote) {
      return quoteResultOptions.isReasonPriceImpact
        ? BetterQuoteState.betterQuotePriceImpact
        : BetterQuoteState.betterQuote
    }

    return BetterQuoteState.noBetterQuote
  }, [
    isFetchingMoreOptions,
    quoteResultOptions.hasBetterQuote,
    quoteResultOptions.isReasonPriceImpact,
  ])

  const betterQuoteState = getBetterQuoteState()

  return (
    <Box>
      <Flex direction='column' m='40px 0 20px'>
        <TradeInputSelector
          config={{
            isDarkMode,
            isInputDisabled: false,
            isNarrowVersion: isNarrow,
            isSelectorDisabled: false,
            isReadOnly: false,
            showMaxLabel: true,
          }}
          selectedToken={sellToken}
          selectedTokenAmount={inputTokenAmountFormatted}
          selectedTokenBalance={inputTokenBalanceFormatted}
          formattedFiat={sellTokenFiat}
          onChangeInput={onChangeInputTokenAmount}
          onClickBalance={onClickInputBalance}
          onSelectedToken={(_) => {
            if (inputTokenItems.length > 1) onOpenSelectInputToken()
          }}
        />
        <Box h='12px' alignSelf={'center'}>
          <IconButton
            background={colors.icGray1}
            margin={'-16px 0 0 0'}
            aria-label='switch buy/sell tokens'
            color={isDarkMode ? colors.icWhite : colors.black}
            icon={<UpDownIcon />}
            onClick={onSwitchTokens}
          />
        </Box>
        <TradeInputSelector
          config={{
            isDarkMode,
            isInputDisabled: true,
            isNarrowVersion: isNarrow,
            isSelectorDisabled: false,
            isReadOnly: true,
            showMaxLabel: false,
          }}
          selectedToken={buyToken}
          selectedTokenAmount={buyTokenAmountFormatted}
          selectedTokenBalance={outputTokenBalanceFormatted}
          formattedFiat={buyTokenFiat}
          priceImpact={priceImpact ?? undefined}
          onClickBalance={onClickOutputBalance}
          onSelectedToken={(_) => {
            if (outputTokenItems.length > 1) onOpenSelectOutputToken()
          }}
        />
      </Flex>
      <TradeButtonContainer
        indexToken={isBuying ? buyToken : sellToken}
        inputOutputToken={isBuying ? sellToken : buyToken}
        buttonLabel={buttonLabel}
        isButtonDisabled={isButtonDisabled}
        isLoading={isLoading}
        showMevProtectionMessage={false}
        onClickTradeButton={onClickTradeButton}
        contractAddress={contractBestOption}
        contractExplorerUrl={contractBlockExplorerUrl}
      >
        <>
          {tradeInfoData.length > 0 && (
            <TradeDetail
              data={tradeInfoData}
              gasPriceInUsd={gasCostsInUsd}
              prices={tokenPrices}
              showWarning={showWarning}
            />
          )}
          {tradeInfoData.length > 0 && (
            <Box my='16px'>
              <BetterQuoteView
                onClick={onClickBetterQuote}
                state={betterQuoteState}
                savingsUsd={quoteResultOptions.savingsUsd}
              />
            </Box>
          )}
          {hasFetchingError && (
            <Text align='center' color={colors.icRed} p='16px'>
              {quoteResult.error?.message ?? 'Error fetching quote'}
            </Text>
          )}
        </>
      </TradeButtonContainer>
      <SelectTokenModal
        isOpen={isSelectInputTokenOpen}
        onClose={onCloseSelectInputToken}
        onSelectedToken={(tokenSymbol) => {
          changeSellToken(tokenSymbol)
          onCloseSelectInputToken()
        }}
        items={inputTokenItems}
      />
      <SelectTokenModal
        isOpen={isSelectOutputTokenOpen}
        onClose={onCloseSelectOutputToken}
        onSelectedToken={(tokenSymbol) => {
          changeBuyToken(tokenSymbol)
          onCloseSelectOutputToken()
        }}
        items={outputTokenItems}
      />
    </Box>
  )
}

export default QuickTrade
