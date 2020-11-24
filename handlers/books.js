import axios from 'axios'
import cheerio from 'cheerio'

export const booksHandler = async () => {
  try {
    const bookDatas = []

    const response = await axios.get('https://www.books.com.tw/web/sys_bbotm/books/020907/?v=1&o=5')
    const $ = cheerio.load(response.data)

    for (let i = 0; i < 10; i++) {
      const title = $('.mod_a .item').eq(i).find('img.cover').attr('alt')
      const link = $('.mod_a .item').eq(i).children('a').attr('href')

      let imgSrc = $('.mod_a .item').eq(i).find('img.cover').attr('src')
      imgSrc = imgSrc.replace('w=170', 'w=348')
      imgSrc = imgSrc.replace('h=170', 'h=348')

      bookDatas.push({
        title,
        link,
        imgSrc
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

    for (const book of bookDatas) {
      reply.contents.contents.push({
        type: 'bubble',
        size: 'kilo',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'image',
              url: book.imgSrc,
              size: '4xl'
            },
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'HOT',
                  size: 'xxs',
                  color: '#ffffff',
                  align: 'center',
                  offsetTop: '4.5px',
                  weight: 'bold'
                }
              ],
              width: '53px',
              height: '23px',
              backgroundColor: '#ff334b',
              position: 'absolute',
              offsetTop: '15px',
              offsetStart: '15px',
              cornerRadius: '20px'
            }
          ]
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
                  text: book.title,
                  size: 'md',
                  weight: 'bold',
                  color: '#ffffff',
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
                  text: '前往博客來查看',
                  color: '#ffffff',
                  size: 'xs',
                  align: 'center',
                  gravity: 'bottom'
                }
              ],
              margin: 'xl',
              borderWidth: '1px',
              borderColor: '#ffffff',
              cornerRadius: '6px',
              paddingAll: 'md',
              action: {
                type: 'uri',
                uri: book.link,
                label: '前往博客來查看',
                altUri: {
                  desktop: book.link
                }
              }
            }
          ],
          backgroundColor: '#464F69',
          justifyContent: 'space-between'
        }
      })
    }

    return reply
  } catch (error) {
    console.log('books.js Error', error)
    return '找不到外匯投資相關書籍'
  }
}
