<template>
  <div class="sider customer-scrollbar flex flex-col items-center bg-gray-800 dark:border-blackgray-5">
    <a-avatar class="mt-2" :size="40"><img :src="`${$url}logo.svg`" class="bg-white" /></a-avatar>
    <!-- <ul class="mt-1 parent-menu-container">
      <template
        v-for="(bigMenu, index) in userStore.routers"
        :key="index"
      >
        <li
          :class="`${classStyle}`"
          @click="() => {
            keepAliveStore.menuLoader = false
            loadMenu(bigMenu, index)
          }"
        >
          <component v-if="bigMenu.meta.icon" :is="bigMenu.meta.icon" class="text-xl mt-1" />
          <span
            class="mt-0.5"
            :style="appStore.language === 'en' ? 'font-size: 10px' : ''"
          >{{ appStore.i18n ? ( $t(`menus.${bigMenu.name}`).indexOf('.') > 0 ? bigMenu.meta.title : $t(`menus.${bigMenu.name}`) ) : bigMenu.meta.title }}</span>
        </li>
      </template>
    </ul> -->
  </div>
  <div class="layout-menu shadow flex flex-col" v-show="showMenu">
    <div class="menu-title flex items-center" v-show="! appStore.menuCollapse">{{ title }}</div>
    <a-layout-sider
      :style="
        `width: ${appStore.menuCollapse ? '50px' : appStore.menuWidth + 'px'};
        height: ${appStore.menuCollapse ? '100%' : 'calc(100% - 51px)'};`"
      >
      <ma-menu ref="MaMenuRef" :class="appStore.menuCollapse ? 'ml-0.5' : ''" />
    </a-layout-sider>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import MaMenu from '../ma-menu.vue'

  import { useAppStore, useKeepAliveStore } from '@/store'

  const route = useRoute()
  const router = useRouter()

  const MaMenuRef = ref(null)
  const appStore = useAppStore()
  // const userStore = useUserStore()
  const keepAliveStore = useKeepAliveStore()
  const showMenu = ref(false)

  const title = ref('')
  const classStyle = ref('flex flex-col parent-menu items-center rounded mt-1 text-gray-200 hover:bg-gray-700 dark:hover:text-gray-50 dark:hover:bg-blackgray-1')

  onMounted(() => {
    keepAliveStore.menuLoader = true
    initMenu(true)
  })

  watch(() => route, v => {
    keepAliveStore.menuLoader = false
    initMenu(false)
  }, { deep: true })

  const initMenu = (init = true) => {
    let current
    if (route.matched[1]?.meta?.breadcrumb) {
      current = route.matched[1].meta.breadcrumb[0].name
    } else {
      current = 'home'
    }
    console.log(current)
    // if (userStore.routers && userStore.routers.length > 0) {
    //   userStore.routers.map((item, index) => {
    //     if (item.name == current) loadMenu(item, index, init)
    //   })
    // }
  }

  const loadMenu = (bigMenu, index, isInit = true) => {
    if (bigMenu.meta.type === 'L') {
      window.open(bigMenu.path)
      return
    }
    if (bigMenu.children.length > 0) {
      if (bigMenu.redirect && isInit && !keepAliveStore.menuLoader) {
        router.push(bigMenu.redirect)
      }
      MaMenuRef.value.loadChildMenu(bigMenu)
      showMenu.value = true
    } else {
      showMenu.value = false
      router.push(bigMenu.path)
    }
    title.value = MaMenuRef.value?.title
    document.querySelectorAll('.parent-menu').forEach( (item, id) => {
      index !== id ? item.classList.remove('active') : item.classList.add('active')
    })
  }
</script>

<style>
.parent-menu-container {
  width: 62px;
}
.parent-menu {
  width: 62px; padding: 5px; height: 57px; cursor: pointer; font-size: 13px;
  fill: #fff; transition: all .2s;
}
.parent-menu.active {
  background: rgb(var(--primary-6)); color: #fff;
}
:deep(.arco-menu-vertical .arco-menu-inner) {
  padding: 4px;
}
:deep(.arco-menu-vertical .arco-menu-item) {
  padding: 0px 9px; line-height: 36px;
}
</style>
