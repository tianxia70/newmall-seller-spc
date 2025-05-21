<template>
  <a-card :title="t('基础信息')">
    <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical" style="max-width: 1200px;">
      <a-row :gutter="24">
        <a-col :span="24">
          <a-form-item field="avatar" :label="t('店铺LOGO')" >
            <Uploader
              v-model="formState.avatar"
              :after-read="(file) => afterRead(file, 'avatar')"
              :max-count="1"
              :readonly="false"
              :preview-options="{
                closeOnClickOverlay: true,
                closeable: true
              }"
              :max-size="10 * 1024 * 1024"
              @oversize="onOversize"
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item field="name" :label="t('店铺名称')" >
            <a-input :placeholder="t('请输入店铺名称')" v-model="formState.name" allow-clear></a-input>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item field="contact" :label="t('联系人')" >
            <a-input :placeholder="t('请输入联系人姓名')" v-model="formState.contact" allow-clear></a-input>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item field="shopPhone" :label="t('店铺电话')" >
            <a-input :placeholder="t('请输入店铺电话')" v-model="formState.shopPhone" allow-clear></a-input>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item field="shopAddress" :label="t('店铺地址')" >
            <a-input :placeholder="t('请输入店铺地址')" v-model="formState.shopAddress" allow-clear></a-input>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item field="shopRemark" :label="t('店铺简介')" >
            <a-textarea
              :placeholder="t('请输入店铺简介')"
              :show-word-limit="true"
              :max-length="500"
              v-model="formState.shopRemark"
              allow-clear
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item field="imInitMessage" :label="t('进店欢迎语')" >
            <a-textarea
              :placeholder="t('请输入进店欢迎语')"
              :show-word-limit="true"
              :max-length="200"
              v-model="formState.imInitMessage"
              allow-clear
            />
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
  import { ref, reactive, computed } from 'vue'
  import { Uploader } from 'vant'
  import { Message } from '@arco-design/web-vue'
  import { compressImage } from '@/utils'
  import { imageUpload } from '@/api/system'
  import { sellerUpdate } from '@/api/seller'
  import { useI18n } from 'vue-i18n'
  import { useUserStore } from '@/store'
  import { cloneDeep } from 'lodash-es'

  const { t } = useI18n()
  const userStore = useUserStore()
  const sellerInfo = computed(() => userStore.sellerInfo)

  const formRef = ref()
  const formState = ref({
    avatar: sellerInfo.value.avatar ? [{ url: sellerInfo.value.avatar }] : [],
    name: sellerInfo.value.name || '',
    contact: sellerInfo.value.contact || '',
    shopPhone: sellerInfo.value.shopPhone || '',
    shopAddress: sellerInfo.value.shopAddress || '',
    shopRemark: sellerInfo.value.shopRemark || '',
    imInitMessage: sellerInfo.value.imInitMessage || ''
  })
  const formRules = reactive({
    avatar: [{ required: true, message: t('请上传店铺LOGO'), trigger: 'change'}],
    name: [{ required: true, message: t('请输入店铺名称'), trigger: 'blur'}]
  })

  const onOversize = () => {
    Message.error(t('图片大小不能超过{0}', ['10MB']))
  }

  const afterRead = async (file, moduleName) => {
    file.status = 'uploading'
    file.message = t('上传中...')

    try {
      // 如果文件大于10MB，直接提示并返回
      if (file.file.size > 10 * 1024 * 1024) {
        Message.error(t('图片大小不能超过{0}', ['10MB']))
        file.status = 'failed'
        return
      }

      const compressedFile = await compressImage(file.file)

      const formData = new FormData();// 通过formdata上传
      formData.append('file', compressedFile);
      formData.append('moduleName', moduleName)
      imageUpload(formData).then(res => {
        file.status = 'success'
        file.message = t('上传成功')
        file.url = res.url

        formRef.value.validateField(moduleName)

      }).catch(function (err) {
        file.status = 'failed'
        file.message = t('上传失败')

        formState.value[moduleName] = []
      })
    } catch (error) {
      console.error('Upload error:', error)
      file.status = 'failed'
    }
  }

  const subLoading = ref(false)
  const submitHandle = async () => {
    const valid = await formRef.value.validate()
    if (!valid) {
      const params = cloneDeep(formState.value)
      if (params.avatar.length) {
        params.avatar = params.avatar[0].url
      }

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
