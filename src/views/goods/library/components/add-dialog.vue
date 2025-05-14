<template>
  <a-modal
    :visible="visible"
    :width="500"
    :mask-closable="false"
    :esc-to-close="false"
    :closable="false"
  >
    <template #title>{{ dialogTitle }}</template>
    <div class="dialog-content">
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item :label="t('利润比例')" field="profitRatio">
          <a-input-number v-model="formState.profitRatio" model-event="input" :min="0" :max="100" :hide-button="true" :placeholder="t('请输入利润比例')">
            <template #suffix>%</template>
          </a-input-number>
          <template #extra>
            <div class="mt-1">{{ t('将选中的商品发布到你的店铺，并填写利润比例。') }}</div>
            <div class="flex mt-1 items-center gap-1">
              {{ t('建议利润比例：') }}
              <div class="flex items-center gap-1">
                <pc-number :data="goodsProfit.sysParaMin" :currency="false" :color="true" suffix="%" class="info-number"></pc-number>
                <span class="main-color"> — </span>
                <pc-number :data="goodsProfit.sysParaMax" :currency="false" :color="true" suffix="%" class="info-number"></pc-number>
              </div>
            </div>
          </template>
        </a-form-item>
        <template v-if="showSaleSetting">
          <a-form-item :label="t('折扣日期')" field="discountDate">
            <a-range-picker
              v-model="formState.discountDate"
              :placeholder="[t('开始日期'), t('结束日期')]"
              :disabled-date="(current) => current && current < dayjs().startOf('day')"
              style="width: 100%"
              @change="handleDiscountDateChange"
            />
          </a-form-item>
          <a-form-item :label="t('折扣比例')" field="discountRatio">
            <a-input-number
              v-model="formState.discountRatio"
              :min="1"
              :precision="0"
              :placeholder="t('请输入折扣比例')"
              :disabled="!formState.discountDate || formState.discountDate.length === 0"
              :hide-button="true"
              style="width: 100%"
              model-event="input"
            >
              <template #suffix>%</template>
            </a-input-number>
          </a-form-item>
        </template>
        
      </a-form>
    </div>

    <template #footer>
      <a-button @click="handleCancel">{{ t('取消') }}</a-button>
      <a-button :loading="subLoading" type="primary" @click="submitHandle">{{ t('提交') }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
  import { ref, reactive, computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useUserStore } from '@/store'
  import dayjs from 'dayjs'
  import tool from '@/utils/tool'
  import { sellerGoodsAddOrUpdate } from '@/api/goods'
  import { cloneDeep } from 'lodash-es'
  import { Message } from '@arco-design/web-vue'

  const { t } = useI18n()
  const appName = import.meta.env.VITE_APP

  const userStore = useUserStore()
  const goodsProfit = computed(() => userStore.goodsProfit)

  // 显示折扣设置
  const showSaleSetting = computed(() => {
    return !['tiktok-wholesale', 'masla', 'tiktok9', 'oceanPick'].includes(appName)
  })

  const subLoading = ref(false)

  const emits = defineEmits(['update:visible', 'done'])
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    ids: {
      type: Array,
      default: () => []
    },
    goodsInfo: {
      type: Object,
      default: () => {}
    }
  })

  const dialogTitle = computed(() => {
    return props.goodsInfo ? t('添加产品') : t('批量添加')
  })

  const handleCancel = () => {
    emits('update:visible', false)
  }

  const formRef = ref()
  const formState = ref({
    profitRatio: undefined,
    discountDate: [],
    discountRatio: undefined
  })

  const validateProfitRatio = (value, cb) => {
    return new Promise((resolve) => {
      if (!value) {
        cb(t('请输入利润比例'))
      }

      const num = Number(value)
      if (num < goodsProfit.value.sysParaMin || num > goodsProfit.value.sysParaMax) {
        cb(`${t('利润比例不能小于')}${goodsProfit.value.sysParaMin}${t('，且不能大于')}${goodsProfit.value.sysParaMax}`)
      }

      resolve()
    })
  }

  const validateDiscountRatio = (value, cb) => {
    return new Promise((resolve) => {
      if (formState.value.discountDate && formState.value.discountDate.length) {
        if (!value) {
          cb(t('请输入折扣比例'))
        }
        
        const num = Number(value)
        if (!Number.isInteger(num) || num <= 0) {
          cb(t('折扣比例必须为正整数'))
        }
        
        resolve()
      } else {
        resolve()
      }
    })
  }

  const formRules = reactive({
    profitRatio: [{
      required: true,
      validator: validateProfitRatio,
      trigger: 'blur'
    }],
    discountRatio: [{
      required: false,
      validator: validateDiscountRatio,
      trigger: 'blur'
    }]
  })

  const handleDiscountDateChange = (data) => {
    if (data && data.length) {
      formRules.discountRatio[0].required = true
    } else {
      formRules.discountRatio[0].required = false
      formState.value.discountRatio = undefined
    }
  }

  const submitHandle = async () => {
    const valid = await formRef.value.validate()
    if (!valid) {
      const data = cloneDeep(formState.value)
      const params = {
        goodsIds: props.ids.join(','),
        profit: Number(tool.div(data.profitRatio, 100)).toFixed(4)
      }
      if (data.discountDate && data.discountDate.length) {
        params.startTime = `${data.discountDate[0]} 00:00:00`
        params.endTime = `${data.discountDate[0]} 23:59:59`
        params.discount = Number(tool.div(data.discountRatio, 100)).toFixed(4)
      } else {
        params.startTime = null
        params.endTime = null
        params.discount = '0.00'
      }

      subLoading.value = true
      sellerGoodsAddOrUpdate(params).then(async () => {
        await userStore.getSaleGoodsNum()
        Message.success(t('添加成功'))
        handleCancel()
        subLoading.value = false
        emits('done')
      }).catch(() => {
        subLoading.value = false
      })
    }
  }

  watch(() => props.visible, (newVal) => {
    if (!newVal) {
      formRules.discountRatio[0].required = false
      subLoading.value = false

      formRef.value.resetFields()
      formRef.value.clearValidate()
    }
  })
</script>

<style lang="less" scoped>
  .dialog-content {
    min-height: 200px;
  }

  .info-number {
    font-size: 12px !important;
  }
</style>
