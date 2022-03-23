import { createContext, useContext, useEffect, useState } from 'react'

import BigNumberJs from 'bignumber.js'
import {
  CoinGeckoCoinPrices,
  Position,
  SetDetails,
} from 'set.js/dist/types/src/types'

import { useEthers } from '@usedapp/core'

import { MAINNET, POLYGON } from 'constants/chains'
import {
  BedIndex,
  Bitcoin2xFlexibleLeverageIndex,
  Bitcoin2xFLIP,
  DataIndex,
  DefiPulseIndex,
  Ethereum2xFlexibleLeverageIndex,
  Ethereum2xFLIP,
  GmiIndex,
  IBitcoinFLIP,
  icETHIndex,
  IEthereumFLIP,
  IMaticFLIP,
  Matic2xFLIP,
  MetaverseIndex,
} from 'constants/tokens'
import { useMarketData } from 'providers/MarketData/MarketDataProvider'
import { getSetDetails } from 'utils/setjsApi'
import { getTokenList, TokenData as Token } from 'utils/tokenlists'

const ASSET_PLATFORM = 'ethereum'
const VS_CURRENCY = 'usd'

export function useSetComponents() {
  return { ...useContext(SetComponentsContext) }
}

const SetComponentsProvider = (props: { children: any }) => {
  const {
    selectLatestMarketData,
    dpi,
    mvi,
    bed,
    data,
    ethfli,
    ethflip,
    btcfli,
    gmi,
    iethflip,
    maticflip,
    imaticflip,
    btcflip,
    ibtcflip,
    iceth,
  } = useMarketData()
  const [dpiComponents, setDpiComponents] = useState<SetComponent[]>([])
  const [mviComponents, setMviComponents] = useState<SetComponent[]>([])
  const [bedComponents, setBedComponents] = useState<SetComponent[]>([])
  const [gmiComponents, setGmiComponents] = useState<SetComponent[]>([])
  const [eth2xfliComponents, setEth2xfliComponents] = useState<SetComponent[]>(
    []
  )
  const [eth2xflipComponents, setEth2xflipComponents] = useState<
    SetComponent[]
  >([])
  const [btc2xfliComponents, setBtc2xfliComponents] = useState<SetComponent[]>(
    []
  )
  const [dataComponents, setDataComponents] = useState<SetComponent[]>([])

  const [iethflipComponents, setIEthflipComponents] = useState<SetComponent[]>(
    []
  )

  const [matic2xflipComponents, setMatic2xflipComponents] = useState<
    SetComponent[]
  >([])

  const [imaticflipComponents, setIMaticflipComponents] = useState<
    SetComponent[]
  >([])

  const [btc2xflipComponents, setBtc2xflipComponents] = useState<
    SetComponent[]
  >([])
  const [ibtcflipComponents, setIBtcflipComponents] = useState<SetComponent[]>(
    []
  )
  const [icethComponents, setIcethComponents] = useState<SetComponent[]>([])

  const { account, chainId, library } = useEthers()
  const tokenList = getTokenList(chainId)

  useEffect(() => {
    if (
      chainId &&
      chainId === MAINNET.chainId &&
      account &&
      library &&
      tokenList &&
      DefiPulseIndex.address &&
      MetaverseIndex.address &&
      BedIndex.address &&
      GmiIndex.address &&
      Ethereum2xFlexibleLeverageIndex.address &&
      Bitcoin2xFlexibleLeverageIndex.address &&
      DataIndex.address &&
      dpi &&
      mvi &&
      bed &&
      data &&
      gmi &&
      ethfli &&
      ethflip &&
      btcfli &&
      iceth &&
      icETHIndex.address
    ) {
      getSetDetails(
        library,
        [
          DefiPulseIndex.address,
          MetaverseIndex.address,
          BedIndex.address,
          GmiIndex.address,
          Ethereum2xFlexibleLeverageIndex.address,
          Bitcoin2xFlexibleLeverageIndex.address,
          DataIndex.address,
          icETHIndex.address,
        ],
        chainId
      ).then(async (result) => {
        const [
          dpiSet,
          mviSet,
          bedSet,
          gmiSet,
          eth2xfliSet,
          btc2xfliSet,
          dataSet,
          icethSet,
        ] = result

        const dpiComponentPrices = await getPositionPrices(dpiSet)
        if (dpiComponentPrices != null) {
          const dpiPositions = dpiSet.positions.map(async (position) => {
            return await convertPositionToSetComponent(
              position,
              tokenList,
              dpiComponentPrices[position.component.toLowerCase()]?.[
                VS_CURRENCY
              ],
              dpiComponentPrices[position.component.toLowerCase()]?.[
                `${VS_CURRENCY}_24h_change`
              ],
              selectLatestMarketData(dpi.hourlyPrices)
            )
          })
          Promise.all(dpiPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setDpiComponents)
        }

        const mviComponentPrices = await getPositionPrices(mviSet)
        if (mviComponentPrices != null) {
          const mviPositions = mviSet.positions.map(async (position) => {
            return await convertPositionToSetComponent(
              position,
              tokenList,
              mviComponentPrices[position.component.toLowerCase()]?.[
                VS_CURRENCY
              ],
              mviComponentPrices[position.component.toLowerCase()]?.[
                `${VS_CURRENCY}_24h_change`
              ],

              selectLatestMarketData(mvi.hourlyPrices)
            )
          })
          Promise.all(mviPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setMviComponents)
        }

        const bedComponentPrices = await getPositionPrices(bedSet)
        if (bedComponentPrices != null) {
          const bedPositions = bedSet.positions.map(async (position) => {
            return await convertPositionToSetComponent(
              position,
              tokenList,
              bedComponentPrices[position.component.toLowerCase()]?.[
                VS_CURRENCY
              ],
              bedComponentPrices[position.component.toLowerCase()]?.[
                `${VS_CURRENCY}_24h_change`
              ],

              selectLatestMarketData(bed.hourlyPrices)
            )
          })
          Promise.all(bedPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setBedComponents)
        }

        const gmiComponentPrices = await getPositionPrices(gmiSet)
        if (gmiComponentPrices != null) {
          const gmiPositions = gmiSet.positions.map(async (position) => {
            return await convertPositionToSetComponent(
              position,
              tokenList,
              gmiComponentPrices[position.component.toLowerCase()]?.[
                VS_CURRENCY
              ],
              gmiComponentPrices[position.component.toLowerCase()]?.[
                `${VS_CURRENCY}_24h_change`
              ],

              selectLatestMarketData(gmi.hourlyPrices)
            )
          })
          Promise.all(gmiPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setGmiComponents)
        }

        const eth2xfliComponentPrices = await getPositionPrices(eth2xfliSet)
        if (eth2xfliComponentPrices != null) {
          const eth2xfliPositions = eth2xfliSet.positions.map(
            async (position) => {
              return await convertPositionToSetComponent(
                position,
                tokenList,
                eth2xfliComponentPrices[position.component.toLowerCase()]?.[
                  VS_CURRENCY
                ],
                eth2xfliComponentPrices[position.component.toLowerCase()]?.[
                  `${VS_CURRENCY}_24h_change`
                ],

                selectLatestMarketData(ethfli.hourlyPrices)
              )
            }
          )
          Promise.all(eth2xfliPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setEth2xfliComponents)
        }

        const btc2xfliComponentPrices = await getPositionPrices(btc2xfliSet)
        if (btc2xfliComponentPrices != null) {
          const btc2xfliPositions = btc2xfliSet.positions.map(
            async (position) => {
              return await convertPositionToSetComponent(
                position,
                tokenList,
                btc2xfliComponentPrices[position.component.toLowerCase()]?.[
                  VS_CURRENCY
                ],
                btc2xfliComponentPrices[position.component.toLowerCase()]?.[
                  `${VS_CURRENCY}_24h_change`
                ],

                selectLatestMarketData(btcfli.hourlyPrices)
              )
            }
          )
          Promise.all(btc2xfliPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setBtc2xfliComponents)
        }

        const dataComponentPrices = await getPositionPrices(dataSet)
        if (dataComponentPrices != null) {
          const dataPositions = dataSet.positions.map(async (position) => {
            return await convertPositionToSetComponent(
              position,
              tokenList,
              dataComponentPrices[position.component.toLowerCase()]?.[
                VS_CURRENCY
              ],
              dataComponentPrices[position.component.toLowerCase()]?.[
                `${VS_CURRENCY}_24h_change`
              ],

              selectLatestMarketData(data.hourlyPrices)
            )
          })
          Promise.all(dataPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setDataComponents)
        }

        const icethComponentPrices = await getPositionPrices(icethSet)
        if (icethComponentPrices != null) {
          const icethPositions = icethSet.positions.map(async (position) => {
            return await convertPositionToSetComponent(
              position,
              tokenList,
              icethComponentPrices[position.component.toLowerCase()]?.[
                VS_CURRENCY
              ],
              icethComponentPrices[position.component.toLowerCase()]?.[
                `${VS_CURRENCY}_24h_change`
              ],

              selectLatestMarketData(data.hourlyPrices)
            )
          })
          Promise.all(icethPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setIcethComponents)
        }
      })
    }
  }, [
    library,
    tokenList,
    dpi,
    mvi,
    chainId,
    bed,
    gmi,
    ethfli,
    btcfli,
    data,
    iceth,
    selectLatestMarketData(),
  ])

  useEffect(() => {
    if (
      chainId &&
      chainId === POLYGON.chainId &&
      library &&
      tokenList &&
      ethflip &&
      iethflip &&
      maticflip &&
      imaticflip &&
      btcflip &&
      ibtcflip &&
      Ethereum2xFLIP.polygonAddress &&
      IEthereumFLIP.polygonAddress &&
      Matic2xFLIP.polygonAddress &&
      IMaticFLIP.polygonAddress &&
      Bitcoin2xFLIP.polygonAddress &&
      IBitcoinFLIP.polygonAddress
    ) {
      getSetDetails(
        library,
        [
          Ethereum2xFLIP.polygonAddress,
          IEthereumFLIP.polygonAddress,
          Matic2xFLIP.polygonAddress,
          IMaticFLIP.polygonAddress,
          Bitcoin2xFLIP.polygonAddress,
          IBitcoinFLIP.polygonAddress,
        ],
        chainId
      )
        .then(async (result) => {
          const [
            ethflipSet,
            iethflipSet,
            maticflipSet,
            imaticflipSet,
            btcflipSet,
            ibtcflipSet,
          ] = result
          const ethFlipComponentPrices = await getPositionPrices(
            ethflipSet,
            'polygon-pos'
          )
          const ethFlipPositions = ethflipSet.positions.map(
            async (position) => {
              return await convertPositionToSetComponent(
                position,
                tokenList,
                ethFlipComponentPrices[position.component.toLowerCase()]?.[
                  VS_CURRENCY
                ],
                ethFlipComponentPrices[position.component.toLowerCase()]?.[
                  `${VS_CURRENCY}_24h_change`
                ],

                selectLatestMarketData(ethflip.hourlyPrices)
              )
            }
          )
          Promise.all(ethFlipPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setEth2xflipComponents)

          const iethFlipComponentPrices = await getPositionPrices(
            iethflipSet,
            'polygon-pos'
          )
          const iethFlipPositions = iethflipSet.positions.map(
            async (position) => {
              return await convertPositionToSetComponent(
                position,
                tokenList,
                iethFlipComponentPrices[position.component.toLowerCase()]?.[
                  VS_CURRENCY
                ],
                iethFlipComponentPrices[position.component.toLowerCase()]?.[
                  `${VS_CURRENCY}_24h_change`
                ],

                selectLatestMarketData(iethflip.hourlyPrices)
              )
            }
          )
          Promise.all(iethFlipPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setIEthflipComponents)

          const maticFlipComponentPrices = await getPositionPrices(
            maticflipSet,
            'polygon-pos'
          )
          const maticFlipPositions = maticflipSet.positions.map(
            async (position) => {
              return await convertPositionToSetComponent(
                position,
                tokenList,
                maticFlipComponentPrices[position.component.toLowerCase()]?.[
                  VS_CURRENCY
                ],
                maticFlipComponentPrices[position.component.toLowerCase()]?.[
                  `${VS_CURRENCY}_24h_change`
                ],

                selectLatestMarketData(maticflip.hourlyPrices)
              )
            }
          )
          Promise.all(maticFlipPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setMatic2xflipComponents)

          const imaticFlipComponentPrices = await getPositionPrices(
            imaticflipSet,
            'polygon-pos'
          )
          const imaticFlipPositions = imaticflipSet.positions.map(
            async (position) => {
              return await convertPositionToSetComponent(
                position,
                tokenList,
                imaticFlipComponentPrices[position.component.toLowerCase()]?.[
                  VS_CURRENCY
                ],
                imaticFlipComponentPrices[position.component.toLowerCase()]?.[
                  `${VS_CURRENCY}_24h_change`
                ],

                selectLatestMarketData(imaticflip.hourlyPrices)
              )
            }
          )
          Promise.all(imaticFlipPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setIMaticflipComponents)

          const btcflipComponentPrices = await getPositionPrices(
            btcflipSet,
            'polygon-pos'
          )
          const btcflipPositions = btcflipSet.positions.map(
            async (position) => {
              return await convertPositionToSetComponent(
                position,
                tokenList,
                btcflipComponentPrices[position.component.toLowerCase()]?.[
                  VS_CURRENCY
                ],
                btcflipComponentPrices[position.component.toLowerCase()]?.[
                  `${VS_CURRENCY}_24h_change`
                ],

                selectLatestMarketData(btcflip.hourlyPrices)
              )
            }
          )
          Promise.all(btcflipPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setBtc2xflipComponents)
          ///

          const ibtcFlipComponentPrices = await getPositionPrices(
            ibtcflipSet,
            'polygon-pos'
          )
          const ibtcFlipPositions = ibtcflipSet.positions.map(
            async (position) => {
              return await convertPositionToSetComponent(
                position,
                tokenList,
                ibtcFlipComponentPrices[position.component.toLowerCase()]?.[
                  VS_CURRENCY
                ],
                ibtcFlipComponentPrices[position.component.toLowerCase()]?.[
                  `${VS_CURRENCY}_24h_change`
                ],

                selectLatestMarketData(ibtcflip.hourlyPrices)
              )
            }
          )
          Promise.all(ibtcFlipPositions)
            .then(sortPositionsByPercentOfSet)
            .then(setIBtcflipComponents)
        })
        .catch((err) => console.log('err', err))
    }
  }, [chainId, library, tokenList, ethflip, selectLatestMarketData()])

  return (
    <SetComponentsContext.Provider
      value={{
        dpiComponents: dpiComponents,
        mviComponents: mviComponents,
        bedComponents: bedComponents,
        gmiComponents: gmiComponents,
        eth2xfliComponents: eth2xfliComponents,
        eth2xflipComponents: eth2xflipComponents,
        btc2xfliComponents: btc2xfliComponents,
        dataComponents: dataComponents,
        iethflipComponents: iethflipComponents,
        imaticflipComponents: imaticflipComponents,
        matic2xflipComponents: matic2xflipComponents,
        ibtcflipComponents: ibtcflipComponents,
        btc2xflipComponents: btc2xflipComponents,
        icethComponents: icethComponents,
      }}
    >
      {props.children}
    </SetComponentsContext.Provider>
  )
}

