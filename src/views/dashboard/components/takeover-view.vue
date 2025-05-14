<template>
  <div class="take-over-new clearfix">
    <div v-for="item in itemData" :key="item.key" :style="{'background-color': item.background}" class="item">
      <svg-icon :name="item.icon" size="38px" class="icon" />
      <div class="number">
        <pc-number :data="item.num" :currency="item.currency" :decimals="item.currency ? 2 : 0" />
      </div>
      <p>{{ t(item.title) }}</p>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const props = defineProps({
    infoData: {
      type: Object,
      default: () => ({
        goodsNum: 0,
        totalSales: 0,
        orderNum: 0,
        totalProfit: 0
      })
    }
  })

  const itemData = ref([
    {
      title: '商品总数',
      key: "goodsNum",
      num: 0,
      currency: false,
      background: '#f8285a',
      icon: 'new-cart'
    },
    {
      title: '销售总额',
      key: "totalSales",
      num: 0,
      currency: true,
      background: '#1b84ff',
      icon: 'new-sale'
    },
    {
      title: '总订单',
      key: "orderNum",
      num: 0,
      currency: false,
      background: '#7239ea',
      icon: 'new-order-1'
    },
    {
      title: '总利润',
      key: "totalProfit",
      num: 0,
      currency: true,
      background: '#17c653',
      icon: 'new-dishes'
    }
  ])

  watch(() => props.infoData, (newVal) => {
    itemData.value.forEach(item => {
      item.num = newVal[item.key]
    })
  }, { deep: true })
</script>

<style lang="less" scoped>
  .take-over-new {
    > .item {
      height: 170px;
      width: calc(50% - 7.5px);
      margin-top: 15px;
      padding: 20px;
      float: left;
      border-radius: 8px;
      box-shadow: 0px 0px 20px 0px rgba(76, 87, 125, .02);
      color: #ffffff;
      &:nth-child(odd) {
        margin-right: 7.5px;
      }
      &:nth-child(even) {
        margin-left: 7.5px;
      }
      &:nth-child(-n + 2) {
        margin-top: 0;
      }
      .number {
        font-weight: 600;
        font-size: 26px;
        line-height: 42px;
        margin-top: 15px;
        :deep(.pc-number-wrapper) {
          color: #fff;
          font-weight: 600;
          font-size: 26px !important;
          line-height: 42px;
        }
      }
      .icon {
        position: relative;
        left: -4px;
      }
      > p {
        font-weight: 400;
        font-size: 14px;
        line-height: 16px;
      }
    }
  }
</style>