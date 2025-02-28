import {
  BedIndex,
  Bitcoin2xFlexibleLeverageIndex,
  DAI,
  DefiPulseIndex,
  DiversifiedStakedETHIndex,
  ETH,
  Ethereum2xFlexibleLeverageIndex,
  FIXED_DAI,
  FIXED_USDC,
  GitcoinStakedETHIndex,
  ic21,
  icETHIndex,
  LeveragedRethStakingYield,
  mainnetCurrencyTokens,
  MATIC,
  MetaverseIndex,
  MoneyMarketIndex,
  optimismCurrencyTokens,
  polygonCurrencyTokens,
  STETH,
  USDC,
  WETH,
} from '@/constants/tokens'

import {
  getAddressForToken,
  getCurrencyTokens,
  getCurrencyTokensForIndex,
  getNativeToken,
  isLeveragedToken,
} from './tokens'

describe('getAddressForToken()', () => {
  test('should return undefined for undefined chain', async () => {
    const address = getAddressForToken(WETH, undefined)
    expect(address).toBeUndefined()
  })

  test('should return correct token address for WETH on Ethereum', async () => {
    const address = getAddressForToken(WETH, 1)
    expect(address).toBeDefined()
    expect(address).toEqual(WETH.address)
  })

  test('should return correct token address for WETH on Optimism', async () => {
    const address = getAddressForToken(WETH, 10)
    expect(address).toBeDefined()
    expect(address).toEqual(WETH.optimismAddress)
  })

  test('should return correct token address for WETH on Polygon', async () => {
    const address = getAddressForToken(WETH, 137)
    expect(address).toBeDefined()
    expect(address).toEqual(WETH.polygonAddress)
  })
})

describe('getCurrencyTokens()', () => {
  test('returns empty array for unsupported chain', async () => {
    const currencyTokens = getCurrencyTokens(100)
    expect(currencyTokens).toEqual([])
  })

  test('returns correct currency tokens for mainnet', async () => {
    const currencyTokens = getCurrencyTokens(1)
    expect(currencyTokens).toEqual(mainnetCurrencyTokens)
  })

  test('returns correct currency tokens for optimism', async () => {
    const currencyTokens = getCurrencyTokens(10)
    expect(currencyTokens).toEqual(optimismCurrencyTokens)
  })

  test('returns correct currency tokens for polygon', async () => {
    const currencyTokens = getCurrencyTokens(137)
    expect(currencyTokens).toEqual(polygonCurrencyTokens)
  })
})

