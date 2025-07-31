<template>
  <a-spin :loading="freeLoading" :tip="t('登录中...')">
    <div class="login-info-content">
      <!-- 语言切换 -->
      <div class="language-content">
        <language-picker></language-picker>
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
        <div class="column-left">
          <h2>{{ siteConfig.title }}</h2>
          <p>{{ t('登录您的帐户') }}</p>
          <div class="type-content">
            <div v-for="(item, index) in loginTypeData" :key="item"
              class="item"
              :class="{'active': index === currentType}"
              @click="typeChange(index)"
            >{{ t(item) }}</div>
          </div>

          <div class="form-content">
            <div v-if="currentType === 0" class="input-item">
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
              <div class="content">
                <pc-mobile-input
                  v-model:value="formData.phone"
                  v-model:areaCode="formData.areaCode"
                ></pc-mobile-input>
              </div>
            </div>
            <div class="input-item">
              <div class="content">
                <div class="icon">
                  <icon-lock :size="21" />
                </div>
                <a-input-password
                  :placeholder="t('请输入登录密码')"
                  v-model="formData.password"
                  @keyup.enter="loginHandle"
                >
                </a-input-password>
              </div>
            </div>
            <div v-if="showNumberCode" class="input-item number-code">
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
                <pc-number-code :content-height="48" @done="numberCodeDone"></pc-number-code>
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
          </div>
        </div>
        <div class="column-right" :style="{'background-image': 'url('+ loginContentBg +')'}">
          <h2>{{ $t('{0}欢迎您！', [siteConfig.title]) }}</h2>
          <p>{{ $t('如果你没有账号，你想要现在注册一个吗？') }}</p>
          <a-link @click="navigationTo('/register')">{{ t('点击注册') }}</a-link>
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
    'aiMall', 'masla', 'ottoGroup', 'oceanPick', 'flipkart3'].includes(appName) || showNumberCode.value
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
    setTimeout(() => {
      userLoginSeller({
        freeToken: token
      }).then(async (res) => {
        await loginSuccess(res.token)
        freeLoading.value = false
      }).catch(() => {
        freeLoading.value = false
      })
    }, 5000)
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
    display: flex;
    align-items: center;
    justify-content: center;
    &::after {
      content: "";
      position: fixed;
      inset: 0;
      background-color: #010101;
      width: 60%;
      height: 100vh;
      clip-path: polygon(0 100%, 0 0, 100% 0, 70% 100%);
      z-index: -1;
    }
    :deep(.arco-input) {
      &::placeholder {
        color: #999;
      }
    }
    .language-content {
      width: 110px;
      position: absolute;
      top: 20px;
      right: 20px;
      :deep(.lang-item) {
        &.current {
          color: #282828 !important;
        }
        
      }
    }
    > .login-content {
      background-color: white;
      border: 1px solid #ddd;
      box-shadow: 0 10px 50px -30px black;
      width: 1200px;
      border-radius: 30px;
      overflow: hidden;
      display: grid;
      grid-template-columns: auto auto;
      .column-left {
        padding: 30px 40px;
        padding-bottom: 60px;
        > h2 {
          font-size: 32px;
          margin: 0;
          font-weight: bold;
          color: #282828;
          margin-bottom: 15px;
        }
        > p {
          font-size: 16px;
        }
        > .type-content {
          display: flex;
          align-items: center;
          gap: 50px;
          margin-top: 40px;
          > .item {
            font-size: 21px;
            font-weight: bold;
            padding-bottom: 14px;
            cursor: pointer;
            user-select: none;
            transition: all 0.3s ease;
            position: relative;
            color: #282828;
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
              color: #666666;
              margin-bottom: 10px;
            }
            > .content {
              position: relative;
              color: #282828;
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
                height: 50px;
                line-height: 50px;
                padding-left: 65px;
                color: #000;
                font-size: 15px;
                border-radius: 50px;
                border: 2px solid #666;
                background-color: transparent !important;
                :deep(.arco-input-suffix),
                :deep(.arco-input-clear-btn) {
                  color: #282828 !important;
                }
              }
              .arco-input-focus {
                background-color: transparent !important;
                border-color: #000000;
              }
              :deep(.pc-mobile-input) {
                .area-code-btn {
                  height: 50px;
                  width: 55px;
                  padding: 0 !important;
                  border: 2px solid #666;
                  border-top-left-radius: 50px;
                  border-bottom-left-radius: 50px;
                  color: #282828;
                  background-color: transparent !important;
                }
                .arco-input-wrapper {
                  height: 50px;
                  line-height: 50px;
                  font-size: 15px;
                  border-radius: 0;
                  padding-left: 10px;
                  border-top-right-radius: 50px;
                  border-bottom-right-radius: 50px;
                  border: 2px solid #666;
                  border-left: none;
                  background-color: transparent !important;
                  .arco-input-suffix,
                  .arco-input-clear-btn {
                    color: #282828 !important;
                  }
                }
                .arco-input-focus {
                  background-color: transparent !important;
                  border-color: #000000;
                }
              }
              :deep(.arco-input) {
                color: #282828;
              }
            }
            &.number-code {
              position: relative;
              .arco-input-wrapper { 
                padding-right: 110px;
              }
              .pc-number-code {
                position: absolute;
                right: 20px;
                top: 1px;
              }
            }
          }
          .check-content {
            width: 100%;
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            gap: 20px;
            :deep(.arco-checkbox-icon) {
              background-color: #fff;
              border: 2px solid rgba(229, 230, 235);
              border-radius: 2px;
            }
            :deep(.arco-checkbox-checked) {
              .arco-checkbox-icon {
                background-color: rgb(var(--primary-6));
                border: none !important;
              }
            }
            > .agree-content {
              display: flex;
              flex: 1;
              flex-wrap: wrap;
              :deep(.arco-checkbox-label) {
                color: #666 !important;
              }
            }
          }
          .btn-content {
            margin-top: 20px;
            .arco-btn {
              display: block;
              width: 100%;
              height: 50px;
              border-radius: 50px;
              font-weight: bold;
              font-size: 16px;
              background-color: #000000;
              &:hover {
                background-color: rgba(0, 0, 0, .8);
              }
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
      .column-right {
        background-size: cover;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 40px;
        text-align: center;
        padding: 30px 40px;
        padding-bottom: 60px;
        &::after {
          content: "";
          position: absolute;
          background: linear-gradient(90deg, white, rgba(255, 255, 255, 0.1333333333));
          inset: 0;
        }
        * {
          position: relative;
          z-index: 1;
        }
        > h2 {
          font-size: 26px;
          font-weight: bold;
          color: #282828;
        }
        p {
          color: #282828;
          font-size: 16px;
        }
        .arco-link {
          display: inline-block;
          padding: 12px 30px;
          font-size: 16px;
          border: 2px solid #010101;
          color: black;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3;
          font-weight: 600;
          margin-top: 20px;
          &:hover {
            background-color: #010101;
            color: white;
          }
        }
      }
    }
  }
</style>
