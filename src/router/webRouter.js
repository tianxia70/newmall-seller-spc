import homePageRoutes from './homePageRoutes'
//系统路由
const routes = [
  {
    name: 'layout',
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: 'dashboard',
    children: homePageRoutes
  }, {
    name: 'login',
    path: '/login',
    component: () => import('@/views/login-register/login/index.vue'),
    meta: { title: '登录' }
  }, {
    name: 'register',
    path: '/register',
    component: () => import('@/views/login-register/register/index.vue'),
    meta: { title: '注册' }
  }
  , {
    path: "/:pathMatch(.*)*",
    hidden: true,
    meta: { title: '访问的页面不存在' },
    component: () => import('@/layout/404.vue'),
  }
]

export default routes