import Vue from 'vue'
import Router from 'vue-router'
import MemoList from '@/components/MemoList'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'MemoList',
      component: MemoList
    }
  ]
})