async function convertPositionToSetComponent(
  position: Position,
  tokenList: Token[],
  componentPriceUsd: number,
  componentPriceChangeUsd: number,
  setPriceUsd: number
): Promise<SetComponent> {
  const token = getTokenForPosition(tokenList, position)
  if (token === undefined) {
    return {
      address: position.component,
      id: position.component,
      quantity: '',
      symbol: 'SYM',
      name: position.component,
      image: '',
      totalPriceUsd: '0',
      dailyPercentChange: '0',
      percentOfSet: '0',
      percentOfSetNumber: 0,
    }
  }

  const quantity = new BigNumberJs(position.unit.toString()).div(
    new BigNumberJs(10).pow(token.decimals)
  )
  const totalPriceUsd = quantity.multipliedBy(componentPriceUsd)
  const percentOfSet = totalPriceUsd.dividedBy(setPriceUsd).multipliedBy(100)

  return {
    address: position.component,
    id: token.name.toLowerCase(),
    quantity: quantity.toString(),
    symbol: token.symbol,
    name: token.name,
    image: token.logoURI,
    totalPriceUsd: totalPriceUsd.toString(),
    dailyPercentChange: componentPriceChangeUsd.toString(),
    percentOfSet: percentOfSet.toPrecision(4).toString(),
    percentOfSetNumber: Number(percentOfSet.toPrecision(4)),
  }
}

