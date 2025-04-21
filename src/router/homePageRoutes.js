export const homePageRoutes = [
  {
    name: 'dashboard',
    path: '/dashboard',
    meta: {
      title: '仪表盘',
      icon: 'icon-dashboard',
      affix: true
    },
    component: () => import('@/views/dashboard/index.vue')
  },
  {
    name: 'order',
    path: '/order',
    meta: {
      title: '店铺订单',
      icon: 'icon-dashboard',
      affix: true
    },
    component: () => import('@/views/order/index.vue')
  },
  {
    name: 'financial',
    path: '/financial',
    meta: {
      title: '财务报表',
      icon: 'icon-dashboard',
      affix: true
    },
    component: () => import('@/views/financial/index.vue')
  },
  {
    name: 'wallet',
    path: '/wallet',
    meta: {
      title: '我的钱包',
      icon: 'icon-dashboard',
      affix: true
    },
    component: () => import('@/views/wallet/index.vue')
  },
  {
    name: 'money',
    path: '/money',
    meta: {
      title: '资金记录',
      icon: 'icon-dashboard',
      affix: true
    },
    component: () => import('@/views/money/index.vue')
  },
  {
    name: 'goods',
    path: '/goods',
    meta: {
      title: '商品管理',
      icon: 'icon-dashboard',
      affix: true
    },
    redirect: '/goods/store',
    children: [
      {
        name: 'goods/store',
        path: '/goods/store',
        meta: {
          title: '店铺商品',
          icon: 'icon-dashboard',
          affix: true
        },
        component: () => import('@/views/goods/store/index.vue')
      },
      {
        name: 'goods/refund',
        path: '/goods/refund',
        meta: {
          title: '退款请求',
          icon: 'icon-dashboard',
          affix: true
        },
        component: () => import('@/views/goods/refund/index.vue')
      },
      {
        name: 'goods/comment',
        path: '/goods/comment',
        meta: {
          title: '商品评论',
          icon: 'icon-dashboard',
          affix: true
        },
        component: () => import('@/views/goods/comment/index.vue')
      },
      {
        name: 'goods/library',
        path: '/goods/library',
        meta: {
          title: '商品库',
          icon: 'icon-dashboard',
          affix: true
        },
        component: () => import('@/views/goods/library/index.vue')
      }
    ]
  },
  {
    name: 'other',
    path: '/other',
    meta: {
      title: '其他',
      icon: 'icon-dashboard',
      affix: true
    },
    redirect: '/other/shop-setting',
    children: [
      {
        name: 'other/shop-setting',
        path: '/other/shop-setting',
        meta: {
          title: '店铺设置',
          icon: 'icon-dashboard',
          affix: true
        },
        component: () => import('@/views/other/shop-setting/index.vue')
      },
      {
        name: 'other/promotion',
        path: '/other/promotion',
        meta: {
          title: '创业联盟',
          icon: 'icon-dashboard',
          affix: true
        },
        component: () => import('@/views/other/promotion/index.vue')
      }
    ]
  },
  {
    name: 'marketing',
    path: '/marketing',
    meta: {
      title: '营销工具',
      icon: 'icon-dashboard',
      affix: true
    },
    redirect: '/marketing/car',
    children: [
      {
        name: 'marketing/car',
        path: '/marketing/car',
        meta: {
          title: '店铺直通车',
          icon: 'icon-dashboard',
          affix: true
        },
        component: () => import('@/views/marketing/car/index.vue')
      },
      {
        name: 'marketing/buy-history',
        path: '/marketing/buy-history',
        meta: {
          title: '购买历史',
          icon: 'icon-dashboard',
          affix: true
        },
        component: () => import('@/views/marketing/buy-history/index.vue')
      },
      {
        name: 'marketing/level',
        path: '/marketing/level',
        meta: {
          title: '卖家等级',
          icon: 'icon-dashboard',
          affix: true
        },
        component: () => import('@/views/marketing/level/index.vue')
      }
    ]
  }
]

export default homePageRoutes