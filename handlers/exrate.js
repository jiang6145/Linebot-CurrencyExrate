import axios from 'axios'
import numeral from 'numeral'

export const getExrateData = async (currencyData) => {
  try {
    let { currency, currencyKey } = currencyData
    currencyKey = (currencyKey === 'USD') ? 'USDTWD' : 'USD' + currencyKey

    const response = await axios.get('https://tw.rter.info/capi.php')
    const exrateData = response.data

    for (const key in exrateData) {
      if (currencyKey === key) {
        // 因匯率 API 均以美金報價, 如果要以台幣兌換日幣的匯率, 需要以台幣兌美金匯率 / 日幣兌美金匯率 = 臺幣兌日幣匯率
        const basicCurrency = numeral(exrateData.USDTWD.Exrate)
        const exchangeCurrency = (currencyKey === 'USDTWD') ? 1 : exrateData[key].Exrate
        const exrate = basicCurrency.divide(exchangeCurrency).format('0.00')
        const updateTime = exrateData[key].UTC

        return {
          currency,
          exrate,
          updateTime
        }
      }
    }
  } catch (error) {
    console.log('exrate.js Error', error)
    return '找不到此貨幣匯率'
  }
}

export const exchangeCalculation = async (exchangeData) => {
  const positiveInteger = /^[0-9]*[1-9][0-9]*$/ // regExp => 正整數
  const { currency, currencyKey, moneyMsg } = exchangeData

  const exrate = await getExrateData({ currency, currencyKey })

  let money = numeral(moneyMsg).clone()
  let exchangeResult = numeral(moneyMsg).multiply(exrate.exrate)

  money = positiveInteger.test(money.value()) ? money.format('0,0') : money.format('0,0.00')
  exchangeResult = positiveInteger.test(exchangeResult.value()) ? exchangeResult.format('0,0') : exchangeResult.format('0,0.00')

  return {
    currency,
    exrate: exrate.exrate,
    updateTime: exrate.updateTime,
    money,
    exchange: exchangeResult
  }
}

