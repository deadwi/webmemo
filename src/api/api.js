// import axios from 'axios'

export {
  getData,
  insertLine
}

const SpreadsheetId = (new URL(window.location.href)).searchParams.get('sid')

// https://developers.google.com/sheets/api/quickstart/js

function getData (vue) {
  const client = vue.$gAuth.getClient()
  const gdata = vue.$gAuth.getData()

  return client.sheets.spreadsheets.get({
    spreadsheetId: SpreadsheetId
  }).then(res => {
    gdata.list = res.result.sheets.map(x => x.properties.title)

    return client.sheets.spreadsheets.values.get({
      spreadsheetId: SpreadsheetId,
      range: 'memo'
    })
  })
}

function insertLine (vue, date, category, amount, note) {
  const client = vue.$gAuth.getClient()
  console.log(client.sheets)

  return client.sheets.spreadsheets.values.append({
    spreadsheetId: SpreadsheetId,
    range: 'memo',
    valueInputOption: 'RAW',
    resource: {
      values: [
        [date, category, amount, note]
      ]
    }
  })
}
