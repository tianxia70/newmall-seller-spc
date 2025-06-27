<template>
  <div class="login-info-content">
    <!-- 语言切换 -->
    <div class="language-content">
      <language-picker></language-picker>
    </div>
    
    <!-- 用户协议弹窗 -->
    <document-dialog v-model:visible="showDocument" @done="agreeStatus = true"></document-dialog>

    <div class="login-content">
      <div class="column-left">
        <h2>{{ siteConfig.title }}</h2>
        <p>{{ t('创建您的帐户') }}</p>
        <div v-if="!registerOnlyEmail && !bothType" class="type-content">
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
          <div v-if="currentType === 1 || bothType" class="input-item">
            <div class="content">
              <pc-mobile-input
                v-model:value="formData.phone"
                v-model:areaCode="formData.areaCode"
              ></pc-mobile-input>
            </div>
          </div>

          <div v-if="showVerifCode" class="input-item number-code">
            <div class="content">
              <div class="icon">
                <icon-safe :size="21" />
              </div>
              <a-input
                :placeholder="t('请输入')"
                :max-length="6"
                v-model="formData.verifCode"
              >
              </a-input>
              <div class="verif-code" @click="sendCodeHandle">
                <a-link :loading="sendLoading">
                  {{ t('发送验证码') }}
                  <template v-if="time">({{ time }})s</template>
                </a-link>
              </div>
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
              >
              </a-input-password>
            </div>
          </div>

          <div class="input-item">
            <div class="content">
              <div class="icon">
                <icon-lock :size="21" />
              </div>
              <a-input-password
                :placeholder="t('再次输入确认登录密码')"
                v-model="formData.rePassword"
              >
              </a-input-password>
            </div>
          </div>

          <div v-if="showUserCode" class="input-item">
            <div class="content">
              <div class="icon">
                <icon-subscribed :size="21" />
              </div>
              <a-input
                :placeholder="t('请填写邀请码')"
                v-model="formData.userCode"
              >
              </a-input>
            </div>
          </div>
          
          <div class="check-content">
            <div class="agree-content">
              <a-checkbox v-model="agreeStatus">{{ t('我已阅读并同意') }}</a-checkbox>
              <a-link @click="showDocument = true">《{{ t('用户协议') }}》</a-link>
            </div>
          </div>
          <div class="btn-content">
            <a-button type="primary" :loading="subLoading" @click="submitHandle">
              {{ t('注册') }}
            </a-button>
          </div>
        </div>
      </div>
      <div class="column-right" :style="{'background-image': 'url('+ loginContentBg +')'}">
        <h2>{{ $t('{0}欢迎您！', [siteConfig.title]) }}</h2>
        <p>{{ $t('已有账号?') }}</p>
        <a-link @click="navigationTo('/login')">{{ t('去登录') }}</a-link>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { loadSiteConfig, navigationTo, isTruthy } from '@/utils'
  import { setToken } from "@/utils/token-util.js";
  import tool from '@/utils/tool'
  import { useUserStore, useChatStore } from '@/store'
  import { phoneAreaCodeKey, phoneAreaCodeDefalut, loginTypeKey, loginEmailKey, loginMobileKey } from '@/configs'
  import DocumentDialog from '../../components/document-dialog.vue'
  import { Message } from '@arco-design/web-vue'
  import { sellerV2Register, sendCaptchCodeNoneLogin } from '@/api/user'
  import { sysConfigGetSyspara } from '@/api/system'
  import { useRoute } from 'vue-router'
  
  const { t } = useI18n()
  const appName = import.meta.env.VITE_APP
  const siteConfig = ref({})
  const loginContentBg = new URL('@/assets/images/login/login-bg.jpg', import.meta.url)

  const showEmailCode = ref(false)
  const showMobileCode = ref(false)

  const userStore = useUserStore()
  const chatStore = useChatStore()

  // 只允许邮箱注册
  const route = useRoute()

  const registerOnlyEmail = computed(() => {
    return ['aiMall'].includes(appName)
  })

  // 邮箱和手机号都必填
  const bothType = computed(() => {
    return ['family-wholesale-group'].includes(appName)
  })

  // 验证码
  const showVerifCode = computed(() => {
    if (currentType.value) {
      return showMobileCode.value
    } else {
      return showEmailCode.value
    }
  })

  // 邀请码
  const showUserCode = computed(() => {
    return !['family-wholesale-group', 'tiktok4', 'whale'].includes(appName)
  })

  // 邀请码选填
  const noRequriedUserCode = computed(() => {
    return ['tiktok4', 'tiktok8', 'tiktok11'].includes(appName)
  })

  const agreeStatus = ref(false)
  const showDocument = ref(false)

  const loginTypeData = ['邮箱', '手机号']
  const currentType = ref(0)
  const typeChange = (index) => {
    if (index !== currentType.value) {
      currentType.value = index
    }
  }

  const time = ref(0)
  const timer = ref(null)

  const subLoading = ref(false)
  const submitHandle = () => {
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
    }

    if (currentType.value === 1 || bothType.value) {
      if (formData.value.phone.trim() === '') {
        Message.error(t('请输入手机号'))
        return
      } else {
      if (!/^[0-9]+$/.test(formData.value.phone.trim())) {
          Message.error(t('请输入正确的手机号码'))
          return
        }
      }
    }

    if (currentType.value === 1 && !/^[0-9]+$/.test(formData.value.phone.trim())) {
      Message.error(t('请输入正确的手机号码'))
      return
    }

    if (showVerifCode.value && formData.value.verifCode === '') {
      Message.error(t('请输入验证码'))
      return
    }

    if (formData.value.password === '') {
      Message.error(t('请输入登录密码'))
      return
    }

    if (formData.value.password.length < 6 || formData.value.password.length > 20) {
      Message.error(t('登录密码必须6-20位'))
      return
    }

    const reg = /^[A-Za-z0-9!@#$%^&*_()<>.?\/\\{}[\]|,~+:;']+$/
    if (!reg.test(formData.value.password)) {
      Message.error(t('setPasswordTips'))
      return false
    }

    if (formData.value.rePassword === '') {
      Message.error(t('请确认密码'))
      return
    }

    if (formData.value.password !== formData.value.rePassword) {
      Message.error(t('两次输入的密码不相同'))
      return
    }

    if (showUserCode.value && !formData.value.userCode && !noRequriedUserCode.value) {
      Message.error(t('邀请码不能为空'))
      return false
    }

    if (!agreeStatus.value) {
      Message.error(t('请阅读并同意用户协议'))
      return
    }

    submitRequeset()
  }

  const submitSuccess = async (token) => {
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

    Message.success(t('registerSuccess'))

    subLoading.value = false
    navigationTo('/')
  }

  const formData = ref({
    areaCode: phoneAreaCodeDefalut,
    verifCode: '',
    phone: '',
    email: '',
    password: '',
    rePassword: '',
    userCode: ''
  })


  const submitRequeset = () => {
    const { email, phone, areaCode, verifCode, password, rePassword, userCode } = formData.value
    const params = {
      accountType: currentType.value === 0 ? 2 : 1,
      email: email.trim(),
      phone: phone ? `${areaCode} ${phone.trim()}` : '',
      verifCode,
      password,
      rePassword,
      userCode,
      checkMode: 2
    }

    if (showVerifCode.value) {
      params.checkMode = 3
    }

    if (!params.userCode) {
      params.userCode = '000000'
    }

    // 密码encodeURI一下
    params.password = encodeURI(params.password)
    params.rePassword = encodeURI(params.rePassword)

    subLoading.value = true

    sellerV2Register(params).then(async(res) => {
      await submitSuccess(res.token)
    }).catch(() => {
      subLoading.value = false
    })
  }

  const getCodeConfig = () => {
    sysConfigGetSyspara({
      code: 'send_code_turn_on,send_email_turn_on'
    }).then(res => {
      showEmailCode.value = isTruthy(res.send_email_turn_on)
      showMobileCode.value = isTruthy(res.send_code_turn_on)
    })
  }

  const sendLoading = ref(false)
  const sendCodeHandle = () => {
    if (time.value) { return false }

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
    }

    if (currentType.value === 1) {
      if (formData.value.phone.trim() === '') {
        Message.error(t('请输入手机号'))
        return
      } else {
      if (!/^[0-9]+$/.test(formData.value.phone.trim())) {
          Message.error(t('请输入正确的手机号码'))
          return
        }
      }
    }

    const params  = {
      target: currentType.value ? `${formData.value.areaCode} ${formData.value.phone.trim()}` : formData.value.email.trim()
    }

    sendLoading.value = true

    sendCaptchCodeNoneLogin(params).then(() => {
      Message.success(t('验证码发送成功'))
      time.value = 60;
      timer.value = setInterval(() => {
        if (time.value > 0) {
          time.value = time.value - 1
        } else {
          time.value = 0
          clearInterval(timer.value)
          timer.value = null
        }
      }, 1000);

      sendLoading.value = false
    }).catch(() => {
      sendLoading.value = false
    })
  }

  onMounted(async () => {
    getCodeConfig()

    siteConfig.value = await loadSiteConfig(appName)

    const setCode = parseInt(tool.local.get(phoneAreaCodeKey) || siteConfig.value.siteAreaCodeDefalut)
    if (!isNaN(setCode)) {
      formData.value.areaCode = setCode
    }

    // 获取路由参数
    const code = route.query.usercode
    if (code) {
      formData.value.userCode = code
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
        // width: 590px;
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
              background-color: rgb(var(--primary-6));;
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
              .verif-code {
                padding: 0 15px;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                cursor: pointer;
                right: 0;
                top: 0;
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
