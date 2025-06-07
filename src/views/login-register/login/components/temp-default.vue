<template>
  <a-spin :loading="freeLoading" :tip="t('登录中...')">
    <div class="login-info-content" :style="{'background-image': 'url('+ loginContentBg +')'}">
      <!-- 语言切换 -->
      <div class="language-content">
        <language-picker :dark="true"></language-picker>
      </div>
      
      <!-- 用户协议弹窗 -->
      <document-dialog v-model:visible="showDocument" @done="agreeStatus = true"></document-dialog>

      <!-- 图片验证 -->
      <Vcode
        :successText="t('验证成功')"
        :failText="t('验证失败，请重试')"
        :sliderText="t('拖动滑块完成拼图')"
        :imgs="verImgData"
        :show="imgVerVisible"
        @success="loginRequeset"
      />

      <div class="login-content">
        <h2>{{ siteConfig.title }}</h2>
        <h2>{{ t('登录您的帐户') }}</h2>
        <div class="type-content">
          <div v-for="(item, index) in loginTypeData" :key="item"
            class="item"
            :class="{'active': index === currentType}"
            @click="typeChange(index)"
          >{{ t(item) }}</div>
        </div>

        <div class="form-content">
          <div v-if="currentType === 0" class="input-item">
            <p>{{ t('邮箱') }}</p>
            <div class="content">
              <div class="icon">
                <icon-email :size="21" />
              </div>
              <a-input
                :placeholder="t('请输入邮箱')"
                v-model="formData.email"
                allow-clear>
              </a-input>
            </div>
          </div>
          <div v-else class="input-item">
            <p>{{ t('手机号') }}</p>
            <div class="content">
              <pc-mobile-input
                v-model:value="formData.phone"
                v-model:areaCode="formData.areaCode"
              ></pc-mobile-input>
            </div>
          </div>
          <div class="input-item">
            <p>{{ t('登录密码') }}</p>
            <div class="content">
              <div class="icon">
                <icon-lock :size="21" />
              </div>
              <a-input-password
                :placeholder="t('请输入登录密码')"
                v-model="formData.password"
                allow-clear
                @keyup.enter="loginHandle"
              >
              </a-input-password>
            </div>
          </div>
          <div v-if="showNumberCode" class="input-item number-code">
            <p>{{ t('验证码') }}</p>
            <div class="content">
              <div class="icon">
                <icon-safe :size="21" />
              </div>
              <a-input
                :placeholder="t('请输入验证码')"
                v-model="formData.code"
                allow-clear
                @keyup.enter="loginHandle"
              >
              </a-input>
              <pc-number-code @done="numberCodeDone"></pc-number-code>
            </div>
          </div>
          <div class="check-content">
            <div v-if="showAgree" class="agree-content">
              <a-checkbox v-model="agreeStatus">{{ t('我已阅读并同意') }}</a-checkbox>
              <a-link @click="showDocument = true">《{{ t('用户协议') }}》</a-link>
            </div>
            <p v-else></p>
            <a-link :disabled="disabledForgetPassword" @click="forgetPasswordHandle">{{ t('忘记密码') }}?</a-link>
          </div>
          <div class="btn-content">
            <a-button type="primary" :loading="subLoading" @click="loginHandle">
              {{ t('登录') }}
            </a-button>
          </div>
          <div class="footer-tips">
            <span>{{ t('如果您没有账号，') }}</span>
            <a-link @click="navigationTo('/register')">{{ t('点击注册') }}</a-link>
          </div>
        </div>
      </div>
    </div>
  </a-spin>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import Vcode from 'vue3-puzzle-vcode'
  import { loadSiteConfig, navigationTo } from '@/utils'
  import { setToken } from "@/utils/token-util.js";
  import tool from '@/utils/tool'
  import { useSystemStore, useUserStore, useChatStore } from '@/store'
  import { phoneAreaCodeKey, phoneAreaCodeDefalut, loginTypeKey, loginEmailKey, loginMobileKey } from '@/configs'
  import DocumentDialog from '../../components/document-dialog.vue'
  import { Message } from '@arco-design/web-vue'
  import { userLogin, userLoginSeller } from '@/api/user'

  const { t } = useI18n()
  const route = useRoute()
  const appName = import.meta.env.VITE_APP
  const siteConfig = ref({})
  const loginContentBg = new URL('@/assets/images/login/login-bg.jpg', import.meta.url)

  const systemStore = useSystemStore()
  const userStore = useUserStore()
  const chatStore = useChatStore()

  const identifyCode = ref('')
  const numberCodeDone = (data) => {
    identifyCode.value = data
  }

  const showNumberCode = computed(() => {
    return ['aliExpress-wholesale'].includes(appName)
  })

  const showAgree = computed(() => {
    return ['familyMart'].includes(appName)
  })

  const jumpImgVer = computed(() => {
    return ['hive', 'flipkart',
    'argos5', 'globease', 'shinsegae', 'tiktok-wholesale',
    'aiMall', 'masla', 'ottoGroup', 'oceanPick'].includes(appName) || showNumberCode.value
  })

  const disabledForgetPassword = computed(() => {
    if (systemStore.customer_service_url) {
      return false
    } else {
      return !chatStore.imDone
    }
  })

  const agreeStatus = ref(false)
  const showDocument = ref(false)
  const imgVerVisible = ref(false)
  const verImg1 = new URL('@/assets/images/verify/01.png', import.meta.url)
  const verImg2 = new URL('@/assets/images/verify/02.png', import.meta.url)
  const verImg3 = new URL('@/assets/images/verify/03.png', import.meta.url)
  const verImg4 = new URL('@/assets/images/verify/04.png', import.meta.url)
  const verImg5 = new URL('@/assets/images/verify/05.png', import.meta.url)
  const verImgData = [verImg1.href, verImg2.href, verImg3.href, verImg4.href, verImg5.href]

  const loginTypeData = ['邮箱', '手机号']
  const currentType = ref(0)
  const typeChange = (index) => {
    if (index !== currentType.value) {
      currentType.value = index
    }
  }

  const formData = ref({
    areaCode: phoneAreaCodeDefalut,
    phone: '',
    email: '',
    password: '',
    code: ''
  })

  const subLoading = ref(false)
  const loginHandle = () => {
    if (currentType.value === 0) {
      if (formData.value.email.trim() === '') {
        Message.error(t('请输入邮箱'))
        return
      } else {
        const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailReg.test(formData.value.email.trim())) {
          Message.error(t('请输入正确的邮箱地址'))
          return
        }
      }
    } else {
      if (formData.value.phone.trim() === '') {
        Message.error(t('请输入手机号'))
        return
      }

      if (!/^[0-9]+$/.test(formData.value.phone.trim())) {
        Message.error(t('请输入正确的手机号码'))
        return
      }
    }

    if (formData.value.password === '') {
      Message.error(t('请输入登录密码'))
      return
    }

    if (formData.value.password.length < 6 || formData.value.password.length > 20) {
      Message.error(t('登录密码必须6-20位'))
      return
    }

    if (showNumberCode.value) {
      if (formData.value.code !== identifyCode.value) {
        Message.error(t('请输入正确的验证码'))
        return
      }
    }

    if (showAgree.value && !agreeStatus.value) {
      Message.error(t('请阅读并同意用户协议'))
      return
    }

    if (jumpImgVer.value) {
      loginRequeset()
    } else {
      imgVerVisible.value = true
    }
  }

  const loginSuccess = async (token) => {
    setToken(token)
    await userStore.getAllInfo()

    await userStore.getSaleGoodsNum()

    // 保存用户信息
    const storeName = currentType.value == 0 ? loginEmailKey : loginMobileKey
    const storeValue = currentType.value == 0 ? formData.value.email : formData.value.phone
    if (currentType.value) {
      tool.local.set(phoneAreaCodeKey, formData.value.areaCode)
    }
    tool.local.set(storeName, storeValue)
    tool.local.set(loginTypeKey, currentType.value)

    chatStore.setChatHandle()

    subLoading.value = false

    const redirect = route.query.redirect
    if (redirect) {
      navigationTo(redirect)
    } else {
      navigationTo('/')
    }
  }

  const loginRequeset = () => {
    imgVerVisible.value = false
    subLoading.value = true

    let params = {
      password: formData.value.password
    }
    if (Number(currentType.value) === 0) {
      params.email = formData.value.email
      params.loginType = 2
    } else {
      params.phone = `${formData.value.areaCode} ${formData.value.phone}`
      params.loginType = 1
    }

    userLogin(params).then(async(res) => {
      await loginSuccess(res.token)
    }).catch(() => {
      subLoading.value = false
    })
  }

  const freeLoading = ref(false)
  const loginFreeHandle = (token) => {
    freeLoading.value = true
    userLoginSeller({
      freeToken: token
    }).then(async (res) => {
      await loginSuccess(res.token)
      freeLoading.value = false
    }).catch(() => {
      freeLoading.value = false
    })
  }

  const forgetPasswordHandle = () => {
    if (systemStore.customer_service_url) {
      window.open(systemStore.customer_service_url)
    } else {
      im_create_iframe_client && im_create_iframe_client.open();
    }
  }

  onMounted(async () => {
    if (route.query.token) {
      loginFreeHandle(route.query.token)
      return
    }

    siteConfig.value = await loadSiteConfig(appName)
    // 回显登录信息
    if (tool.local.get(loginTypeKey)) {
      currentType.value = Number(tool.local.get(loginTypeKey))
    }
    formData.value.email = tool.local.get(loginEmailKey) || ''
    formData.value.phone = tool.local.get(loginMobileKey) || ''

    const setCode = parseInt(tool.local.get(phoneAreaCodeKey) || siteConfig.value.siteAreaCodeDefalut)
    if (!isNaN(setCode)) {
      formData.value.areaCode = setCode
    }
  })
