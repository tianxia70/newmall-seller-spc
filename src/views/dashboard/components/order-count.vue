<template>
  <div class="item-content">
    <div class="item">
      <div class="number">
        <pc-number :data="data.orderNum || 0" :currency="false" :decimals="0"></pc-number>
      </div>
      <div class="name">{{ t('总订单') }}</div>
    </div>
    <div class="item">
      <div class="number">
        <pc-number :data="data.orderIng || 0" :currency="false" :decimals="0"></pc-number>
      </div>
      <div class="name">{{ t('进行中') }}</div>
    </div>
    <div class="item">
      <div class="number">
        <pc-number :data="data.orderFinish || 0" :currency="false" :decimals="0"></pc-number>
      </div>
      <div class="name">{{ t('已完成') }}</div>
    </div>
    <div class="item">
      <div class="number">
        <pc-number :data="data.orderCancel || 0" :currency="false" :decimals="0"></pc-number>
      </div>
      <div class="name">{{ t('取消订单') }}</div>
    </div>
    <div class="item">
      <div class="number">
        <pc-number :data="data.orderRefund || 0" :currency="false" :decimals="0"></pc-number>
      </div>
      <div class="name">{{ t('已退款') }}</div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  data: {
    type: Object,
    default: () => {}
  }
})
</script>

<style lang="less" scoped>
.item-content {
  padding-top: 20px;
  overflow: hidden;
  > .item {
    width: 33.3333%;
    height: 130px;
    float: left;
    overflow: hidden;
    padding: 0 5px;
    padding-top: 50px;
    .number {
      width: 100%;
      height: 30px;
      font-size: 22px;
      font-weight: bold;
      transition: all 0.2s ease;
      color: var(--color-text-1);
      display: flex;
      justify-content: center;
      :deep(.pc-number-wrapper) {
        font-size: 22px !important;
      }
    }
    > .name {
      margin-top: 10px;
      font-size: 14px;
      line-height: 16px;
      color: var(--color-text-2);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
    }
  }
}
</style>