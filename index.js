import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'

// 讀取 .env 設定檔
dotenv.config()

// 設定 LINE BOT
const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

// 監聽 PORT
bot.listen('/', process.env.PORT, () => {
  console.log('LINE-BOT 已啟動')
})
