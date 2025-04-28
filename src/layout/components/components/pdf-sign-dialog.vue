<template>
  <div class="paf-content">
    <a-modal
      v-model:visible="signVisible"
      :width="700"
      :mask-closable="false"
      :esc-to-close="false"
      :closable="false"
    >
      <template #title>{{ t('签名') }}</template>

      <vue3-signature
        v-if="signReady"
        ref="signatureRef"
        h="200px"
        :sigOption="sigOption"
      />

      <template #footer>
        <a-button @click="signVisible = false">{{ t('返回上一步') }}</a-button>
        <a-button type="primary" @click="signReset">{{ t('重置') }}</a-button>
        <a-button type="primary" status="success" @click="signDone">{{ t('确认') }}</a-button>
      </template>
    </a-modal>

    <a-modal
      :visible="visible"
      :width="700"
      :mask-closable="false"
      :esc-to-close="false"
      :closable="false"
    >
      <template #title>{{ t('用户协议') }}</template>
      <a-scrollbar style="height: 600px; overflow: auto;">
        <div class="info-content" :class="{'dark': isDarkMode}" id="infoContent">
          <h2>{{ t('经营合同') }}</h2>
          <p>{{ t('双方经友好协商，对于商城合作一事达成如下协议：') }}</p>
          <p>{{ t('合作期间：') }}</p>
          <p> {{ t('一、甲方责任') }}</p>
          <p>{{ t('1.甲方需提供足够的供应商以及商品，用于合作。') }}</p>
          <p>{{ t('2.甲方需提供安全及运输工作，以其一切工商税务和运输费用等。') }}</p>
          <p>{{ t('其包括：打包、安装、售后、运输、公共关系，等一切费用。') }}</p>
          <p>{{ t('3.甲方需保证物流运输的正常运行，并负责商品和工作人员的安全。') }}</p>
          <p>{{ t('如出现人为破坏，被盗，物品损坏，均由甲方全面负责，照价赔偿。') }}</p>
          <p>{{ t('二、乙方责任') }}</p>
          <p> {{ t('1.乙方需提供商品成本、维护商城买家（客户关系）。') }}</p>
          <p>{{ t('2.乙方保证良好的个人信用。') }}</p>
          <p>{{ t("3.乙方需{0}天内及时处理订单。", [handleDays]) }}</p>

          <p>{{ t('三、违约条款') }}</p>
          <p>{{ t('1.如有特殊情况，经双方协商协议解决。') }}</p>
          <p>{{ t('2.如受政策影响，特殊情况和经营状态不好。乙方全权负责。') }}</p>
          <p>{{ t('3.双方必须严格遵守合同规定，如单方违约，任何一方需负法律责任或者赔偿。') }}</p>
          <p>{{ t('4.即签字之日起效。') }}</p>
          <div class="time-content">
            <div class="left">
              <div class="item">{{ t('甲方：') }}{{ siteConfig?.title }}</div>
              <div class="item">{{ t('日期：') }}{{ nowTime }}</div>
              <img :src="signbBadge">
            </div>
            <div>
              <div class="item">
                {{ t('乙方') }}：
                <div class="name-info">
                  <img v-if="signImg" :src="signImg">
                </div>
              </div>
              <div class="item">{{ t('日期：') }}{{ nowTime }}</div>
            </div>
          </div>
        </div>
      </a-scrollbar>

      <template #footer>
        <a-button type="primary" status="success" @click="signVisible = true">{{ t('同意并签名') }}</a-button>
        <a-button :loading="subLoading" type="primary" @click="signSubmit">{{ t('提交') }}</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch, nextTick } from 'vue'
  import { useI18n } from 'vue-i18n'
  import dayjs from 'dayjs'
  import Vue3Signature from 'vue3-signature'
  import html2canvas from 'html2canvas'
  import jsPdf from 'jspdf'
  import { Message } from '@arco-design/web-vue'
  import { loadSiteConfig } from '@/utils'
  import { getToken } from "@/utils/token-util.js";
  import { imageUpload, sellerUpdateSignPdf } from '@/api/system'
  import { useUserStore } from '@/store'

  const emits = defineEmits(['done']);
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    }
  })

  const userStore = useUserStore()

  const appName = import.meta.env.VITE_APP
  const siteConfig = ref({})

  const isDarkMode = computed(() => siteConfig.value.themeMode && siteConfig.value.themeMode === 'dark')

  const { t } = useI18n()

  const nowTime = computed(() => dayjs().format('YYYY-MM-DD'))

  const handleDays = computed(() => {
    let day = 24
    if (['family-wholesale-group'].includes(appName)) {
      day = 3
    }

    if (['oufan', 'tiktok6', 'whale'].includes(appName)) {
      day = 48
    }

    return day
  })

  const signbBadge = computed(() => {
    let badge = new URL('@/assets/images/notice/seal.png', import.meta.url)
    if (['tiktok7'].includes(appName)) {
      badge = new URL('@/assets/images/notice/seal1.png', import.meta.url)
    }

    return badge.href
  })

  const convertBase64ToFile = (urlData, filename) => {
    const arr = urlData.split("base64,")
    const type = arr[0].match(/:(.*?);/)[1]
    const fileExt = type.split("/")[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename + "." + fileExt, {
      type: type
    })
  }

  const signImg = ref('')
  const subLoading = ref(false)

  const signSubmit = () => {
    if (signImg.value) {
      subLoading.value = true
      const element = document.getElementById('infoContent')

      html2canvas(element).then(canvas => {
        const contentWidth = canvas.width
        const contentHeight = canvas.height
        // 一页pdf显示html页面生成的canvas高度;
        const pageHeight = contentWidth / 592.28 * 841.89
        // 未生成pdf的html页面高度
        let leftHeight = contentHeight
        // 页面偏移
        let position = 0
        // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
        const imgWidth = 595.28
        const imgHeight = 592.28 / contentWidth * contentHeight
        const pageData = canvas.toDataURL('image/jpeg', 1.0)
        const pdf = new jsPdf('', 'pt', 'a4')
        // 有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
        // 当内容未超过pdf一页显示的范围，无需分页
        if (leftHeight < pageHeight) {
          pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
        } else {
          while (leftHeight > 0) {
            pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
            leftHeight -= pageHeight
            position -= 841.89
            // 避免添加空白页
            if (leftHeight > 0) {
              pdf.addPage()
            }
          }
        }
        const blob = convertBase64ToFile(pdf.output('datauristring'), 'esign.pdf')
        const fileOfBlob = new File([blob], 'esign.pdf')
        const formData = new FormData()
        formData.append('file', fileOfBlob)
        formData.append('moduleName', 'seller')

        imageUpload(formData).then(async (res) => {
          const signPdfUrl = res.url
          await sellerUpdateSignPdf({ signPdfUrl, token: getToken() })
          await userStore.getSellerInfo()

          Message.success(t('签署成功'))
          subLoading.value = false
          emits('done')
        }).catch(() => {
          subLoading.value = false
        })
      }).catch(() => {
        subLoading.value = false
        Message.error(t('请稍后重试'))
      })
    } else {
      Message.error(t('请签名'))
    }
  }

  const signVisible = ref(false)
  const signatureRef = ref()
  const signReady = ref(false)
  const sigOption = ref({
    penColor: '#000000',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  })

  const signReset = () => {
    signatureRef.value.clear()
  }

  const signDone = () => {
    if (signatureRef.value.isEmpty()) {
      Message.error(t('请签名'))
    } else {
      signImg.value = signatureRef.value.save()
      signVisible.value = false
    }
  }

  watch(signVisible, (val) => {
    if (val) {
      nextTick(() => {
        signReady.value = true
      })
    } else {
      signReady.value = false
    }
  })

  onMounted(async () => {
    siteConfig.value = await loadSiteConfig(appName)

    sigOption.value.penColor = siteConfig.value.themeMode && siteConfig.value.themeMode === 'dark' ? '#ffffff' : '#000000'
  })
</script>

<style lang="less" scoped>
.info-content {
  padding: 20px;
  &.dark {
    background-color: #2a2a2b;
  }
  > h2 {
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 10px;
  }
  > p {
    margin-bottom: 20px;
  }
  .time-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 40px;
    .item {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      height: 30px;
      img {
        height: 30px;
        width: auto;
      }
    }
    > .left {
      position: relative;
      > img {
        width: 50px;
        height: auto;
        position: absolute;
        top: 0;
        left: 20px;
        &.one {
          width: 60px;
          top: -10px;
          left: 60px;
        }
      }
    }
  }
}
</style>
