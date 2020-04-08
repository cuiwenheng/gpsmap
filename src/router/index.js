import Vue from 'vue'
import Router from 'vue-router'
// import beijing0 from '@/components/beijing0'
import gpsMap from '@/pages/gpsMap'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    // {
    //   path: '/',
    //   name: 'beijing0',
    //   component: beijing0
    // },
    {
      path: '/',
      name: 'gpsMap',
      component: gpsMap
    }
  ]
})
