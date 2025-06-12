<template>
  <a-layout-content class="h-full main-container">
    <columns-layout v-if="appStore.layout === 'columns'" />
    <classic-layout v-if="appStore.layout === 'classic'" />
    <banner-layout v-if="appStore.layout === 'banner'" />
    <mixed-layout v-if="appStore.layout === 'mixed'" />

    <setting ref="settingRef"/>

    <transition name="ma-slide-down" mode="out-in">
      <system-search ref="systemSearchRef" v-show="appStore.searchOpen" />
    </transition>

    <ma-button-menu />

    <!-- 通知弹窗组件 -->
    <notice-alert-dialog></notice-alert-dialog>

    <!-- 活动入口 -->
    <div v-if="showLottery" class="activity-entry" :style="{ top: currentTop + 'px' }" @mousedown="handleMouseDown">
      <div class="activity-entry-content">
        <img :src="lotteryImg.href" alt="" class="lottery-img">
        <img :src="lotteryCloseImg.href" alt="" class="lottery-close-img" @click="showLottery = false">
      </div>
      <div class="activity-entry-button" @click="handleLottery">{{ t('幸运抽奖') }}</div>
    </div>

    <div class="max-size-exit" @click="tagExitMaxSize"><icon-close /></div>
  </a-layout-content>
</template>
<script setup>
  import { onMounted, ref, watch, onUnmounted } from 'vue'
  import { useAppStore } from '@/store'
  import { useI18n } from 'vue-i18n'
  import { getToken } from "@/utils/token-util.js";
  import { getCurrentActivity } from '@/api/system'

  import ColumnsLayout from './components/columns/index.vue'
  import ClassicLayout from './components/classic/index.vue'
  import BannerLayout from './components/banner/index.vue'
  import MixedLayout from './components/mixed/index.vue'
  import Setting from './setting.vue'
  import SystemSearch from './search.vue'
  import MaButtonMenu from './components/ma-buttonMenu.vue'
  import NoticeAlertDialog from './components/notice-alert-dialog.vue'

  const appStore = useAppStore()
  const { t, locale } = useI18n()

  const settingRef = ref()
  const systemSearchRef = ref()
  
  // 拖拽相关变量
  const isDragging = ref(false)
  const startY = ref(0)
  const startTop = ref(200)
  const currentTop = ref(200)

  // 开始拖拽
  const handleMouseDown = (e) => {
    e.preventDefault() // 防止默认行为
    isDragging.value = true
    startY.value = e.clientY
    startTop.value = currentTop.value
  }

  // 拖拽中
  const handleMouseMove = (e) => {
    if (!isDragging.value) return
    const deltaY = e.clientY - startY.value
    currentTop.value = Math.max(0, Math.min(window.innerHeight - 160, startTop.value + deltaY))
  }

  // 结束拖拽
  const handleMouseUp = () => {
    isDragging.value = false
  }

  watch(() => appStore.settingOpen, vl => {
    if (vl === true) {
      settingRef.value.open()
      appStore.settingOpen = false
    }
  })

  const tagExitMaxSize = () => {
    document.getElementById('app').classList.remove('max-size')
  }

  const lotteryImg = new URL('@/assets/images/lottery/lottery.png', import.meta.url)
  const lotteryCloseImg = new URL('@/assets/images/lottery/lottery_close.png', import.meta.url)

  const showLottery = ref(false)
  const detailUrl = ref('')
  const getCurrentActivityData = () => {
    getCurrentActivity().then(res => {
      showLottery.value = Number(res.status || 0) === 1
      detailUrl.value = res.detailUrl
    })
  }

  const handleLottery = () => {
    const token = getToken()
    const href = `${detailUrl.value}&token=${token}&lang=${locale.value}`
    window.open(href, '_blank')
  }

  onMounted(() => {
    getCurrentActivityData()

    // 添加全局鼠标事件监听
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    document.addEventListener('keydown', e => {
      const keyCode = e.keyCode ?? e.which ?? e.charCode
      const altKey = e.altKey ?? e.metaKey
      if(altKey && keyCode === 83) {
        appStore.searchOpen =  true
        return
      }

      if (keyCode === 27) {
        appStore.searchOpen = false
        return
      }
    })
  })

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })

</script>
<style scoped lang="less">
  .activity-entry {
    position: fixed;
    right: 24px;
    z-index: 3003;
    user-select: none;
    > .activity-entry-content {
      width: 130px;
      height: 130px;
      position: relative;
      > .lottery-img {
        width: 100%;
        height: auto;
        cursor: alias;
        position: relative;
        left: -4px;
      }
      > .lottery-close-img { 
        height: 18px;
        width: 18px;
        position: absolute;
        right: 0;
        top: 0;
        cursor: pointer;
      }
    }
    > .activity-entry-button {
      min-width: 100px;
      display: inline-block;
      height: 30px;
      line-height: 26px;
      text-align: center;
      border-radius: 30px;
      border: solid 2px #FFDE49;
      color: #FFFFFF;
      padding: 0 8px;
      font-size: 14px;
      cursor: pointer;
      background: linear-gradient(180deg, #9F3DC8 0%, #C975E5 100%);
      position: absolute;
      top: 90px;
      left: 50%;
      transform: translateX(-50%);
      //不换行
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
