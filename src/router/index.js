import Vue from 'vue'
import Router from 'vue-router'
import SearchLocation from '@/pages/SearchLocation'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: SearchLocation
    }
  ]
})
