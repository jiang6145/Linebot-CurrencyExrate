import axios from 'axios'
import cheerio from 'cheerio'
import numeral from 'numeral'

export const getBankExrateData = async (currencyData) => {
  try {
    const { currency, currencyKey } = currencyData
    const bankDatas = {
      currency,
      banks: []
    }

    const response = await axios.get(`https://www.findrate.tw/${currencyKey}/`)
    const $ = cheerio.load(response.data)
    const items = $('table[border] tr') // 抓回資料最後多兩個空元素將其扣掉

    for (let i = 1; i < items.length - 2; i++) {
      const bank = items.eq(i).find('.bank a').text()
      const cashBuy = items.eq(i).find('.WordB').eq(0).text()
      const cashSell = items.eq(i).find('.WordB').eq(1).text()
      const spotBuy = items.eq(i).find('.WordB').eq(2).text()
      const spotSell = items.eq(i).find('.WordB').eq(3).text()

      bankDatas.banks.push({
        bank,
        cashBuy,
        cashSell,
        spotBuy,
        spotSell
      })
    }

    return bankDatas
  } catch (error) {
    console.log('exchangeBank.js Error', error)
  }
}

const banksDataHandler = (banks, exrateType) => {
  const bankData = []
  for (const bank of banks) {
    const exrate = numeral(bank[exrateType]).value()
    if (exrate !== null) {
      bankData.push({
        bank: bank.bank,
        exrate
      })
    }
  }
  return bankData
}

export const filterBestBankExrate = (banks) => {
  const cashBuyData = banksDataHandler(banks, 'cashBuy')
  const cashSellData = banksDataHandler(banks, 'cashSell')
  const spotBuyData = banksDataHandler(banks, 'spotBuy')
  const spotSellData = banksDataHandler(banks, 'spotSell')

  let bestCashBuy = cashBuyData[0] || null
  let bestCashSell = cashSellData[0] || null
  let bestSpotBuy = spotBuyData[0] || null
  let bestSpotSell = spotSellData[0] || null

  if (bestCashBuy !== null) {
    cashBuyData.forEach(bank => { bestCashBuy = bank.exrate > bestCashBuy.exrate ? bank : bestCashBuy })
    bestCashBuy.exrate = bestCashBuy.exrate.toString()
  }
  if (bestCashSell !== null) {
    cashSellData.forEach(bank => { bestCashSell = bank.exrate < bestCashSell.exrate ? bank : bestCashSell })
    bestCashSell.exrate = bestCashSell.exrate.toString()
  }
  if (bestSpotBuy !== null) {
    spotBuyData.forEach(bank => { bestSpotBuy = bank.exrate > bestSpotBuy.exrate ? bank : bestSpotBuy })
    bestSpotBuy.exrate = bestSpotBuy.exrate.toString()
  }
  if (bestSpotSell !== null) {
    spotSellData.forEach(bank => { bestSpotSell = bank.exrate < bestSpotSell.exrate ? bank : bestSpotSell })
    bestSpotSell.exrate = bestSpotSell.exrate.toString()
  }

  return {
    bestCashBuy,
    bestCashSell,
    bestSpotBuy,
    bestSpotSell
  }
}

export const banksExrateListReply = (bankExrate, page) => {
  const { currency, banks } = bankExrate
  const reply = {
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
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: `${currency} - 各銀行牌告匯率`,
                    size: 'xs',
                    weight: 'bold',
                    color: '#ffffff',
                    align: 'center'
                  }
                ],
                paddingTop: 'md',
                paddingBottom: 'md'
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
                        text: '銀行',
                        size: 'xs',
                        align: 'center',
                        color: '#ffffff',
                        weight: 'bold'
                      }
                    ],
                    width: '20%'
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '現鈔買入',
                        size: 'xs',
                        align: 'center',
                        color: '#ffffff',
                        weight: 'bold'
                      }
                    ],
                    width: '20%'
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '現鈔賣出',
                        size: 'xs',
                        align: 'center',
                        color: '#ffffff',
                        weight: 'bold'
                      }
                    ],
                    width: '20%'
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '即期買入',
                        size: 'xs',
                        align: 'center',
                        color: '#ffffff',
                        weight: 'bold'
                      }
                    ],
                    width: '20%'
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '即期賣出',
                        size: 'xs',
                        align: 'center',
                        color: '#ffffff',
                        weight: 'bold'
                      }
                    ],
                    width: '20%'
                  }
                ],
                paddingTop: 'md',
                paddingBottom: 'md'
              }
            ],
            backgroundColor: '#464F69'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
            ]
          }
        ],
        paddingAll: 'none'
      },
      size: 'giga'
    }
  }

  const banksLength = (banks.length < 20) ? banks.length : 20
  const start = (page === 1) ? 0 : banksLength
  const end = (page === 1) ? banksLength : banks.length

  for (let i = start; i < end; i++) {
    reply.contents.body.contents[1].contents.push(
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
                text: banks[i].bank,
                size: 'xs',
                align: 'center',
                wrap: true
              }
            ],
            width: '20%',
            paddingAll: 'md'
          },
          {
            type: 'separator',
            color: '#cccccc'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: banks[i].cashBuy,
                size: 'xs',
                align: 'center',
                wrap: true
              }
            ],
            width: '20%',
            paddingAll: 'md'
          },
          {
            type: 'separator',
            color: '#cccccc'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: banks[i].cashSell,
                size: 'xs',
                align: 'center',
                wrap: true
              }
            ],
            width: '20%',
            paddingAll: 'md'
          },
          {
            type: 'separator',
            color: '#cccccc'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: banks[i].spotBuy,
                size: 'xs',
                align: 'center',
                wrap: true
              }
            ],
            width: '20%',
            paddingAll: 'md'
          },
          {
            type: 'separator',
            color: '#cccccc'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: banks[i].spotSell,
                size: 'xs',
                align: 'center',
                wrap: true
              }
            ],
            width: '20%',
            paddingAll: 'md'
          }
        ],
        alignItems: 'center',
        backgroundColor: (i % 2 === 0) ? '#ffffff' : '#f1faee'
      }
    )
  }

  return reply
}
