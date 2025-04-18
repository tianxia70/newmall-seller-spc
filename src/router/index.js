import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import routes from './webRouter.js'
import { useAppStore } from '@/store'
import { whiteRoute } from '@/configs'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const toTitle = to.meta.title ? to.meta.title : to.name
  const appStore = useAppStore()
  document.title = `${toTitle} - ${appStore.appName}`
  const token = true
  
  // 登录状态下
  if (token) {
    // if (to.name === 'login') {
    //   next({ path: defaultRoutePath })
    //   return
    // }

    // if (!userStore.userInfo && userStore.userInfo == undefined ) {
    //   // 用户信息
    //   await userStore.requestUserInfo()

    //   // 获取路由信息
    //   if (!userStore.routerInit) {
    //     await userStore.requestRouterInfo()
    //   }

    //   next({ path: to.path, query: to.query })
    // } else {
    //   next()
    // }
    next()
  } else {
    // 未登录的情况下允许访问的路由
    if (!whiteRoute.includes(to.name)) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  }
})

router.afterEach((to, from) => {
  NProgress.done()
})

router.onError(error => {
  console.log(error)
  NProgress.done();
});


export default router