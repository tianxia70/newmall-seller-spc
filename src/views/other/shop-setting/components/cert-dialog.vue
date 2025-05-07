<template>
  <a-modal
    :visible="visible"
    :width="600"
    :mask-closable="false"
    :esc-to-close="false"
    :closable="false"
  >
    <template #title>{{ t('实名认证') }}</template>

    <a-spin :loading="pageLoading" :size="32">
      <div v-if="Object.keys(kycInfo).length" class="cert-content">
        <a-alert :type="kycInfo.status === 1 ? 'warning' : kycInfo.status === 2 ? 'success' : kycInfo.status === 0 ? 'info' : 'error'" class="mb-3">
          <template #icon><i></i></template>
          <template #title>
            <div class="flex justify-between items-center">
              <p>{{ t('认证状态') }}</p>
              <div v-if="kycIconHref" class="flex items-center gap-1 justify-end">
                <van-image
                  fit="cover"
                  width="20"
                  height="20"
                  :src="kycIconHref"
                />
                <p>{{ kycInfo.status === 1 ? t('审核中') : kycInfo.status === 2 ? t('认证通过') : kycInfo.status === 0 ? t('待认证') : t('认证失败') }}</p>
              </div>
            </div>
          </template>
          <p v-if="kycInfo.msg">{{ kycInfo.msg }}</p>
        </a-alert>
        

        <a-form ref="formRef" :model="formState" layout="vertical">
          <a-form-item field="nationality" :label="t('国籍')" :rules="[{ required: true, message: t('请选择国籍') }]">
            <a-select
              v-model="formState.nationality"
              :placeholder="t('请选择国籍')"
              :disabled="certDisabled"
              allow-search
            >
              <a-option
                v-for="item in countrySelectData"
                :key="item.id"
                :label="item.i18nName"
                :value="item.id"
              />
            </a-select>
          </a-form-item>

          <a-form-item field="realName" :label="t('真实姓名')" :rules="[{ required: true, message: t('请输入真实姓名') }]">
            <a-input v-model="formState.realName" :disabled="certDisabled" :placeholder="t('请输入真实姓名')" />
          </a-form-item>
          
          <a-form-item field="idNumber" :label="`${t('证件')}/${t('护照号码')}`" :rules="[{ required: true, validator: validateIdNumber, trigger: 'blur' }]">
            <a-input v-model="formState.idNumber" :disabled="certDisabled" :placeholder="t('请输入您的证件/护照号码')" />
          </a-form-item>

          <div v-if="kycInfo.status !== 2" class="imgs-item" :class="{'around': hideImg3}">
            <div v-for="(item, index) in cetImgsItems" :key="index" class="poster-item">
              <Uploader
                v-model="formState[item.key]"
                :max-count="1"
                :after-read="(file) => afterRead(file, item.key)"
                :max-size="10 * 1024 * 1024"
                :preview-options="{
                  closeOnClickOverlay: true,
                  closeable: true
                }"
                :readonly="certDisabled"
                :deletable="!certDisabled"
                @oversize="onOversize"
              />
              <p>{{ t(item.title) }}</p>
              <img :src="item.img" alt="">
            </div>
          </div>
        </a-form>
      </div>
      <div v-else class="cert-content"></div>
    </a-spin>

    <template #footer>
      <a-button @click="handleCancel">{{ t('取消') }}</a-button>
      <a-button v-if="Object.keys(kycInfo).length && !certDisabled" :loading="subLoading" type="primary" @click="submitHandle">{{ t('提交') }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { Message } from '@arco-design/web-vue'
  import { Uploader, Image as VanImage } from 'vant'
  import { compressImage } from '@/utils'
  import { imageUpload } from '@/api/system'
  import { cloneDeep } from 'lodash-es'
  import { useSystemStore, useUserStore } from '@/store'
  import { kycApply, kycGetInfo } from '@/api/user'

  const { t } = useI18n()
  const appName = import.meta.env.VITE_APP
  const userStore = useUserStore()
  const systemStore = useSystemStore()

  const emits = defineEmits(['update:visible'])
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    }
  })

  const pageLoading = ref(false)
  const kycInfo = ref({})

  const countrySelectData = computed(() => {
    const data = cloneDeep(systemStore.countryList)
    return data || []
  })

  const kycStatusIcon = [
    new URL('@/assets/images/verify/waiting.png', import.meta.url),
    new URL('@/assets/images/verify/success.png', import.meta.url),
    new URL('@/assets/images/verify/fail.png', import.meta.url),
  ]

  const kycIconHref = computed(() => {
    const status = kycInfo.value.status
    const index = status ? status - 1 : status
    const href = kycStatusIcon[index] ? kycStatusIcon[index].href : ''
    return href
  })

  const certDisabled = computed(() => {
    return [1, 2].includes(kycInfo.value.status)
  })

  const getKyeInfo = () => {
    pageLoading.value = true
    kycGetInfo().then(res => {
      formState.value.nationality = res.nationality ? Number(res.nationality) : ''
      formState.value.realName = res.name || ''
      formState.value.idNumber = res.idnumber || ''

      formState.value.idimg_1 = res.idimg_1 ? [{url: res.idimg_1, status: 'success'}] : []
      formState.value.idimg_2 = res.idimg_2 ? [{url: res.idimg_2, status: 'success'}] : []
      formState.value.idimg_3 = res.idimg_3 ? [{url: res.idimg_3, status: 'success'}] : []

      kycInfo.value = res
    }).finally(() => {
      pageLoading.value = false
    })
  }

  // 认证图
  const kycImg1 = new URL('@/assets/images/verify/kyc1.png', import.meta.url)
  const kycImg2 = new URL('@/assets/images/verify/kyc2.png', import.meta.url)
  const kycImg3 = new URL('@/assets/images/verify/kyc3.png', import.meta.url)
  const kycImg1_e = new URL('@/assets/images/verify/kyc1_e.png', import.meta.url)
  const kycImg2_e = new URL('@/assets/images/verify/kyc2_e.png', import.meta.url)
  const kycImg3_e = new URL('@/assets/images/verify/kyc3_e.png', import.meta.url)

  // 使用自定义示例图
  const useEnTipsImg = computed(() => {
    return ['tiktok6'].includes(appName)
  })

  // 隐藏手持证件照
  const hideImg3 = computed(() => {
    return ['inchoi', 'hive', 'penguin', 'aliExpress-wholesale', 'kaifeng', 'tiktok-wholesale', 'tiktok7', 'tiktok8', 'tiktok10', 'whale'].includes(appName)
  })

  const certImgs = [
    {
      title: '证件正面',
      key: 'idimg_1',
      img: useEnTipsImg.value ? kycImg1_e.href : kycImg1.href
    },
    {
      title: '证件反面',
      key: 'idimg_2',
      img: useEnTipsImg.value ? kycImg2_e.href : kycImg2.href
    },
    {
      title: '手持证件照',
      key: 'idimg_3',
      img: useEnTipsImg.value ? kycImg3_e.href : kycImg3.href
    }
  ]

  const cetImgsItems = computed(() => {
    const data = cloneDeep(certImgs)
    if (hideImg3.value) {
      data.splice(2, 1)
    }
    return data
  })

  const formRef = ref(null)
  const formState = ref({
    nationality: '',
    realName: '',
    idNumber: '',
    idimg_1: [],
    idimg_2: [],
    idimg_3: []
  })

  const validateIdNumber = (value, cb) => {
    return new Promise((resolve) => {
      if (!value) {
        cb(t('请输入您的证件/护照号码'))
      }

      const reg = /^[0-9a-zA-Z]*$/;
      if (!reg.test(value)) {
        cb(t('证件号格式有误'))
      }

      resolve()
    })
  }

  const onOversize = () => {
    Message.error(t('图片大小不能超过{0}', ['10MB']))
  }

  const afterRead = async (file, moduleName) => {
    file.status = 'uploading'
    file.message = t('上传中...')

    try {
      if (file.file.size > 10 * 1024 * 1024) {
        Message.error(t('图片大小不能超过{0}', ['10MB']))
        file.status = 'failed'
        return
      }

      const compressedFile = await compressImage(file.file)

      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('moduleName', moduleName)
      imageUpload(formData).then(res => {
        file.status = 'success'
        file.message = t('上传成功')
        file.url = res.url
        file.url = res.url
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

  const handleCancel = () => {
    formState.value = {
      nationality: '',
      realName: '',
      idNumber: '',
      idimg_1: [],
      idimg_2: [],
      idimg_3: []
    }
    kycInfo.value = {}
    emits('update:visible', false)
  }
  
  const subLoading = ref(false)
  const submitHandle = async () => {
    const valid = await formRef.value.validate()
    if (!valid) {
      const data = cloneDeep(formState.value)
      if (!data.idimg_1.length) {
        Message.error(t('证件正面'))
        return false
      }
      if (!data.idimg_2.length) {
        Message.error(t('证件反面'))
        return false
      }

      if (!hideImg3.value && !data.idimg_3.length) {
        Message.error(t('手持证件照'))
        return false
      }

      const kycParams = {
        nationality: data.nationality,
        idname: "身份证",
        idnumber: data.idNumber,
        name: data.realName,
        idimg_1: data.idimg_1.length ? data.idimg_1[0].url : '',
        idimg_2: data.idimg_2.length ? data.idimg_2[0].url : '',
        idimg_3: data.idimg_3.length ? data.idimg_3[0].url : ''
      }

      subLoading.value = true

      kycApply(kycParams).then(async () => {
        await userStore.getUserInfo()
        Message.success(t('提交成功'))

        handleCancel()
      }).finally(() => {
        subLoading.value = false
      })

    }
  }

  watch(() => props.visible, (newVal) => {
    if (newVal) {
      systemStore.getCountryListHandle()
      getKyeInfo()
    }
  })
</script>

<style lang="less" scoped>
  .cert-content {
    padding: 20px;
    min-height: 400px;
    .imgs-item {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &.around {
        justify-content: space-around;
      }
    }
    .poster-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 28%;
      > p {
        width: 100%;
        font-size: 12px;
        text-align: center;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        margin-top: 5px;
      }
      > img {
        width: 80%;
        height: auto;
        margin-top: 10px;
      }
      :deep(.van-uploader) {
        .van-uploader__upload {
          width: 120px;
          height: 80px;
          margin: 0;
        }
        .van-uploader__preview-image {
          width: 120px;
          height: 80px;
        }
      }
    }
  }
</style>
