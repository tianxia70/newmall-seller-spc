<template>
  <a-layout-sider
    class="layout-classic-sider h-full flex flex-col hidden lg:block"
    :style="`width: ${appStore.menuCollapse ? '48px' : appStore.menuWidth + 'px'};`"
  >
    <template v-if="appStore.menuCollapse">
      <div class="site-logo-close">
        <a-avatar :size="28" shape="square">
          <img :src="siteConfig.logo" alt="logo">
        </a-avatar>
      </div>
    </template>
    <template v-else>
      <div class="site-info">
        <a-avatar :size="32" shape="square">
          <img :src="siteConfig.logo" alt="logo">
        </a-avatar>
        <div class="site-name">
          <h3 :title="siteConfig.title">{{ siteConfig.title }}</h3>
          <div v-if="sellerInfo && sellerInfo.orderState && Number(sellerInfo.sellerKycFlag)" class="state" :class="{'close': Number(sellerInfo.orderState) === 2 || !Number(sellerInfo.sellerKycFlag)}">
            {{ Number(sellerInfo.orderState) === 1 ? $t('正常营业') : $t('店铺关店') }}
          </div>
        </div>
      </div>

      <div class="seller-info-content">
        <div class="logo-content">
          <a-avatar :size="50" shape="square">
            <img :src="sellerInfo.avatar || defaultLogo.href" alt="logo">
          </a-avatar>
          <img :src="sellerLogoData[sellerInfo.mallLevel || 'D']" alt="level" class="level-icon">
        </div>
        <div class="info-content">
          <a-tooltip :content="sellerInfo.name" position="right">
            <p class="store-name">{{ sellerInfo.name || '--' }}</p>
          </a-tooltip>
          <a-tooltip :content="showUserName" position="right">
            <p class="user-email">{{ showUserName || '--' }}</p>
          </a-tooltip>
          <div class="id-info">
            <p>ID<span>{{ userInfo.usercode || '--' }}</span></p>
            <a-tooltip :content="t('查看我的店铺')" position="right">
              <i class="iconfont" @click="intoShop">&#xe770;</i>
            </a-tooltip>
          </div>
        </div>
      </div>
    </template>
    <ma-menu
      ref="MaMenuRef"
      :height="`calc(100% - ${appStore.menuCollapse ? '51' : '131'}px)`"
      :class="`${appStore.menuCollapse ? 'ml-1.5' : ''};`"
    />
  </a-layout-sider>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useAppStore, useUserStore } from '@/store'
  import MaMenu from '../ma-menu.vue'
  import { loadSiteConfig, getOrigin } from '@/utils'
  import { homePageRoutes } from '@/router/homePageRoutes.js'
  import { sellerLogoData } from '@/configs'

  const appName = import.meta.env.VITE_APP
  const { t, locale } = useI18n()

  const userStore = useUserStore()
  const sellerInfo = computed(() => userStore.sellerInfo)
  const userInfo = computed(() => userStore.userInfo)

  const MaMenuRef = ref(null)
  const appStore = useAppStore()

  const siteConfig = ref({})
  
  const defaultLogo = new URL('@/assets/images/level/default-logo.png', import.meta.url)

  const showUserName = computed(() => {
    let username = userInfo.value.username || userInfo.value.phone || userInfo.value.email
    if (username.indexOf('@') === -1) {
      username = '+' + username
    }
    return username
  })

  const intoShop = () => {
    window.open(getOrigin() + "/web/#/store/details/" + sellerInfo.value.id + '?lang=' + locale.value);
  }

  onMounted(async () => {
    setTimeout(_ => {
      MaMenuRef.value.menus = homePageRoutes
    }, 50)
    siteConfig.value = await loadSiteConfig(appName)
  })
</script>

<style lang="less" scoped>
  .site-logo-close {
    height: 51px;
    border-bottom: 1px solid var(--color-border-1);
    display: flex;
    align-items: center;
    justify-content: center;

    > img {
      width: 28px;
      height: 28px;
    }
  }
  .site-info {
    display: flex;
    align-items: center;
    height: 51px;
    padding: 0 16px;
    border-bottom: 1px solid var(--color-border-1);
    
    > .site-name {
      flex: 1;
      padding-left: 10px;
      overflow: hidden;

      > h3 {
        width: 100%;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-1);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      > .state {
        color: var(--color-text-2);
        font-size: 12px;
        position: relative;
        padding-left: 13px;
        margin: 0;
        margin-top: 4px;
        &.close {
          color: var(--color-text-3);
          &::after {
            background-color: var(--color-text-4);
          }
        }
        &::after {
          content: '';
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: absolute;
          left: 0;
          top: 50%;
          margin-top: -4px;
          background-color: rgb(23, 198, 83);
        }
      }
    }
  }

  .seller-info-content {
    height: 80px;
    border-bottom: 1px solid var(--color-border-1);
    padding: 0 16px;
    display: flex;
    align-items: center;

    .logo-content {
      width: 50px;
      height: 50px;
      position: relative;
      .level-icon {
        position: absolute;
        width: 20px;
        right: -5px;
        bottom: -5px;
      }
    }
    > .info-content {
      flex: 1;
      padding-left: 15px;
      overflow: hidden;
      .user-email,
      .store-name {
        color: var(--color-text-1);
        font-size: 14px;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .user-email {
        color: var(--color-text-2);
        font-weight: normal;
        font-size: 12px;
        margin-top: 5px;
      }
      .id-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 3px;
        > p {
          color: var(--color-text-2);
          font-size: 11px;
          > span {
            padding-left: 2px;
          }
        }
        .iconfont {
          outline: none !important;
          font-size: 16px;
          cursor: pointer;
          color: var(--color-text-2);
          margin-right: 0 !important;
          user-select: none;
          &:hover {
            color: var(--color-text-1);
          }
        }
      }
    }
  }
</style>