<template>
  <div>
    <div v-if="currentStep !== 4 " class="ma-content-block p-4 mb-3">
      <div class="step-content">
        <a-steps label-placement="vertical" :current="currentStep">
          <a-step>{{ t('店铺设置') }}</a-step>
          <a-step>{{ t('店铺认证') }}</a-step>
          <a-step>{{ t('上架商品') }}</a-step>
        </a-steps>
      </div>
      <div class="step-info">{{ t('请您完善店铺信息以保证顾客能正常访问到您') }}</div>

      <a-button v-if="currentStep === 1" type="primary">{{ t('立即设置') }}</a-button>
      <a-button v-if="currentStep === 2" type="primary">{{ t('查看认证') }}</a-button>
      <a-button v-if="currentStep === 3" type="primary">{{ t('上架商品') }}</a-button>
    </div>

    <a-modal
      v-model:visible="dialogVisible"
      :width="560"
      :mask-closable="false"
      :esc-to-close="false"
      :closable="false"
    >
      <template #title>{{ t('信息设置') }}</template>
      <div class="form-content">
        <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
          <div class="block-title">{{ t('基础信息') }}</div>
          <a-form-item field="avatar" :label="t('店铺LOGO')" >
            <Uploader
              v-model="formState.avatar"
              :after-read="(file) => afterRead(file, 'avatar')"
              :max-count="1"
              :readonly="false"
              :max-size="10 * 1024 * 1024"
              @oversize="onOversize"
            />
          </a-form-item>
          <a-form-item field="shopName" :label="t('店铺名称')" >
            <a-input :placeholder="t('请输入店铺名称')" v-model="formState.shopName" allow-clear></a-input>
          </a-form-item>

          <div class="block-title mt-4">{{ t('个人信息') }}</div>
          <a-form-item field="nationality" :label="t('国籍')" >
            <a-select
              v-model="formState.nationality"
              :placeholder="t('请选择国籍')"
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
          <a-form-item field="realName" :label="t('真实姓名')" >
            <a-input :placeholder="t('请输入真实姓名')" v-model="formState.realName" allow-clear></a-input>
          </a-form-item>
          <a-form-item field="idnumber" :label="`${t('证件')}/${t('护照号码')}`" >
            <a-input :placeholder="t('请输入您的证件/护照号码')" v-model="formState.idnumber" allow-clear></a-input>
          </a-form-item>
          <div class="imgs-item" :class="{'around': hideImg3}">
            <div v-for="(item, index) in cetImgsItems" :key="index" class="poster-item">
              <Uploader
                v-model="formState[item.key]"
                :max-count="1"
                :after-read="(file) => afterRead(file, item.key)"
                :max-size="10 * 1024 * 1024"
                @oversize="onOversize"
              />
              <p>{{ t(item.title) }}</p>
              <img :src="item.img" alt="">
            </div>
          </div>

          <div v-if="showOtherInfo" class="block-title mt-6">{{ t('其他信息') }}</div>
          <a-form-item v-if="showIncome" field="annualIncome" :label="t('年收入')" >
            <a-input-number :placeholder="$t('请输入')" v-model="formState.annualIncome" allow-clear />
          </a-form-item>
          <a-form-item v-if="showOpenAmount" field="openAmount" :label="t('预计开店金额')">
            <a-select
              v-if="choiceAmount"
              v-model="formState.openAmount"
              :placeholder="t('请选择')"
              allow-search
            >
              <a-option
                v-for="item in amountArr"
                :key="item"
                :label="item"
                :value="item"
              />
            </a-select>
            <a-input-number v-else :placeholder="$t('请输入')" v-model="formState.openAmount" allow-clear />
          </a-form-item>
          <a-form-item v-if="showWhatsapp" field="whatsApp" label="WhatsApp" >
            <a-input :placeholder="$t('请输入')" v-model="formState.whatsApp" allow-clear />
          </a-form-item>
        </a-form>
      </div>

      <template #footer>
        <a-button type="primary" :loading="subLoading" @click="submitHandle">{{ t('提交') }}</a-button>
      </template>
    </a-modal>
  </div>
  
</template>

