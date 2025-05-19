<template>
  <div>
    <!-- 设置支付密码 -->
    <safe-password-setting
      v-if="showSafewordDialog"
      v-model:visible="showSafewordDialog"
    ></safe-password-setting>

    <!-- 修改密码弹窗 -->
    <password-dialog
      v-model:visible="showPasswordDialog"
      :is-safeword="isSafeword"
    ></password-dialog>

    <!-- 注销账号弹窗 -->
    <cancellation-dialog
      v-model:visible="showCancellationDialog"
    ></cancellation-dialog>

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
        <div v-if="showPasswordSetting" class="item">
          <p>{{ t('资金密码') }}</p>
          <div class="flex items-center justify-end gap-2">
            <a-link v-if="hasSafeword" @click="changePassword(true)">{{ t('修改') }}</a-link>
            <a-link v-else @click="showSafewordDialog = true">{{ t('设置') }}</a-link>
          </div>
        </div>
        <div v-if="showPasswordSetting" class="item">
          <p>{{ t('登录密码') }}</p>
          <div class="flex items-center justify-end gap-2">
            <a-link @click="changePassword(false)">{{ t('修改') }}</a-link>
          </div>
        </div>
        <div v-if="signPdfUrl" class="item">
          <p>{{ t('电子合同') }}</p>
          <div class="flex items-center justify-end gap-2">
            <a-link @click="navigationTo(signPdfUrl, true)">{{ t('查看') }}</a-link>
          </div>
        </div>
        <div v-if="showCancellation" class="item">
          <p>{{ t('注销账号') }}</p>
          <div class="flex items-center justify-end gap-2">
            <a-link @click="openCancellationDialog">{{ t('立即注销') }}</a-link>
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
  import PasswordDialog from './password-dialog.vue'
  import CancellationDialog from './cancellation-dialog.vue'
  import { navigationTo } from '@/utils'

  const { t } = useI18n()
  const appName = import.meta.env.VITE_APP

  const userStore = useUserStore()
  const userInfo = computed(() => userStore.userInfo)

  // 0-> 待认证 1-> 认证中 2-> 认证成功 3-> 认证失败
  const kycStatus = computed(() => userInfo.value.kyc_status)

  const hasSafeword = computed(() => userInfo.value.safeword)

  const signPdfUrl = computed(() => userInfo.value.signPdfUrl)

  // 显示修改资金、登录密码
  const showPasswordSetting = computed(() => {
    return !['familyMart'].includes(appName)
  })

  // 显示注销账号
  const showCancellation = computed(() => {
    return ['argos', 'argos2'].includes(appName)
  })

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

  const showSafewordDialog = ref(false)

  const showPasswordDialog = ref(false)
  const isSafeword = ref(false)

  const changePassword = (flag) => {
    isSafeword.value = flag
    showPasswordDialog.value = true
  }

  const showCancellationDialog = ref(false)
  const openCancellationDialog = () => {
    if (hasSafeword.value) {
      showCancellationDialog.value = true
    } else {
      showSafewordDialog.value = true
    }
  }
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
