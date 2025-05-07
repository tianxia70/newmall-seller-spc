<template>
  <a-modal
    :visible="visible"
    :width="700"
    :ok-text="t('我已阅读并同意')"
    :cancel-text="t('取消')"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <template #title>{{ t('用户协议') }}</template>
    <a-scrollbar style="height: 600px;overflow: auto;">
      <div class="document-content">
        <div class="content">
          <div v-for="(item, index) in agreeDataRef" :key="index" class="agree-item">
            <h3>{{ t(item.title) }}</h3>
            <div v-if="item.data.length" class="info">
              <p v-for="(info, _index) in item.data" :key="info">
                <template v-if="info.indexOf('{0}') > -1">
                  <template v-if="info.indexOf('您应当按照平台的规定设置商品价格') > -1">{{ `${index + 1}.${_index + 1} ${t(info, [timeSet])}` }}</template>
                  <template v-if="info.indexOf('店铺最低销售商品种类为') > -1">{{ `${index + 1}.${_index + 1} ${t(info, [goodsSet])}` }}</template>
                </template>
                <template v-else>
                  {{ `${index + 1}.${_index + 1} ${t(info)}` }}
                </template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </a-scrollbar>
  </a-modal>
</template>

<script setup>
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { agreeData } from "./config.js"
  import { cloneDeep } from 'lodash-es'

  const { t } = useI18n()
  const appName = import.meta.env.VITE_APP


  const emits = defineEmits(['update:visible', 'done']);
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    }
  })

  const timeSet = computed(() => {
    return ['oufan'].includes(appName) ? 48 : 24
  })

  const goodsSet = computed(() => {
    return ['oufan'].includes(appName) ? 20 : 10
  })

  const agreeDataRef = computed(() => {
    const data = cloneDeep(agreeData)
      data.forEach(item => {
        if (item.key === 'two') {
          item.data.splice(2, 1)
        }
      })
      return data
  })

  const handleOk = () => {
    handleCancel()
    emits('done')
  }

  const handleCancel = () => {
    emits('update:visible', false)
  }
</script>

<style lang="less" scoped>
  .document-content {
    > .content {
      .agree-item {
        margin-top: 20px;
        &:first-child {
          margin-top: 0;
        }
        > h3 {
          font-size: 18px;
          font-weight: bold;
          color: var(--color-text-1);
          padding-bottom: 10px;
        }
        > .info {
          font-size: 14px;
          color: var(--color-text-1);
          > p {
            margin-top: 8px;
            &:first-child {
              margin-top: 0;
            }
          }
        }
      }
    }
  }
</style>
