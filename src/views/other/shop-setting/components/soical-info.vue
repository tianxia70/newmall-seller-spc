<template>
  <a-card :title="t('社交媒体')">
    <a-form ref="formRef" :model="formState" layout="vertical" style="max-width: 1200px;">
      <a-row :gutter="24">
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item field="facebook" label="Facebook">
            <a-input :placeholder="t('使用https插入链接')" v-model="formState.facebook" allow-clear></a-input>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item field="twitter" label="Twitter">
            <a-input :placeholder="t('使用https插入链接')" v-model="formState.twitter" allow-clear></a-input>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item field="google" label="Google">
            <a-input :placeholder="t('使用https插入链接')" v-model="formState.google" allow-clear></a-input>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item field="youtube" label="YouTube">
            <a-input :placeholder="t('使用https插入链接')" v-model="formState.youtube" allow-clear></a-input>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item field="instagram" label="Instagram">
            <a-input :placeholder="t('使用https插入链接')" v-model="formState.instagram" allow-clear></a-input>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div class="flex justify-center mt-3" style="max-width: 1200px;">
      <a-button type="primary" :loading="subLoading" @click="submitHandle">{{ t('保存') }}</a-button>
    </div>
  </a-card>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { sellerUpdate } from '@/api/seller'
  import { useI18n } from 'vue-i18n'
  import { useUserStore } from '@/store'
  import { cloneDeep } from 'lodash-es'

  const { t } = useI18n()
  const userStore = useUserStore()
  const sellerInfo = computed(() => userStore.sellerInfo)

  const formRef = ref()
  const formState = ref({
    facebook: sellerInfo.value.facebook || '',
    twitter: sellerInfo.value.twitter || '',
    google: sellerInfo.value.google || '',
    youtube: sellerInfo.value.youtube || '',
    instagram: sellerInfo.value.instagram || ''
  })

  const subLoading = ref(false)
  const submitHandle = async () => {
    const valid = await formRef.value.validate()
    if (!valid) {
      const params = cloneDeep(formState.value)

      subLoading.value = true
      sellerUpdate(params).then(async () => {
        await userStore.getSellerInfo()
        subLoading.value = false

        Message.success(t('保存成功'))
      }).catch(() => {
        subLoading.value = false
      })
    }
  }
</script>

<style lang="less" scoped></style>
