import Vue from 'vue'
import Router from 'vue-router'
import MemoList from '@/components/MemoList'
import Charts from '@/components/Charts'
import Summary from '@/components/Summary'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'MemoList',
      component: MemoList
    },
    {
      path: '/charts',
      name: 'Charts',
      component: Charts
    },
    {
      path: '/summary',
      name: 'Summary',
      component: Summary
    }
  ]
})
