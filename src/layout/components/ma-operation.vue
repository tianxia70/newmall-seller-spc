<template>
  <div class="mr-2 flex justify-end lg:justify-between w-full lg:w-auto">
    <div class="flex items-center gap-5">
      <div v-if="systemNotice" class="notice-content">
        <notice-bar
          left-icon="volume-o"
          scrollable
          :text="systemNotice"
        />
      </div>
      <message-content></message-content>
      <language-picker></language-picker>
      <currency-picker></currency-picker>
      <div class="user-content">
        <van-image
          fit="cover"
          width="30"
          height="30"
          round
          :src="showAvatar"
        />
        <p>{{ showUserName }}</p>
        <icon-poweroff :size="17" @click="logoutHandle" />
      </div>
    </div>

    <!-- 配置信息: 不展示用户换肤 -->
    <a-space v-if="rootView" class="mr-0 lg:mr-5" size="medium">
      <a-tooltip :content="'搜索'" >
        <a-button :shape="'circle'" @click="() => appStore.searchOpen = true" class="hidden lg:inline">
          <template #icon>
            <icon-search />
          </template>
        </a-button>
      </a-tooltip>

      <a-tooltip :content="isFullScreen ? '关闭全屏' : '全屏'">
        <a-button :shape="'circle'" class="hidden lg:inline" @click="screen">
          <template #icon>
            <icon-fullscreen-exit v-if="isFullScreen" />
            <icon-fullscreen v-else />
          </template>
        </a-button>
      </a-tooltip>

      <a-tooltip :content="'页面设置'">
        <a-button :shape="'circle'" @click="() => appStore.settingOpen = true" class="hidden lg:inline">
          <template #icon>
            <icon-settings />
          </template>
        </a-button>
      </a-tooltip>
    </a-space>
  </div>
</template>


<script setup>
  import { ref, computed } from 'vue'
  import { useAppStore, useUserStore, useSystemStore } from '@/store'
  import tool from '@/utils/tool'
  import { NoticeBar, Image as VanImage} from 'vant'
  import { userAvatarData } from '@/configs'
  import messageContent from './message-content.vue'

  const appStore  = useAppStore()
  const systemStore  = useSystemStore()
  const userStore = useUserStore()
  const isFullScreen = ref(false)

  const userInfo = computed(() => userStore.userInfo)
  const systemNotice = computed(() => systemStore.system_notice)

  const defaultAvatar = new URL('@/assets/images/avatar/default_avatar.png', import.meta.url)
  const showAvatar = computed(() => {
    if (userInfo.value && (userInfo.value.avatar || userInfo.value.icon)) {
      if (userInfo.value.icon) {
        return userInfo.value.icon
      } else {
        if (isNaN(Number(userInfo.value.avatar))) {
          return userInfo.value.avatar
        } else {
          const avatar = userAvatarData[Number(userInfo.value.avatar)]
          return avatar ? avatar.href : defaultAvatar.href
        }
      }
    } else {
      return defaultAvatar.href
    }
  })

  const showUserName = computed(() => {
    let username = userInfo.value.username || userInfo.value.phone || userInfo.value.email
    if (username.indexOf('@') === -1) {
      username = '+' + username
    }
    return username
  })

  const rootView = ref(false)

  const screen = () => {
    tool.screen(document.documentElement)
    isFullScreen.value = !isFullScreen.value
  }

  const logoutHandle = () => {
    userStore.logout()
  }

</script>
<style scoped lang="less">
:deep(.arco-avatar-text) {
  top: 1px;
}
:deep(.arco-divider-horizontal) {
  margin: 5px 0;
}

.notice-content {
  width: 340px;
  overflow: hidden;
  .van-notice-bar {
    background: transparent !important;
    color: var(--color-text-1);
    :deep(.van-icon) {
      color: rgb(var(--primary-6));
    }
  }
}

.user-content {
  height: 50px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-1);
  .arco-icon {
    color: rgb(248, 40, 90);
    cursor: pointer;
  }
}
</style>
