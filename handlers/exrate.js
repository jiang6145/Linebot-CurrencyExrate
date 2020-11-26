import axios from 'axios'

export const exrateHandler = async (currencyData) => {
  try {
    let { currency, currencyKey } = currencyData
    currencyKey = (currencyKey === 'USD') ? 'USDTWD' : 'USD' + currencyKey

    const response = await axios.get('https://tw.rter.info/capi.php')
    const exrateDatas = response.data

    for (const key in exrateDatas) {
      if (currencyKey === key) {
        // 因匯率 API 均以美金報價, 如果要以台幣兌換日幣的匯率, 需要以台幣兌美金匯率 / 日幣兌美金匯率 = 臺幣兌日幣匯率
        const basicCurrency = exrateDatas.USDTWD.Exrate
        const exchangeCurrency = (currencyKey === 'USDTWD') ? 1 : exrateDatas[key].Exrate
        const exrate = (basicCurrency / exchangeCurrency).toFixed(2)
        const updateTime = exrateDatas[key].UTC

        return {
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
