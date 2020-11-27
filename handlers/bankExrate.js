import axios from 'axios'
import cheerio from 'cheerio'
import numeral from 'numeral'

export const bankExrateHandler = async (currencyData) => {
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
    return '找不到此貨幣匯率'
  }
}

export const bestBankExrate = (bankExrateData) => {
  const banks = bankExrateData.banks

  let bestCashBuy = banks[0]
  let bestCashSell = banks[0]
  let bestSpotBuy = banks[0]
  let bestSpotSell = banks[0]

  banks.forEach((bank) => {
    if (bank.cashBuy !== '--') bestCashBuy = numeral(bank.cashBuy).value() > numeral(bestCashBuy.cashBuy).value() ? bank : bestCashBuy
    if (bank.cashSell !== '--') bestCashSell = numeral(bank.cashSell).value() < numeral(bestCashSell.cashSell).value() ? bank : bestCashSell
    if (bank.spotBuy !== '--') bestSpotBuy = numeral(bank.spotBuy).value() > numeral(bestSpotBuy.spotBuy).value() ? bank : bestSpotBuy
    if (bank.spotSell !== '--') bestSpotSell = numeral(bank.spotSell).value() < numeral(bestSpotSell.spotSell).value() ? bank : bestSpotSell
  })

  return {
    bestCashBuy,
    bestCashSell,
    bestSpotBuy,
    bestSpotSell
  }
}
