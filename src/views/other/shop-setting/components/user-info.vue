<template>
  <div>
    <a-card :title="t('个人信息')">
      <div class="user-info-content">
        <div class="item">
          <p>{{ t('头像') }}</p>
          <div class="flex items-center justify-end gap-2 avatar-box">
            <div class="avatar">
              <van-image
                fit="cover"
                width="50"
                height="50"
                :src="userAvatar"
              />
            </div>
            <a-link @click="avatarDialogVisible = true">{{ t('修改') }}</a-link>
          </div>
        </div>
        <div class="item">
          <p>{{ t('实名认证') }}</p>
          <div class="flex items-center justify-end gap-2">
            <template v-if="[1, 2, 3].includes(kycStatus)">
              <div class="flex items-center gap-1 justify-end">
                <van-image
                  fit="cover"
                  width="20"
                  height="20"
                  :src="kycStatusIcon[kycStatus - 1].href"
                />
                <p>{{ kycStatus === 1 ? t('审核中') : kycStatus === 2 ? t('认证通过') : t('认证失败') }}</p>
              </div>
              <a-link @click="certDialogVisible = true">{{ t('查看') }}</a-link>
            </template>
            <a-link v-else @click="certDialogVisible = true">{{ t('点击认证') }}</a-link>
          </div>
        </div>
      </div>
    </a-card>
    <avatar-dialog v-model:visible="avatarDialogVisible" />
    <cert-dialog v-model:visible="certDialogVisible" />
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useUserStore } from '@/store'
  import { userAvatarData } from '@/configs'
  import { Image as VanImage} from 'vant'
  import AvatarDialog from './avatar-dialog.vue'
  import CertDialog from './cert-dialog.vue'

  const { t } = useI18n()
  const userStore = useUserStore()
  const userInfo = computed(() => userStore.userInfo)

  // 0-> 待认证 1-> 认证中 2-> 认证成功 3-> 认证失败
  const kycStatus = computed(() => userInfo.value.kyc_status)

  const avatarDialogVisible = ref(false)
  const certDialogVisible = ref(false)
  const kycStatusIcon = [
    new URL('@/assets/images/verify/waiting.png', import.meta.url),
    new URL('@/assets/images/verify/success.png', import.meta.url),
    new URL('@/assets/images/verify/fail.png', import.meta.url),
  ]

  const userAvatar = computed(() => {
    const avatar = userInfo.value.avatar
    const num = Number(avatar)
    if (userInfo.value.icon) {
      return userInfo.value.icon
    }
    return userAvatarData[num].href
  })
</script>

<style lang="less" scoped>
.user-info-content {
  max-width: 590px;
  background-color: var(--color-fill-1);
  padding: 0 20px;
  border-radius: 10px;
  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 50px;
    border-bottom: 1px solid var(--color-border-2);
    padding: 10px 0;
    &:last-child {
      border-bottom: none;
    }
    .flex {
      color: var(--color-text-2);
      flex: 1;
    }
    .avatar-box {
      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        overflow: hidden;
      }
    }
  }
}
</style>