export const getExrateReply = (exrate, bestBankExrate) => {
  const { bestCashBuy, bestCashSell, bestSpotBuy, bestSpotSell } = bestBankExrate

  const reply = {
    type: 'flex',
    altText: 'this is a flex message',
    contents: {
      type: 'carousel',
      contents: [
        {
          type: 'bubble',
          size: 'kilo',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: exrate.currency,
                contents: [],
                align: 'center',
                weight: 'bold'
              },
              {
                type: 'text',
                text: exrate.exrate,
                size: 'xl',
                align: 'center',
                margin: 'xl'
              },
              {
                type: 'text',
                text: exrate.updateTime,
                color: '#cccccc',
                size: 'xxs',
                margin: 'xl',
                align: 'center'
              }
            ],
            paddingAll: 'lg'
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: '查詢其它幣別',
                    size: 'xs',
                    color: '#ffffff',
                    align: 'center'
                  }
                ],
                borderWidth: '1px',
                borderColor: '#ffffff',
                cornerRadius: '6px',
                paddingAll: 'md',
                action: {
                  type: 'postback',
                  label: '查詢其它幣別',
                  data: '查詢其它幣別'
                }
              }
            ],
            backgroundColor: '#464F69'
          }
        }
      ]
    }
  }

  if (bestSpotBuy && bestSpotSell) {
    reply.contents.contents.push({
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '即期',
                size: 'xs',
                color: '#ffffff',
                align: 'center'
              }
            ],
            width: '53px',
            height: '18px',
            backgroundColor: '#ff334b',
            cornerRadius: '20px',
            justifyContent: 'center'
          },
          {
            type: 'text',
            text: '最佳換匯銀行',
            size: 'sm',
            weight: 'bold',
            align: 'end',
            color: '#ffffff'
          }
        ],
        backgroundColor: '#464F69'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: '你要買' + exrate.currency,
                    size: 'xs'
                  },
                  {
                    type: 'text',
                    text: bestSpotSell.exrate,
                    size: 'lg',
                    margin: 'lg'
                  },
                  {
                    type: 'text',
                    text: bestSpotSell.bank,
                    size: 'xs',
                    margin: 'lg'
                  }
                ],
                alignItems: 'center'
              },
              {
                type: 'separator',
                color: '#464F69'
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: '你要賣' + exrate.currency,
                    size: 'xs'
                  },
                  {
                    type: 'text',
                    text: bestSpotBuy.exrate,
                    size: 'lg',
                    margin: 'lg'
                  },
                  {
                    type: 'text',
                    text: bestSpotBuy.bank,
                    size: 'xs',
                    margin: 'lg'
                  }
                ],
                alignItems: 'center'
              }
            ]
          }
        ],
        justifyContent: 'space-around',
        paddingAll: 'none'
      }
    })
  }

  if (bestCashBuy && bestCashSell) {
    console.log('添加現鈔')
    reply.contents.contents.push({
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '現鈔',
                size: 'xs',
                color: '#ffffff',
                align: 'center'
              }
            ],
            width: '53px',
            height: '18px',
            backgroundColor: '#ff334b',
            cornerRadius: '20px',
            justifyContent: 'center'
          },
          {
            type: 'text',
            text: '最佳換匯銀行',
            size: 'sm',
            weight: 'bold',
            align: 'end',
            color: '#ffffff'
          }
        ],
        backgroundColor: '#464F69'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: '你要買' + exrate.currency,
                    size: 'xs'
                  },
                  {
                    type: 'text',
                    text: bestCashSell.exrate,
                    size: 'lg',
                    margin: 'lg'
                  },
                  {
                    type: 'text',
                    text: bestCashSell.bank,
                    size: 'xs',
                    margin: 'lg'
                  }
                ],
                alignItems: 'center'
              },
              {
                type: 'separator',
                color: '#464F69'
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: '你要賣' + exrate.currency,
                    size: 'xs'
                  },
                  {
                    type: 'text',
                    text: bestCashBuy.exrate,
                    size: 'lg',
                    margin: 'lg'
                  },
                  {
                    type: 'text',
                    text: bestCashBuy.bank,
                    size: 'xs',
                    margin: 'lg'
                  }
                ],
                alignItems: 'center'
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '不計算手續費',
                size: 'xxs',
                color: '#ff334b',
                align: 'center'
              }
            ],
            position: 'absolute',
            offsetBottom: 'xs',
            offsetEnd: '0px',
            offsetStart: '0px'
          }
        ],
        justifyContent: 'space-around',
        paddingAll: 'none'
      }
    })
  }

  return reply
}

export const getExchangeReply = (exchangeResult) => {
  const { currency, exrate, updateTime, money, exchange } = exchangeResult
  return {
    type: 'flex',
    altText: 'this is a flex message',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: `兌換${money}${currency}試算`,
                size: 'xxs',
                color: '#ffffff'
              }
            ],
            backgroundColor: '#ff334b',
            position: 'absolute',
            paddingTop: '3px',
            paddingBottom: '3px',
            paddingStart: '8px',
            paddingEnd: '8px',
            cornerRadius: '20px',
            offsetTop: 'md',
            offsetStart: 'lg'
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: '台幣',
                    size: 'sm'
                  },
                  {
                    type: 'text',
                    text: exchange,
                    margin: 'sm',
                    wrap: true
                  }
                ],
                alignItems: 'center'
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: '⇌',
                    size: 'xl',
                    weight: 'bold'
                  }
                ],
                justifyContent: 'center',
                alignItems: 'center',
                flex: 0
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: currency,
                    size: 'sm'
                  },
                  {
                    type: 'text',
                    text: money,
                    margin: 'sm',
                    wrap: true
                  }
                ],
                alignItems: 'center'
              }
            ],
            margin: 'xxl',
            paddingTop: 'md',
            paddingBottom: 'md'
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `以國際匯率計算 : ${currency}匯率 ${exrate}`,
            size: 'xs',
            color: '#ffffff',
            align: 'center'
          },
          {
            type: 'text',
            text: updateTime,
            size: 'xxs',
            color: '#cccccc',
            align: 'center',
            margin: 'sm'
          }
        ],
        backgroundColor: '#464F69'
      }
    }
  }
}