describe('getCurrencyTokensForIndex()', () => {
  test('returns default currency tokens', async () => {
    const chainId = 1
    const token = DefiPulseIndex
    const defaultTokens = getCurrencyTokens(chainId)
    const currencyTokens = getCurrencyTokensForIndex(token, chainId, true)
    expect(currencyTokens.length).toEqual(defaultTokens.length)
    expect(currencyTokens).toEqual(defaultTokens)
  })

  test('returns DAI only for FIXED-DAI', async () => {
    const chainId = 1
    const token = FIXED_DAI
    const currencyTokens = getCurrencyTokensForIndex(token, chainId, true)
    expect(currencyTokens.length).toEqual(1)
    expect(currencyTokens).toEqual([DAI])
  })

  test('returns USDC only for FIXED-USDC', async () => {
    const chainId = 1
    const token = FIXED_USDC
    const currencyTokens = getCurrencyTokensForIndex(token, chainId, true)
    expect(currencyTokens.length).toEqual(1)
    expect(currencyTokens).toEqual([USDC])
  })

  test('returns correct currency tokens for ic21', async () => {
    const chainId = 1
    const isMinting = true
    const token = ic21
    const currencyTokens = getCurrencyTokensForIndex(token, chainId, isMinting)
    expect(currencyTokens.length).toEqual(2)
    expect(currencyTokens).toEqual([ETH, WETH])
  })

  test('returns correct currency tokens for icETH', async () => {
    const chainId = 1
    const isMinting = true
    const token = icETHIndex
    const currencyTokens = getCurrencyTokensForIndex(token, chainId, isMinting)
    expect(currencyTokens.length).toEqual(2)
    expect(currencyTokens).toEqual([ETH, STETH])
  })

  test('returns correct currency tokens for icETH - when redeeming', async () => {
    const chainId = 1
    const isMinting = false
    const token = icETHIndex
    const currencyTokens = getCurrencyTokensForIndex(token, chainId, isMinting)
    expect(currencyTokens.length).toEqual(2)
    expect(currencyTokens).toEqual([ETH, STETH])
  })

  test('returns correct currency tokens for dsETH', async () => {
    const chainId = 1
    const token = DiversifiedStakedETHIndex
    const requiredTokens = [
      'ETH',
      'WETH',
      'stETH',
      'wstETH',
      'rETH',
      'sETH2',
      'USDC',
    ]
    const currencyTokens = getCurrencyTokensForIndex(token, chainId, true)
    expect(currencyTokens.length).toEqual(requiredTokens.length)
    for (let requiredToken of requiredTokens) {
      expect(
        currencyTokens.filter((currency) => currency.symbol === requiredToken)
          .length
      ).toEqual(1)
    }
  })

  test('returns correct currency tokens for icRETH', async () => {
    const chainId = 1
    const token = LeveragedRethStakingYield
    const requiredTokens = ['ETH', 'WETH', 'rETH', 'USDC']
    const currencyTokens = getCurrencyTokensForIndex(token, chainId, true)
    expect(currencyTokens.length).toEqual(requiredTokens.length)
    for (let requiredToken of requiredTokens) {
      expect(
        currencyTokens.filter((currency) => currency.symbol === requiredToken)
          .length
      ).toEqual(1)
    }
  })

  test('returns correct currency tokens for gtcETH', async () => {
    const chainId = 1
    const token = GitcoinStakedETHIndex
    const requiredTokens = [
      'ETH',
      'WETH',
      'stETH',
      'wstETH',
      'rETH',
      'sETH2',
      'USDC',
    ]
    const currencyTokens = getCurrencyTokensForIndex(token, chainId, true)
    expect(currencyTokens.length).toEqual(requiredTokens.length)
    for (let requiredToken of requiredTokens) {
      expect(
        currencyTokens.filter((currency) => currency.symbol === requiredToken)
          .length
      ).toEqual(1)
    }
  })

  test('returns correct currency tokens for gtcETH', async () => {
    const chainId = 1
    const token = MoneyMarketIndex
    const requiredTokens = ['DAI', 'USDC', 'USDT', 'WETH']
    const currencyTokens = getCurrencyTokensForIndex(token, chainId, true)
    expect(currencyTokens.length).toEqual(requiredTokens.length)
    for (let requiredToken of requiredTokens) {
      expect(
        currencyTokens.filter((currency) => currency.symbol === requiredToken)
          .length
      ).toEqual(1)
    }
  })
})

describe('getNativeToken()', () => {
  test('should return undefined for undefined chain', async () => {
    const nativeToken = getNativeToken(undefined)
    expect(nativeToken).toBeNull()
  })

  test('should return correct token address for WETH on Ethereum', async () => {
    const nativeToken = getNativeToken(1)
    expect(nativeToken).toBeDefined()
    expect(nativeToken).toEqual(ETH)
  })

  test('should return correct token address for WETH on Optimism', async () => {
    const nativeToken = getNativeToken(10)
    expect(nativeToken).toBeDefined()
    expect(nativeToken).toEqual(ETH)
  })

  test('should return correct token address for WETH on Polygon', async () => {
    const nativeToken = getNativeToken(137)
    expect(nativeToken).toBeDefined()
    expect(nativeToken).toEqual(MATIC)
  })
})

describe('isLeveragedToken()', () => {
  test('should return false for non leveraged tokens', async () => {
    const bed = isLeveragedToken(BedIndex)
    const dpi = isLeveragedToken(DefiPulseIndex)
    const dsEth = isLeveragedToken(DiversifiedStakedETHIndex)
    const mvi = isLeveragedToken(MetaverseIndex)
    expect(bed).toBe(false)
    expect(dpi).toBe(false)
    expect(dsEth).toBe(false)
    expect(mvi).toBe(false)
  })

  test('should return true for leveraged tokens', async () => {
    const btc2xFli = isLeveragedToken(Bitcoin2xFlexibleLeverageIndex)
    const eth2xFli = isLeveragedToken(Ethereum2xFlexibleLeverageIndex)
    const icEth = isLeveragedToken(icETHIndex)
    expect(btc2xFli).toBe(true)
    expect(eth2xFli).toBe(true)
    expect(icEth).toBe(true)
  })
})
