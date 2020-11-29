import axios from 'axios'
import cheerio from 'cheerio'

export const getNewsReply = async () => {
  try {
    const newsDatas = []

    const response = await axios.get('https://news.cnyes.com/news/cat/forex?exp=a')
    const $ = cheerio.load(response.data)

    for (let i = 0; i < 10; i++) {
      const title = $('._2bFl.theme-list ._1Zdp').eq(i).attr('title')
      const link = $('._2bFl.theme-list ._1Zdp').eq(i).attr('href')
      const time = $('._2bFl.theme-list ._1Zdp').eq(i).find('time[datetime]').attr('datetime')
      const imgSrc = $('._2bFl.theme-list ._1Zdp').eq(i).find('img').attr('src')

      newsDatas.push({
        title,
        link: 'https://news.cnyes.com' + link,
        time: new Date(time).toLocaleString('zh-TW'),
        imgSrc: imgSrc.replace('/s/', '/l/')
      })
    }

    const reply = {
      type: 'flex',
      altText: 'this is a flex message',
      contents: {
        type: 'carousel',
        contents: []
      }
    }

    for (const news of newsDatas) {
      reply.contents.contents.push({
        type: 'bubble',
        size: 'kilo',
        hero: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'image',
              url: news.imgSrc,
              size: 'full',
              aspectMode: 'cover',
              aspectRatio: '2:1'
            },
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'NEWS',
                  size: 'xxs',
                  color: '#ffffff',
                  align: 'center',
                  offsetTop: '4.5px'
                }
              ],
              width: '53px',
              height: '23px',
              backgroundColor: '#ff334b',
              cornerRadius: '20px',
              position: 'absolute',
              offsetTop: '15px',
              offsetStart: '15px'
            },
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: news.time,
                  color: '#ffffff',
                  size: 'xxs',
                  align: 'end'
                }
              ],
              position: 'absolute',
              width: '100%',
              offsetBottom: '0px',
              backgroundColor: '#00000055',
              paddingStart: '10px',
              paddingEnd: '10px',
              paddingTop: '3px',
              paddingBottom: '3px'
            }
          ],
          paddingAll: 'none'
        },
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
                  text: news.title,
                  color: '#ffffff',
                  weight: 'bold',
                  size: 'md',
                  wrap: true
                }
              ]
            },
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '新　聞　內　容',
                  action: {
                    type: 'uri',
                    label: '新　聞　內　容',
                    uri: news.link
                  },
                  color: '#ffffff',
                  size: 'xs',
                  align: 'center'
                }
              ],
              margin: 'xl',
              borderWidth: '1px',
              borderColor: '#ffffff',
              cornerRadius: '6px',
              paddingAll: 'md'
            }
          ],
          backgroundColor: '#464F69',
          justifyContent: 'space-between'
        }
      })
    }

    return reply
  } catch (error) {
    console.log('news.js Error', error)
    return '找不到外匯相關新聞'
  }
}
