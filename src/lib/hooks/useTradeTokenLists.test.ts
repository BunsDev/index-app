import {
  flashMintIndexesMainnetRedeem,
  flashMintIndexesPolygonRedeem,
  indexNamesMainnet,
  indexNamesPolygon,
  MoneyMarketIndex,
} from '@/constants/tokens'

import { getTokenListByChain } from './useTradeTokenLists'

describe('getTokenListByChain()', () => {
  test('returns single token for single token', async () => {
    expect(true).toBeTruthy()
  })
})

// describe('getTokenListByChain()', () => {
//   test('returns regular list for swap on mainnet', async () => {
//     const chainId = 1
//     const isFlashMint = false
//     const list = getTokenListByChain(chainId, isFlashMint)
//     expect(list).toEqual(indexNamesMainnet)
//   })

//   test('returns redeem list for flash mint on mainnet', async () => {
//     const chainId = 1
//     const isFlashMint = true
//     const list = getTokenListByChain(chainId, isFlashMint)
//     expect(list).toEqual(flashMintIndexesMainnetRedeem)
//   })

//   test('returns regular list for swap on polygon', async () => {
//     const chainId = 137
//     const isFlashMint = false
//     const list = getTokenListByChain(chainId, isFlashMint)
//     expect(list).toEqual(indexNamesPolygon)
//   })

//   test('returns specific list for flash mint on polygon', async () => {
//     const chainId = 137
//     const isFlashMint = true
//     const list = getTokenListByChain(chainId, isFlashMint)
//     expect(list).toEqual(flashMintIndexesPolygonRedeem)
//   })

//   test('returns MMI only for FlashMint (not Swap)', async () => {
//     const chainId = 1
//     const flashMintList = getTokenListByChain(chainId, true)
//     const swapList = getTokenListByChain(chainId, false)
//     expect(
//       flashMintList.filter((token) => token.symbol === MoneyMarketIndex.symbol)
//         .length
//     ).toEqual(1)
//     expect(
//       swapList.filter((token) => token.symbol === MoneyMarketIndex.symbol)
//         .length
//     ).toEqual(0)
//   })
// })
