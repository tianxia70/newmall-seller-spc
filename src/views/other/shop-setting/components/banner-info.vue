<template>
  <a-card :title="t('横幅设置')">
    <a-form ref="formRef" :model="formState" layout="vertical" style="max-width: 1200px;">
      <a-form-item field="banner1" :label="`${t('店铺横幅')}1 (1920x300)`" class="banner-item">
        <Uploader
          v-model="formState.banner1"
          :before-read="(file) => beforeRead(file)"
          :after-read="(file) => afterRead(file, 'banner1')"
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
      <a-form-item field="banner2" :label="`${t('店铺横幅')}2 (1920x300)`" class="banner-item">
        <Uploader
          v-model="formState.banner2"
          :before-read="(file) => beforeRead(file)"
          :after-read="(file) => afterRead(file, 'banner2')"
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
      <a-form-item field="banner3" :label="`${t('店铺横幅')}3 (1920x300)`" class="banner-item">
        <Uploader
          v-model="formState.banner3"
          :before-read="(file) => beforeRead(file)"
          :after-read="(file) => afterRead(file, 'banner3')"
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
    </a-form>
    <div class="flex justify-center mt-3" style="max-width: 1200px;">
      <a-button type="primary" :loading="subLoading" @click="submitHandle">{{ t('保存') }}</a-button>
    </div>
  </a-card>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { Uploader } from 'vant'
  import { Message, Notification } from '@arco-design/web-vue'
  import { compressImage, getImageSize } from '@/utils'
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
    banner1: sellerInfo.value.banner1 ? [{ url: sellerInfo.value.banner1 }] : [],
    banner2: sellerInfo.value.banner2 ? [{ url: sellerInfo.value.banner2 }] : [],
    banner3: sellerInfo.value.banner3 ? [{ url: sellerInfo.value.banner3 }] : []
  })

  const onOversize = () => {
    Message.error(t('图片大小不能超过{0}', ['10MB']))
  }

  const beforeRead = async (file) => {
    const {width, height} = await getImageSize(file)
    if (width !== 1920 || height !== 300) {
      Notification.error({
        title: t('图片尺寸不符合要求'),
        content: `${t('上传文件的图片大小不合符标准,标准尺寸为1920×300。当前上传图片的尺寸为：')} ${width}x${height}`
      })
      return Promise.reject()
    }
    return Promise.resolve()
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
      params.banner1 = params.banner1.length ? params.banner1[0].url : ''
      params.banner2 = params.banner2.length ? params.banner2[0].url : ''
      params.banner3 = params.banner3.length ? params.banner3[0].url : ''

      subLoading.value = true
      sellerUpdate(params).then(async () => {
        await userStore.getSellerInfo()
        subLoading.value = false

        Message.success('保存成功')
      }).catch(() => {
        subLoading.value = false
      })
    }
  }
</script>

<style lang="less" scoped>
.banner-item {
  :deep(.van-uploader),
  :deep(.van-uploader__wrapper) {
    width: 100%;
    max-width: 1200px;
    height: auto;
    aspect-ratio: 64 / 10;
    overflow: hidden;
    margin: 0;
  }
  :deep(.van-uploader__preview-image) {
    width: 100%;
    max-width: 1200px;
    height: auto;
    aspect-ratio: 64 / 10;
    overflow: hidden;
    margin: 0;
  }
  :deep(.van-uploader__upload) {
    width: 100%;
    max-width: 1200px;
    height: auto;
    aspect-ratio: 64 / 10;
    margin: 0;
  }
}

</style>
