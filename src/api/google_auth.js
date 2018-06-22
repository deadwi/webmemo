import EventBus from '@/api/event_bus'

// https://developers.google.com/identity/protocols/OAuth2UserAgent
const googleAuth = (function () {
  let GoogleAuthInstance
  let GoogleClientInstance
  let authConfig
  let data = {
    list: []
  }

  function load (config) {
    installClient().then(function () {
      authConfig = config
      window.gapi.load('client:auth2', initClient)
    })
  }

  function signIn (successCallback, errorCallback) {
    GoogleAuthInstance.signIn().then(function (googleUser) {
      successCallback(googleUser)
    }, function (error) {
      errorCallback(error)
    })
  }

  function getAuthCode (successCallback, errorCallback) {
    GoogleAuthInstance.grantOfflineAccess({prompt: 'consent'})
      .then(function (resp) {
        successCallback(resp.code)
      })
      .catch((error) => {
        errorCallback(error)
      })
  }

  function signOut (successCallback, errorCallback) {
    GoogleAuthInstance.signOut().then(function () {
      successCallback()
    }, function (error) {
      errorCallback(error)
    })
  }

  function getClient () {
    return GoogleClientInstance
  }

  function getData () {
    return data
  }

  function installClient () {
    const apiUrl = 'https://apis.google.com/js/api.js'
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script')
      script.src = apiUrl
      script.onreadystatechange = script.onload = function () {
        if (!script.readyState || /loaded|compvare/.test(script.readyState)) {
          setTimeout(function () {
            resolve()
          }, 500)
        }
      }
      document.getElementsByTagName('head')[0].appendChild(script)
    })
  }

  function initClient () {
    window.gapi.client.init(authConfig)
      .then(function () {
        GoogleAuthInstance = window.gapi.auth2.getAuthInstance()
        GoogleClientInstance = window.gapi.client
        EventBus.$emit('loadedAuth', 1)
        updateSigninStatus(GoogleAuthInstance.isSignedIn.get())
      })
  }

  function updateSigninStatus (isSignedIn) {
    if (isSignedIn) {
      EventBus.$emit('signedIn', 1)
    }
  }

  return {
    load: load,
    signIn: signIn,
    getAuthCode: getAuthCode,
    signOut: signOut,
    getClient: getClient,
    getData: getData
  }
})()

function installGoogleAuthPlugin (Vue, options) {
  let GoogleAuthConfig = null
  const GoogleAuthDefaultConfig = {
    scope: 'profile email https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/spreadsheets',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest', 'https://sheets.googleapis.com/$discovery/rest?version=v4']
  }
  if (typeof options === 'object') {
    GoogleAuthConfig = Object.assign(GoogleAuthDefaultConfig, options)
    if (!options.clientId) {
      console.warn('clientId is required')
    }
  } else {
    console.warn('invalid option type. Object type accepted only')
  }

  Vue.gAuth = googleAuth
  Object.defineProperties(Vue.prototype, {
    $gAuth: {
      get: function () {
        return Vue.gAuth
      }
    }
  })
  Vue.gAuth.load(GoogleAuthConfig)
}

export default installGoogleAuthPlugin
