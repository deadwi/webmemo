// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import gauth from '@/api/googleAuth'
import 'vuetify/dist/vuetify.min.css'

const cid = (new URL(window.location.href)).searchParams.get('cid')
console.log(cid)

Vue.use(Vuetify)
Vue.use(gauth, {
  clientId: cid
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
