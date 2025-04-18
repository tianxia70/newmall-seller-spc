<template>
  <a-modal v-model:visible="visible" width="600px" @cancel="close" :footer="false">
    <template #title>皮肤</template>
    <div class="flex flex-col">
      <a-card
        v-for="(item, index) in skinList"
        :key="item.name"
        :class="index === 0 ? '' : 'mt-3'"
        :body-style="{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '10px' }"
      >
        <a-row class="w-full flex items-center">
          <a-col :span="3" class="flex flex-col text-center">
            <div class="leading-6">AAAAAAAA</div>
          </a-col>
          <a-col :span="6" class="flex flex-col text-center">
            <a-image :src="siteConfig.logo" class="rounded border" />
          </a-col>
          <a-col :span="12" class="flex items-center pl-3 pr-3">
            皮肤描述
          </a-col>
          <a-col :span="3" class="flex items-center justify-end">
            <a-button
              :type="appStore.skin === item.name ? 'primary' : 'secondary'"
              :disabled="appStore.skin === item.name"
              @click="useSkin(item.name)"
            >
              {{ appStore.skin === item.name ? 'BBBBBBBB' : 'CCCCCCCC' }}
            </a-button>
          </a-col>
        </a-row>
      </a-card>
    </div>
  </a-modal>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAppStore } from '@/store'
import skins from '@/configs/skins'
import { loadSiteConfig } from '@/utils'

const appName = import.meta.env.VITE_APP
const siteConfig = ref({})

const visible = ref(false)
const appStore = useAppStore()

const open = () => visible.value = true
const close = () => visible.value = false

const useSkin = (name) => appStore.useSkin(name)

const skinList = reactive(skins)

onMounted(async () => {
  siteConfig.value = await loadSiteConfig(appName)
})

defineExpose({ open })
</script>

<style scoped lang="less">
</style>