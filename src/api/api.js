// import axios from 'axios'

export {
  insertLine
}

// https://developers.google.com/sheets/api/quickstart/js
function insertLine (vue, type, uid, id, memo) {
  const client = vue.$gAuth.getClient()
  console.log(client)

  return client.sheets.spreadsheets.values.append({
    spreadsheetId: '15OmVdNDpzRg26kbYT-lBzVC5jX6YZZq74GB5XaUfVeY',
    range: 'A2:H2',
    valueInputOption: 'RAW',
    resource: {
      values: [
        [new Date(), type, uid, id, memo]
      ]
    }
  })
}
