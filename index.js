import linebot from 'linebot'
import dotenv from 'dotenv'
import schedule from 'node-schedule'

import { getBooksReply } from './handlers/books.js'
import { getNewsReply } from './handlers/news.js'
import { userMsgHandler, exchangeMsgHandler, currencyQuickReply } from './handlers/userMsgHandler.js'
import { getExrateData, exchangeCalculation, getExrateReply, getExchangeReply } from './handlers/exrate.js'
import { getBankExrateData, filterBestBankExrate, banksExrateListReply } from './handlers/bankExrate.js'

// 讀取 .env 設定檔
dotenv.config()

// 設定 Linebot
const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

let booksReply = {}
let newsReply = {}

// 處理外匯投資相關書籍
getBooksReply().then((result) => {
  booksReply = result
})

schedule.scheduleJob('* * 8 * * *', () => {
  getBooksReply().then((result) => {
    booksReply = result
  })
})

// 處理外匯相關新聞
getNewsReply().then((result) => {
  newsReply = result
})

schedule.scheduleJob('* */1 * * *', () => {
  getNewsReply().then((result) => {
    newsReply = result
  })
})

// Linebot 事件
bot.on('message', async (event) => {
  const userMsg = event.message.text.trim()

  try {
    if (userMsg.startsWith('/')) {
      const currencyData = userMsgHandler(userMsg)
      const exrate = await getExrateData(currencyData)
      const bankExrate = await getBankExrateData(currencyData)
      const bestBankExrate = filterBestBankExrate(bankExrate.banks)
      const exrateReply = getExrateReply(exrate, bestBankExrate)

      return event.reply(exrateReply)
    }

    if (userMsg.startsWith('@')) {
      const currencyData = userMsgHandler(userMsg)
      const bankExrate = await getBankExrateData(currencyData)

      if (bankExrate.banks.length < 20) {
        event.reply(banksExrateListReply(bankExrate, 1))
      } else {
        event.reply([banksExrateListReply(bankExrate, 1), banksExrateListReply(bankExrate, 2)])
      }
    }

    if (userMsg.startsWith('$')) {
      const exchangeData = exchangeMsgHandler(userMsg)
      const exchangeResult = await exchangeCalculation(exchangeData)
      const exchangeReply = getExchangeReply(exchangeResult)

      return event.reply(exchangeReply)
    }
    if (userMsg === '外匯書籍') return event.reply(booksReply)

    if (userMsg === '外匯新聞') return event.reply(newsReply)
  } catch (error) {
    console.log('index.js Error', error)
    event.reply('發生錯誤')
  }
})

bot.on('postback', (event) => {
  const userPostback = event.postback.data

  try {
    if (userPostback === '查詢其它幣別') return event.reply(currencyQuickReply('/'))
    if (userPostback === '金額試算') return event.reply('請輸入 $幣別金額，ex: 試算兌換1000美金，$美金1000，以國際匯率計算。')
  } catch (error) {
    console.log('index.js Error', error)
  }
})

// 監聽 PORT
bot.listen('/', process.env.PORT, () => {
  console.log('LINE-BOT 已啟動')
})