function getTokenForPosition(tokenList: Token[], position: Position): Token {
  const matchingTokens = tokenList.filter(
    (t) => t.address.toLowerCase() === position.component.toLowerCase()
  )
  if (matchingTokens.length === 0) {
    console.warn(
      `No token for position ${position.component} exists in token lists`
    )
  } else if (matchingTokens.length > 1) {
    console.warn(
      `Multiple tokens for position ${position.component} exist in token lists`
    )
  }
  return matchingTokens[0]
}

function sortPositionsByPercentOfSet(
  components: SetComponent[]
): SetComponent[] {
  return components.sort((a, b) => {
    if (b.percentOfSetNumber > a.percentOfSetNumber) return 1
    if (b.percentOfSetNumber < a.percentOfSetNumber) return -1
    return 0
  })
}

async function getPositionPrices(
  setDetails: SetDetails,
  assetPlatform: string = ASSET_PLATFORM
): Promise<CoinGeckoCoinPrices> {
  const componentAddresses = setDetails.positions.map((p) => p.component)
  return fetch(
    `https://api.coingecko.com/api/v3/simple/token_price/${assetPlatform}?vs_currencies=${VS_CURRENCY}&contract_addresses=${componentAddresses}&include_24hr_change=true`
  )
    .then((response) => response.json())
    .catch((e) => {
      console.error(e)
      return null
    })
}

