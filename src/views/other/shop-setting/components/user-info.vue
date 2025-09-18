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

    <!-- 认证手机号、邮箱弹窗 -->
    <pe-verifed-dialog
      v-model:visible="showPeVerifedDialog"
      :type="currentType"
    ></pe-verifed-dialog>

    <!-- 设置\修改 手机号、邮箱弹窗-不需要验证 -->
    <pe-set-notcode-dialog
      v-model:visible="showSetNotcodeDialog"
      :type="currentType"
      :is-modify="isModify"
    ></pe-set-notcode-dialog>

    <!-- 设置\修改 手机号、邮箱弹窗-需要验证 -->
    <pc-set-code-dialog
      v-model:visible="showPcSetCodeDialog"
      :type="currentType"
      :is-modify="isModify"
    ></pc-set-code-dialog>

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
                <p class="main-color mr-2">{{ kycName }}</p>
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
        <div v-if="showPhoneSetting" class="item">
          <p>{{ t('手机号') }}</p>
          <div class="flex items-center justify-end gap-2">
            <template v-if="phone">
              <div class="flex items-center gap-1 justify-end">
                <p class="main-color mr-2">{{ phone }}</p>
                <van-image
                  fit="cover"
                  width="20"
                  height="20"
                  :src="kycStatusIcon[phoneverif ? 1 : 0].href"
                />
                <p>{{ phoneverif ? t('已认证') : t('待认证') }}</p>
              </div>
              <a-link @click="peHandle('phone', true, phoneverif)">{{ phoneverif ? t('修改') : t('认证手机号') }}</a-link>
            </template>
            <template v-else>
              <div class="flex items-center gap-1 justify-end">
                <van-image
                  fit="cover"
                  width="20"
                  height="20"
                  :src="kycStatusIcon[2].href"
                />
                <p>{{ t('未设置') }}</p>
              </div>
              <a-link @click="peHandle('phone', false)">{{ t('设置') }}</a-link>
            </template>
          </div>
        </div>
        <div v-if="showEmailSetting" class="item">
          <p>{{ t('邮箱') }}</p>
          <div class="flex items-center justify-end gap-2">
            <template v-if="email">
              <div class="flex items-center gap-1 justify-end">
                <p class="main-color mr-2">{{ email }}</p>
                <van-image
                  fit="cover"
                  width="20"
                  height="20"
                  :src="kycStatusIcon[emailverif ? 1 : 0].href"
                />
                <p>{{ emailverif ? t('已认证') : t('待认证') }}</p>
              </div>
              <a-link @click="peHandle('email', true, emailverif)">{{ emailverif ? t('修改') : t('认证邮箱') }}</a-link>
            </template>
            <template v-else>
              <div class="flex items-center gap-1 justify-end">
                <van-image
                  fit="cover"
                  width="20"
                  height="20"
                  :src="kycStatusIcon[2].href"
                />
                <p>{{ t('未设置') }}</p>
              </div>
              <a-link @click="peHandle('email', false)">{{ t('设置') }}</a-link>
            </template>
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
  import { navigationTo, isTruthy } from '@/utils'
  import PeVerifedDialog from './pe-verifed-dialog.vue'
  import PeSetNotcodeDialog from './pe-set-notcode-dialog.vue'
  import PcSetCodeDialog from './pc-set-code-dialog.vue'

  const { t } = useI18n()
  const appName = import.meta.env.VITE_APP

  const userStore = useUserStore()
  const userInfo = computed(() => userStore.userInfo)

  // 0-> 待认证 1-> 认证中 2-> 认证成功 3-> 认证失败
  const kycStatus = computed(() => userInfo.value.kyc_status)

  const kycName = computed(() => userInfo.value.name)

  const hasSafeword = computed(() => userInfo.value.safeword)

  const signPdfUrl = computed(() => userInfo.value.signPdfUrl)

  // 显示修改资金、登录密码
  const showPasswordSetting = computed(() => {
    return !['familyMart'].includes(appName)
  })

  // 显示手机号
  const showPhoneSetting = computed(() => {
    return !['ottoGroup', 'klepierre', 'familyMart', 'flipkart3'].includes(appName)
  })

  // 显示邮箱
  const showEmailSetting = computed(() => {
    return !['familyMart'].includes(appName)
  })

  // 手机号有值就显示已认证
  const showPhoneDefaultVer = computed(() => {
    return ['familyShop', 'selfridges', 'flipkart', 'tiktok2', 'matches'].includes(appName)
  })

  // 邮箱有值就显示已认证
  const showEmailDefaultVer = computed(() => {
    return ['sm', 'familyShop', 'selfridges', 'flipkart', 'matches'].includes(appName)
  })

  // 修改手机号不需要验证码
  const modifyPhoneNotCode = computed(() => {
    return ['sm', 'familyShop', 'selfridges', 'flipkart', 'tiktok2', 'matches'].includes(appName)
  })

  // 修改邮箱不需要验证码
  const modifyEmailNotCode = computed(() => {
    return ['flipkart', 'matches'].includes(appName)
  })

  // 显示注销账号
  const showCancellation = computed(() => {
    return ['argos', 'argos2'].includes(appName)
  })

  const emailverif = computed(() => (isTruthy(userInfo.value?.emailverif || false) || showEmailDefaultVer.value))
  const email = computed(() => {
    const value = userInfo.value?.email || ''
    if (value) {
      return value.replace(/(\w{1})\w{1,}(\w{1})/, '$1****$2')
    }
    return ''
  })

  const phoneverif = computed(() => (isTruthy(userInfo.value?.phoneverif || false) || showPhoneDefaultVer.value))
  const phone = computed(() => {
    const value = userInfo.value?.phone || ''
    if (value) {
      const index = value.indexOf(' ');
      return '+' + value.substring(0, index + 1) + value.substring(index, index + 4) + '****' + value.substring(value.length - 2, value.length);
    }
    return ''
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

  const showPeVerifedDialog = ref(false)
  const showSetNotcodeDialog = ref(false)
  const showPcSetCodeDialog = ref(false)
  const currentType = ref('phone')
  const isModify = ref(false)

  const peHandle = (type, flag, verif) => {
    currentType.value = type

    if (flag) { // 认证、修改
      if (verif) { // 修改
        isModify.value = true
        if ((type === 'phone' && modifyPhoneNotCode.value) || (type === 'email' && modifyEmailNotCode.value)) { // 不需要验证码
          showSetNotcodeDialog.value = true
        } else { // 需要验证码
          showPcSetCodeDialog.value = true
        }
      } else { // 认证
        showPeVerifedDialog.value = true
      }
    } else { // 设置
      isModify.value = false
      if ((type === 'phone' && modifyPhoneNotCode.value) || (type === 'email' && modifyEmailNotCode.value)) { // 不需要验证码
        showSetNotcodeDialog.value = true
      } else { // 需要验证码
        showPcSetCodeDialog.value = true
      }
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
