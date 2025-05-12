<template>
  <div class="ma-content-block p-4 mb-3 min-height">
    <!-- 设置支付密码 -->
    <safe-password-setting
      v-if="showSafewordDialog"
      v-model:visible="showSafewordDialog"
      @cancel="closePage"
    ></safe-password-setting>

    <!-- 确认弹窗 -->
    <pc-confirm-dialog
      v-if="showConfirmDialog"
      v-model:visible="showConfirmDialog"
      :message="t('实名认证尚未完成')"
      :confirmText="t('查看认证进度')"
      @confirm="confirmPage"
      @cancel="closePage"
    ></pc-confirm-dialog>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { useUserStore } from '@/store'
  import { navigationTo } from '@/utils'
  import { closeTag } from '@/utils/common'

  const { t } = useI18n()

  const route = useRoute()
  const userStore = useUserStore()
  const userInfo = computed(() => userStore.userInfo)
  const hasSafeword = computed(() => userInfo.value.safeword)
  const hasCerted = computed(() => userInfo.value.kyc_status === 2)

  const showSafewordDialog = ref(false)
  const showConfirmDialog = ref(false)

  const checkCert = () => {
    if (!hasSafeword.value) {
      showSafewordDialog.value = true
    } else {
      if (!hasCerted.value) {
        showConfirmDialog.value = true
      }
    }
  }

  const confirmPage = () => {
    closePage()
    navigationTo('/other/shop-setting?cert=1')
  }

  const closePage = () => {
    const { fullPath, name, meta } = route
    const tag = {
      name,
      title: meta.title,
      path: fullPath,
    }
    closeTag(tag)
  }

  onMounted(() => {
    checkCert()
  })

  watch(() => hasSafeword.value, () => {
    checkCert()
  })
</script>

<style lang="less" scoped></style>