</script>

<style lang="less" scoped>
  .login-info-content {
    width: 100vw;
    min-width: 1000px;
    height: 100vh;
    background-position: top center;
    background-repeat: no-repeat;
    background-size: cover;
    overflow: hidden;
    position: relative;
    &::after {
      content: "";
      display: block;
      width: 400vw;
      height: 400vw;
      border-radius: 50%;
      background-color: #fff;
      opacity: 0.95;
      position: absolute;
      top: 70vh;
      left: 50%;
      margin-left: -200vw;
      z-index: 2;
    }
    .language-content {
      width: 110px;
      position: absolute;
      top: 20px;
      right: 20px;
    }
    > .login-content {
      width: 500px;
      background-color: var(--color-menu-light-bg);
      border-radius: 16px;
      box-shadow: 0 0 50px rgba(0, 0, 0, .2);
      position: absolute;
      z-index: 3;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 30px;
      > h2 {
        font-size: 30px;
        margin: 0;
        font-weight: bold;
        color: var(--color-text-2);
        &:first-child {
          font-size: 24px;
          margin-bottom: 15px;
          color: var(--color-text-1);
        }
      }
      > .type-content {
        display: flex;
        align-items: center;
        gap: 50px;
        margin-top: 50px;
        > .item {
          font-size: 21px;
          font-weight: bold;
          padding-bottom: 14px;
          cursor: pointer;
          user-select: none;
          transition: all 0.3s ease;
          position: relative;
          color: var(--color-text-1);
          &::after {
            content: "";
            display: block;
            width: 0;
            height: 4px;
            background-color: rgb(var(--primary-6));
            position: absolute;
            left: 0;
            bottom: 0;
            transition: all 0.3s ease;
          }
          &.active {
            color: rgb(var(--primary-6));
            &::after {
              width: 100%;
            }
          }
        }
      }
      > .form-content {
        margin-top: 40px;
        > .input-item {
          margin-top: 30px;
          &:first-child {
            margin-top: 0;
          }
          > p {
            font-size: 14px;
            color: var(--color-text-3);
            margin-bottom: 10px;
          }
          > .content {
            position: relative;
            color: var(--color-text-1);
            > .icon {
              width: 55px;
              height: 26px;
              position: absolute;
              top: 50%;
              margin-top: -13px;
              left: 0;
              z-index: 2;
              display: flex;
              align-items: center;
              justify-content: center;
              border-right: 1px solid #999;
            }
            .arco-input-wrapper {
              height: 44px;
              line-height: 44px;
              padding-left: 65px;
              color: #000;
              font-size: 15px;
              border-radius: 0;
            }
            :deep(.pc-mobile-input) {
              .area-code-btn {
                height: 44px;
                width: 55px;
                padding: 0 !important;
              }
              .arco-input-wrapper {
                height: 44px;
                line-height: 44px;
                font-size: 15px;
                border-radius: 0;
                padding-left: 10px;
              }
            }
            :deep(.arco-input) {
              color: var(--color-text-1);
            }
          }
          &.number-code {
            position: relative;
            .arco-input-wrapper { 
              padding-right: 110px;
            }
            .pc-number-code {
              position: absolute;
              right: 1px;
              top: 1px;
            }
          }
        }
        .check-content {
          width: 100%;
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          gap: 20px;
          > .agree-content {
            display: flex;
            flex: 1;
            flex-wrap: wrap;
          }
        }
        .btn-content {
          margin-top: 40px;
          .arco-btn {
            display: block;
            width: 100%;
            height: 50px;
            font-weight: bold;
            font-size: 16px;
          }
        }
        .footer-tips {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 20px;
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
</style>
