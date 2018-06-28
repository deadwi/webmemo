// import axios from 'axios'
import EventBus from '@/api/event_bus'
import moment from 'moment'

export {
  getData,
  updateMetaData,
  insertLine,
  updateLine,
  deleteLine
}

const SpreadsheetId = (new URL(window.location.href)).searchParams.get('sid')

// https://developers.google.com/sheets/api/quickstart/js

function getData (vue) {
  const client = vue.$gAuth.getClient()
  const gdata = vue.$gAuth.getData()

  if (gdata.memo !== null) {
    return new Promise(function (resolve, reject) {
      resolve(gdata.memo)
    })
  }
  return client.sheets.spreadsheets.values.get({
    spreadsheetId: SpreadsheetId,
    range: 'memo'
  }).then(res => {
    const memo = {}

    for (const i in res.result.values) {
      const row = res.result.values[i]
      if (row.length < 2) {
        continue
      }

      const day = moment(row[0]).format('YYYY-MM-DD')
      if (!memo.hasOwnProperty(day)) {
        memo[day] = []
      }
      memo[day].push({
        index: parseInt(i) + 1,
        date: row[0],
        category: row[1],
        amount: row[2],
        note: row[3]
      })
    }

    for (const i in memo) {
      memo[i].sort((x, y) => x.date > y.date)
    }
    const sortedMemo = {}
    Object.keys(memo).sort().forEach(x => {
      sortedMemo[x] = memo[x]
    })

    gdata.memo = sortedMemo
    return sortedMemo
  })
}

function updateMetaData (vue) {
  const client = vue.$gAuth.getClient()
  const gdata = vue.$gAuth.getData()

  client.sheets.spreadsheets.get({
    spreadsheetId: SpreadsheetId
  }).then(res => {
    gdata.list = res.result.sheets.map(x => x.properties.title)

    client.sheets.spreadsheets.values.get({
      spreadsheetId: SpreadsheetId,
      range: 'category'
    }).then(res => {
      const category = {}
      for (const i in res.result.values) {
        const row = res.result.values[i]
        if (row.length < 4 || parseInt(i) === 0) {
          continue
        }

        const key = row[0]
        category[key] = {
          icon: row[1],
          title: row[2],
          amount: row[3] === 'TRUE',
          parent: row[4]
        }
      }
      gdata.category = category
      EventBus.$emit('updateMetaData', 1)
    })
  })
}

function getAppendRow (res) {
  const tokens = res.result.updates.updatedRange.split('!A')
  if (tokens.length === 2) {
    return parseInt(tokens[1])
  }
  return null
}

function insertLine (vue, date, category, amount, note) {
  const client = vue.$gAuth.getClient()
  const gdata = vue.$gAuth.getData()

  return client.sheets.spreadsheets.values.append({
    spreadsheetId: SpreadsheetId,
    range: 'memo',
    valueInputOption: 'RAW',
    resource: {
      values: [
        [date, category, amount, note]
      ]
    }
  }).then(res => {
    const memo = gdata.memo
    const day = moment(date).format('YYYY-MM-DD')

    if (!memo.hasOwnProperty(day)) {
      memo[day] = []
    }
    memo[day].push({
      index: getAppendRow(res),
      date: date,
      category: category,
      amount: amount,
      note: note
    })
    memo[day].sort((x, y) => x.date > y.date)
    return memo
  })
}

function updateLine (vue, index, date, category, amount, note) {
  const client = vue.$gAuth.getClient()
  const gdata = vue.$gAuth.getData()

  return client.sheets.spreadsheets.values.update({
    spreadsheetId: SpreadsheetId,
    range: 'memo!A' + index,
    valueInputOption: 'RAW',
    resource: {
      values: [
        [date, category, amount, note]
      ]
    }
  }).then(res => {
    const memo = gdata.memo
    const day = moment(date).format('YYYY-MM-DD')

    const dayIndex = memo[day].findIndex(x => x.index === index)
    if (dayIndex >= 0) {
      memo[day].splice(dayIndex, 1)
    }

    if (!memo.hasOwnProperty(day)) {
      memo[day] = []
    }
    memo[day].push({
      index: index,
      date: date,
      category: category,
      amount: amount,
      note: note
    })
    memo[day].sort((x, y) => x.date > y.date)
    return memo
  })
}

function deleteLine (vue, day, index) {
  const client = vue.$gAuth.getClient()
  const gdata = vue.$gAuth.getData()

  return client.sheets.spreadsheets.values.update({
    spreadsheetId: SpreadsheetId,
    range: 'memo!A' + index,
    valueInputOption: 'RAW',
    resource: {
      values: [
        ['', '', '', '']
      ]
    }
  }).then(res => {
    const memo = gdata.memo

    const dayIndex = memo[day].findIndex(x => x.index === index)
    if (dayIndex >= 0) {
      memo[day].splice(dayIndex, 1)
    }
    return memo
  })
}
