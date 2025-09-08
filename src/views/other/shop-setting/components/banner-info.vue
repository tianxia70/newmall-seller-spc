<template>
  <a-card :title="t('横幅设置')">
    <PictureCropper v-model:visible="pictureCropperVisible" :file="pictureCropperFile" :width="1920" :height="300" @confirm="pictureCropperConfirm" />

    <a-form ref="formRef" :model="formState" layout="vertical" style="max-width: 1200px;">
      <a-form-item field="banner1" :label="`${t('店铺横幅')}1 (1920x300)`" class="banner-item">
        <Uploader
          v-model="formState.banner1"
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
  import { Message } from '@arco-design/web-vue'
  import { compressImage } from '@/utils'
  import { imageUpload } from '@/api/system'
  import { sellerUpdate } from '@/api/seller'
  import { useI18n } from 'vue-i18n'
  import { useUserStore } from '@/store'
  import { cloneDeep } from 'lodash-es'
  import PictureCropper from '@/components/picture-cropper/index.vue'

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

  const imageUploadHandle = async (file, moduleName) => {
    formState.value[moduleName] = [{
      status: 'uploading',
      message: t('上传中...')
    }]

    file.status = 'uploading'
    file.message = t('上传中...')

    try {
      // 如果文件大于10MB，直接提示并返回
      if (file.file.size > 10 * 1024 * 1024) {
        Message.error(t('图片大小不能超过{0}', ['10MB']))
        formState.value[moduleName][0].status = 'failed'
        file.status = 'failed'
        return
      }

      const compressedFile = await compressImage(file.file)

      const formData = new FormData();// 通过formdata上传
      formData.append('file', compressedFile);
      formData.append('moduleName', moduleName)
      imageUpload(formData).then(res => {
        formState.value[moduleName] = [{
          message: t('上传成功'),
          url: res.url,
          status: 'success'
        }]

        file.status = 'success'
        file.message = t('上传成功')
        file.url = res.url

        formRef.value.validateField(moduleName)

      }).catch(function (err) {
        formState.value[moduleName][0].status = 'failed'
        formState.value[moduleName][0].message = t('上传失败')

        file.status = 'failed'
        file.message = t('上传失败')

        formState.value[moduleName] = []
      })
    } catch (error) {
      console.error('Upload error:', error)
      file.status = 'failed'
    }
  }

  const currentModuleName = ref('')
  const pictureCropperVisible = ref(false)
  const pictureCropperFile = ref(null)
  const afterRead = async (file, moduleName) => {
    currentModuleName.value = moduleName
    pictureCropperFile.value = file.file
    pictureCropperVisible.value = true
  }

  const pictureCropperConfirm = async (obj) => {
    const file = {
      file: obj.file,
      content: obj.dataURL,
      objectUrl: obj.blobURL,
      message: '',
      status: ''
    }
    await imageUploadHandle(file, currentModuleName.value)
  }

  const subLoading = ref(false)
  const submitHandle = async () => {
    const valid = await formRef.value.validate()
    if (!valid) {
      const params = cloneDeep(formState.value)
      if (params.banner1[0]?.status === 'uploading' || params.banner2[0]?.status === 'uploading' || params.banner3[0]?.status === 'uploading') {
        Message.error(t('请等待图片上传完成'))
        return false
      }

      params.banner1 = params.banner1.length ? params.banner1[0].url : ''
      params.banner2 = params.banner2.length ? params.banner2[0].url : ''
      params.banner3 = params.banner3.length ? params.banner3[0].url : ''

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
  :deep(.van-uploader__preview),
  :deep(.van-uploader__file) {
    width: 100%;
    height: 100%;
    margin: 0 !important;
  }
}

</style>