export default SetComponentsProvider

interface SetComponentsProps {
  dpiComponents?: SetComponent[]
  mviComponents?: SetComponent[]
  bedComponents?: SetComponent[]
  gmiComponents?: SetComponent[]
  eth2xfliComponents?: SetComponent[]
  eth2xflipComponents?: SetComponent[]
  btc2xfliComponents?: SetComponent[]
  dataComponents?: SetComponent[]
  iethflipComponents?: SetComponent[]
  imaticflipComponents?: SetComponent[]
  matic2xflipComponents?: SetComponent[]
  btc2xflipComponents?: SetComponent[]
  ibtcflipComponents?: SetComponent[]
  icethComponents?: SetComponent[]
}

export const SetComponentsContext = createContext<SetComponentsProps>({})

export interface SetComponent {
  /**
   * Token address
   * @example "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
   */
  address: string

  /**
   * Token id
   * @example "uniswap"
   */
  id: string

  /**
   * Token image URL
   * @example "https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png"
   */
  image: string

  /**
   * Token name
   * @example "Uniswap"
   */
  name: string

  /**
   * The percent of USD this component makes up in the Set.
   * Equivalant to totalPriceUsd / total price of set in USD
   */
  percentOfSet: string

  /**
   * The percent of USD this component makes up in the Set.
   * Equivalant to totalPriceUsd / total price of set in USD
   */
  percentOfSetNumber: number

  /**
   * Quantity of component in the Set
   */
  quantity: string

  /**
   * Token symbol
   * @example "UNI"
   */
  symbol: string

  /**
   * Total price of this component. This is equivalant to quantity of
   * component * price of component.
   */
  totalPriceUsd: string

  /**
   * Daily percent price change of this component
   */
  dailyPercentChange: string
}
