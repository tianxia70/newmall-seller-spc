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
      <a-form ref="formRef" :model="formState" layout="vertical">
        <a-form-item v-if="goodsInfo" class="label-item-flex" field="sellingPrice" validate-trigger="blur" :rules="[{ required: true, message: t('填写售价') }]">
          <template #label>
            <div class="flex items-center gap-2 justify-between flex-1">
              <span>{{ t('参考售价') }}</span>
              <a-tooltip :content="t('参考售价为商品的参考售价，用于计算商品的售价')">
                <icon-exclamation-circle-fill />
              </a-tooltip>
            </div>
          </template>
          <a-input-number
            v-model="formState.sellingPrice"
            :min="0"
            :precision="2"
            :step="0.01"
            :placeholder="t('填写售价')"
            style="width: 100%"
          >
            <template #prefix>{{ currencyUnit }}</template>
          </a-input-number>
        </a-form-item>
      </a-form>
    </div>

    <template #footer>
      <a-button @click="handleCancel">{{ t('取消') }}</a-button>
      <a-button :loading="subLoading" type="primary" @click="submitHandle">{{ t('提交') }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { Message } from '@arco-design/web-vue'
  import { useCurrencyStore } from '@/store'

  const { t } = useI18n()
  const currencyStore = useCurrencyStore()
  const currencyUnit = computed(() => currencyStore.currencyUnit)

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
    sellingPrice: 0
  })

  const submitHandle = () => {
    formRef.value.validate().then((res) => {
      if (res) {
        subLoading.value = true
        // TODO: 在这里添加您的提交逻辑
        setTimeout(() => {
          Message.success(t('添加成功'))
          emits('done')
          handleCancel()
          subLoading.value = false
        }, 1000)
      }
    })
  }

  watch(() => props.visible, (newVal) => {
    if (newVal) {
      if (props.goodsInfo) {
        formState.value.sellingPrice = props.goodsInfo.systemPrice
      }
    }
  })
</script>

<style lang="less" scoped>
  .dialog-content {
    min-height: 200px;
  }
</style>