<script setup>
  import { ref, reactive, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useUserStore, useSystemStore } from '@/store'
  import { Uploader } from 'vant'
  import { Message } from '@arco-design/web-vue'
  import { compressImage } from '@/utils'
  import { imageUpload } from '@/api/system'
  import { sellerUpdate } from '@/api/seller'
  import { kycApply } from '@/api/user'
  import { cloneDeep } from 'lodash'

  const { t } = useI18n()
  const appName = import.meta.env.VITE_APP

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

  const amountArr = ['5000', '10000', '15000', '20000']

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

  const userStore = useUserStore()
  const systemStore = useSystemStore()
  const sellerInfo = computed(() => userStore.sellerInfo)

  const countrySelectData = computed(() => {
    const data = cloneDeep(systemStore.countryList)
    return data || []
  })

  // 年收入显示与否
  const showIncome = computed(() => {
    return ['argos', 'family-wholesale-group'].includes(appName)
  })

  // 开店金额显示与否
  const showOpenAmount = computed(() => {
    return ['argos', 'family-wholesale-group'].includes(appName)
  })

  // 开店金额选择
  const choiceAmount = computed(() => {
    return ['argos', 'family-wholesale-group'].includes(appName)
  })

  // whatsapp
  const showWhatsapp = computed(() => {
    return ['argos', 'family-wholesale-group'].includes(appName)
  })

  // 其他信息是否显示
  const showOtherInfo = computed(() => {
    return showIncome.value || showOpenAmount.value || showWhatsapp.value
  })


  const currentStep = computed(() => {
    const sellerGoodsNum = sellerInfo.value.sellerGoodsNum ? Number(sellerInfo.value.sellerGoodsNum) : 0
    const sellerSettingFlag = Number(sellerInfo.value.sellerSettingFlag)
    const sellerKycFlag = Number(sellerInfo.value.sellerKycFlag)

    const needSet = ['argos', 'oufan', 'tiktok6', 'tiktok7',  'tiktok10', 'family-wholesale-group'].includes(appName)

    if (needSet && !sellerKycFlag && !sellerSettingFlag) {
      systemStore.getCountryListHandle()
      dialogVisible.value = true
    }

    let step = 4
    if (!sellerGoodsNum) {
      step = 3
    }

    if (!sellerKycFlag) {
      step = 2
    }

    if (!sellerSettingFlag) {
      step = 1
    }

    return step
  })

  const formRef = ref()
  const formState = ref({
    avatar: [],
    shopName: '',
    nationality: '',
    realName: '',
    idnumber: '',
    idimg_1: [],
    idimg_2: [],
    idimg_3: [],
    annualIncome: undefined,
    openAmount: undefined,
    whatsApp: ''
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

  const validateNumber = (value, cb, title, requiredTxt) => {
    return new Promise((resolve) => {
      if (!value) {
        cb(t(requiredTxt))
      }

      if (isNaN(Number(value)) || Number(value) < 0) {
        cb(t('{0}格式错误', [t(title)]))
      }

      resolve()
    })
  }

  const formRules = reactive({
    avatar: [{ required: true, message: t('请上传店铺LOGO'), trigger: 'change'}],
    shopName: [{ required: true, message: t('请输入店铺名称'), trigger: 'blur'}],
    nationality: [{ required: true, message: t('请选择国籍'), trigger: 'change'}],
    realName: [{ required: true, message: t('请输入真实姓名'), trigger: 'blur'}],
    idnumber: [{ required: true, validator: validateIdNumber, trigger: 'blur'}],
    annualIncome: [{ required: true,
      validator: (value, cb) => validateNumber(value, cb, '年收入', '请输入'),
      trigger: 'blur'
    }],
    openAmount: [{ required: true,
      validator: (value, cb) => validateNumber(value, cb, '预计开店金额', choiceAmount.value ? '请选择' : '请输入'),
      trigger: choiceAmount.value ? 'change' : 'blur'
    }],
    whatsApp: [{ required: true, message: t('请输入'), trigger: 'blur'}]
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
        file.resURL = res.url

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

  const dialogVisible = ref(false)
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

      subLoading.value = true

      const sellerParams = {
        avatar: data.avatar.length ? data.avatar[0].resURL : '',
        name: data.shopName
      }

      await sellerUpdate(sellerParams)

      const kycParams = {
        nationality: data.nationality,
        idname: "身份证",
        idnumber: data.idnumber,
        name: data.realName,
        idimg_1: data.idimg_1.length ? data.idimg_1[0].resURL : '',
        idimg_2: data.idimg_2.length ? data.idimg_2[0].resURL : '',
        idimg_3: data.idimg_3.length ? data.idimg_3[0].resURL : '',
        annualIncome: data.annualIncome || '',
        openAmount: data.openAmount || '',
        whatsApp: data.whatsApp || ''
      }

      await kycApply(kycParams)

      await userStore.getAllInfo()

      Message.success(t('提交成功'))

      subLoading.value = false
      dialogVisible.value = false
    }
  }
</script>

<style lang="less" scoped>
  .ma-content-block {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding-top: 20px;
    padding-bottom: 20px;
    .step-content {
      width: 100%;
      max-width: 700px;
    }
    .step-info {
      margin-top: 20px;
      margin-bottom: 30px;
      text-align: center;
    }
  }

  .block-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    position: relative;
    padding-left: 10px;
    &::after {
      content: '';
      display: block;
      width: 4px;
      height: 90%;
      border-radius: 4px;
      background-color: rgb(var(--primary-6));
      position: absolute;
      left: 0;
      top: 5%;
    }
  }

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
    }
    > img {
      width: 80%;
      height: auto;
      margin-top: 10px;
    }
  }
</style>
