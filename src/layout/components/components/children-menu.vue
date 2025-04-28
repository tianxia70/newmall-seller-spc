<template>
  <a-layout-content class="sys-menus" :class="{'ar': isArLang()}">
    <template v-for="menu in modelValue" :key="menu.id">
      <template v-if="!menu.meta.hidden">
        <a-menu-item
          v-if="! menu.children || menu.children.length === 0"
          :key="menu.name"
          @click="routerPush(menu)"
        >
          <template #icon v-if="menu.meta.icon">
            <component :is="menu.meta.icon" :class="menu.meta.icon.indexOf('ma') > 0 ? 'icon' : ''" />
          </template>
          <a-badge v-if="menu.path === '/order'" :count="orderCount" :offset="[15, 0]">
            {{ t(menu.meta.title) }}
          </a-badge>
          <template v-else>{{ t(menu.meta.title) }}</template>
        </a-menu-item>
        <a-sub-menu v-else :key="menu.name || menu.meta.name">
          <template #icon v-if="menu.meta.icon">
            <component :is="menu.meta.icon" :class="menu.meta.icon.indexOf('ma') > 0 ? 'icon' : ''" />
          </template>
          <template #title @click="routerPush(menu.path)">
            {{ t(menu.meta.title) }}
          </template>
          <template v-if="menu.children">
            <children-menu v-model="menu.children" />
          </template>
        </a-sub-menu>
      </template>
    </template>
  </a-layout-content>
</template>
<script setup>
  import { computed } from 'vue'
  import { useTagStore, useSystemStore } from '@/store'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { isArLang } from '@/utils'

  const { t } = useI18n()

  defineProps({ modelValue: Array })

  const router = useRouter()
  const emits  = defineEmits(['go'])
  const tagStore = useTagStore()
  const systemStore = useSystemStore()

  const orderCount = computed(() => systemStore.order_count)

  const routerPush = (menu) => {
    if (menu.meta && menu.meta.type === 'L') {
      window.open(menu.path)
    } else if (menu.path) {
      router.push(menu.path)
      tagStore.addTag({ name: menu.name, title: menu.meta.title, path: menu.path })
    } else {
      console.warn('菜单未配置组件或者path')
    }
  }
</script>

<style lang="less" scoped>
.sys-menus {
  .icon {
    width: 1em; height: 1em;
  }
  &.ar {
    :deep(.arco-menu-icon) {
      margin-right: 0 !important;
      margin-left: 16px !important;
    }
    :deep(.arco-menu-pop-header) {
      padding-right: 12px !important;
    }
  }
}
.arco-menu-selected .icon {
  fill: rgb(var(--primary-6));
}
</style>