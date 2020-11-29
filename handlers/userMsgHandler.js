import numeral from 'numeral'

// 利用正則表達式將使用者輸入的貨幣訊息轉為所需物件
const controlDatas = [
  {
    regExp: /^美[金元]$|^USD$/i,
    currency: '美金',
    currencyKey: 'USD'
  },
  {
    regExp: /^歐[元幣]$|^EUR$/i,
    currency: '歐元',
    currencyKey: 'EUR'
  },
  {
    regExp: /^日[幣元圓]$|^JPY$/i,
    currency: '日幣',
    currencyKey: 'JPY'
  },
  {
    regExp: /^港[幣元]$|^HKD$/i,
    currency: '港幣',
    currencyKey: 'HKD'
  },
  {
    regExp: /^英鎊$|^GBP$/i,
    currency: '英鎊',
    currencyKey: 'GBP'
  },
  {
    regExp: /^瑞士(法郎|幣)$|^CHF$/i,
    currency: '瑞士法郎',
    currencyKey: 'CHF'
  },
  {
    regExp: /^人民幣$|^CNY$/i,
    currency: '人民幣',
    currencyKey: 'CNY'
  },
  {
    regExp: /^韓[幣元]$|^KRW$/i,
    currency: '韓幣',
    currencyKey: 'KRW'
  },
  {
    regExp: /^澳[幣元]$|^AUD$/i,
    currency: '澳幣',
    currencyKey: 'AUD'
  },
  {
    regExp: /^紐西蘭[幣元]$|^NZD$/i,
    currency: '紐西蘭幣',
    currencyKey: 'NZD'
  },
  {
    regExp: /^新加坡[幣元]$|^SGD$/i,
    currency: '新加坡幣',
    currencyKey: 'SGD'
  },
  {
    regExp: /^泰[銖幣元]$|^THB$/i,
    currency: '泰銖',
    currencyKey: 'THB'
  },
  {
    regExp: /^瑞典(克朗|幣)$|^SEK$/i,
    currency: '瑞典幣',
    currencyKey: 'SEK'
  },
  {
    regExp: /^馬來西亞幣$|^令吉$|^MYR$/i,
    currency: '馬來西亞幣',
    currencyKey: 'MYR'
  },
  {
    regExp: /^(加拿大|加)[幣元]$|^CAD$/i,
    currency: '加拿大幣',
    currencyKey: 'CAD'
  },
  {
    regExp: /^越南[幣盾]$|^VND$/i,
    currency: '越南盾',
    currencyKey: 'VND'
  },
  {
    regExp: /^澳門[幣元]$|^MOP$/i,
    currency: '澳門幣',
    currencyKey: 'MOP'
  },
  {
    regExp: /^菲律賓(比索|披索|幣)$|^PHP$/i,
    currency: '菲律賓披索',
    currencyKey: 'PHP'
  },
  {
    regExp: /^印尼[幣盾]$|^IDR$/i,
    currency: '印尼盾',
    currencyKey: 'IDR'
  },
  {
    regExp: /^南非幣$|^蘭特$|^ZAR$/i,
    currency: '南非幣',
    currencyKey: 'ZAR'
  },
  {
    regExp: /^印度(比索|披索|盧比|幣)$|^INR$/i,
    currency: '印度披索',
    currencyKey: 'INR'
  },
  {
    regExp: /^丹麥(克朗|幣)$|^DKK$/i,
    currency: '丹麥幣',
    currencyKey: 'DKK'
  },
  {
    regExp: /^墨西哥(披索|幣)$|^MXN$/i,
    currency: '墨西哥披索',
    currencyKey: 'MXN'
  },
  {
    regExp: /^土耳其里拉$|^TRY$/i,
    currency: '土耳其里拉',
    currencyKey: 'TRY'
  }
]

export const userMsgHandler = (userMsg) => {
  const currencyMsg = userMsg.substr(1)

  for (const data of controlDatas) {
    if (data.regExp.test(currencyMsg)) {
      return {
        currency: data.currency,
        currencyKey: data.currencyKey
      }
    }
  }
}

export const exchangeMsgHandler = (userMsg) => {
  const numIndex = userMsg.search(/[0-9]/) // 尋找第一個數字的 index 以此位置分割字串
  const currencyMsg = userMsg.slice(0, numIndex).trim()
  const moneyMsg = numeral(userMsg.slice(numIndex).trim()).value()

  const currencyData = userMsgHandler(currencyMsg)

  if (moneyMsg !== null && currencyData) {
    return {
      currency: currencyData.currency,
      currencyKey: currencyData.currencyKey,
      moneyMsg: numeral(moneyMsg).format('0.00')
    }
  }
}

export const currencyQuickReply = (prefix) => {
  return {
    type: 'text',
    text: `請選擇幣別或輸入 ${prefix}幣別`,
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'message',
            label: '美金',
            text: prefix + '美金'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '日幣',
            text: prefix + '日幣'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '英鎊',
            text: prefix + '英鎊'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '歐元',
            text: prefix + '歐元'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '人民幣',
            text: prefix + '人民幣'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '港幣',
            text: prefix + '港幣'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '韓元',
            text: prefix + '韓元'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '泰銖',
            text: prefix + '泰銖'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '新加坡幣',
            text: prefix + '新加坡幣'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '加拿大幣',
            text: prefix + '加拿大幣'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '澳幣',
            text: prefix + '澳幣'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '瑞典幣',
            text: prefix + '瑞典幣'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '南非幣',
            text: prefix + '南非幣'
          }
        }
      ]
    }
  }
}
