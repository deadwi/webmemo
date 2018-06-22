// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import gauth from '@/api/googleAuth'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)
Vue.use(gauth, {
  clientId: '443099332988-0gm7ae0t7v9q0k8j6kb0l1u40nv487h4.apps.googleusercontent.com'
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
