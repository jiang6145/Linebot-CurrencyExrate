import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
import schedule from 'node-schedule'

import { booksHandler } from './handlers/books.js'

// 讀取 .env 設定檔
dotenv.config()

// 設定 Linebot
const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

let booksReply = {}

// 處理外匯投資相關書籍
booksHandler().then(result => {
  booksReply = result
})

schedule.scheduleJob('* * 8 * * *', () => {
  booksHandler().then(result => {
    booksReply = result
  })
})

// Linebot 事件
bot.on('message', async (event) => {
  const userMsg = event.message.text.trim()
  try {
    if (userMsg === '外匯相關書籍') return event.reply(booksReply)
  } catch (error) {
    console.log('發生錯誤')
  }
})

// 監聽 PORT
bot.listen('/', process.env.PORT, () => {
  console.log('LINE-BOT 已啟動')
})
