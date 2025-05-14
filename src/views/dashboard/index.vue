<template>
  <div>
    <a-row :gutter="20">
      <a-col :span="12">
        <takeover-view :infoData="headData" />
      </a-col>
      <a-col :span="12">
        <pan-count :infoData="headData" />
      </a-col>
    </a-row>

    <a-row :gutter="20" class="mt-5">
      <a-col :span="16">
        <div class="block-content">
          <div class="title-content">
            <div class="title">{{ t('店铺统计') }}</div>
            <div class="chart-type">
              <div
                v-for="(item, index) in chartType" :key="index"
                :class="{'active': selectCurrent === index}"
                class="item"
                @click="changeChart(index)">{{ t(item) }}</div>
            </div>
          </div>

          <div class="content">
            <line-chart :chart-data="lineData" :loading="lineLoading"></line-chart>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="block-content">
          <div class="title">{{ t('订单统计') }}</div>
          <div class="content">
            <order-count :data="orderStatsData"></order-count>
          </div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="20" class="mt-5">
      <a-col :span="16">
        <div class="block-content">
          <div class="title">{{ t('热销商品Top10') }}</div>
          <div class="content table">
            <a-spin :loading="goodsLoading">
              <div style="height: 500px">
                <goods-table :goodsData="goodsData" />
              </div>
            </a-spin>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="block-content">
          <div class="title">{{ t('您的类别') }}（{{ categoryList.length }}）</div>
          <div class="content table">
            <a-spin :loading="categoryLoading">
              <a-scrollbar style="height: 500px; overflow: auto;">
                <a-row v-if="categoryList.length && !categoryLoading" :gutter="20" class="mt-5">
                  <a-col :lg="12" :xl="8" v-for="item in categoryList" :key="item.id">
                    <div class="category-item" @click="intoGoodsList(item)">
                    <div class="content">
                      <div class="info-content">
                        <p>{{ item.name }}</p>
                        <p>({{ item.goodCount }})</p>
                      </div>
                      <img :src="item.iconImg" class="category-img" alt="">
                    </div>
                  </div>
                  </a-col>
                </a-row>
                <a-empty v-if="!categoryList.length && !categoryLoading" class="mt-5" />
              </a-scrollbar>
            </a-spin>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useUserStore } from '@/store'
  import { sellerHead, sellerLine, sellerStats, mallCategoryGoodCount } from '@/api/seller'
  import { sellerGoodsList } from '@/api/goods'
  import TakeoverView from './components/takeover-view.vue'
  import PanCount from './components/pan-count.vue'
  import LineChart from './components/line-chart.vue'
  import OrderCount from './components/order-count.vue'
  import goodsTable from './components/goods-table.vue'
  import { navigationTo } from '@/utils'

  const { t } = useI18n()
  const userStore = useUserStore()
  const sellerInfo = computed(() => userStore.sellerInfo)
  const sellerId = computed(() => sellerInfo.value.id)

  const headData = ref({})
  const getSellerHead = () => {
    sellerHead().then(res => {
      headData.value = res
    })
  }

  const chartType = ref(['今日', '近7天', '近30天'])
  const selectCurrent = ref(0)

  const changeChart = (index) => {
    if (selectCurrent.value !== index) {
      selectCurrent.value = index
      getChartLineData()
    }
  }

  const lineLoading = ref(false)
  const lineData = ref({
    dateData: [],
    saleData: [],
    browseData: []
  })
  const getChartLineData = () => {
    lineLoading.value = true

    sellerLine({type: selectCurrent.value, sellerId: sellerId.value}).then((res) => {
      const data = res.line || []
      const dataArr = data

      const dateData = []
      const saleData = []
      const browseData = []

      dataArr.forEach((item) => {
        dateData.push(item.dayString.slice(item.dayString.indexOf('-') + 1))
        saleData.push(item.countSales)
        browseData.push(item.countVisits)
      })
      lineData.value = {
        dateData,
        saleData,
        browseData
      }

      lineLoading.value = false
    }).catch(() => {
      lineLoading.value = false
    })
  }

  const orderStatsData = ref({})
  const getOrderStatsData = () => {
    sellerStats({ sellerId: sellerId.value}).then(res => {
      orderStatsData.value = res.stats
    })
  }

  const categoryLoading = ref(false)
  const categoryList = ref([])
  const getCategoryList = () => {
    categoryLoading.value = true
    mallCategoryGoodCount({ sellerId: sellerId.value}).then(res => {
      categoryList.value = res
      categoryLoading.value = false
    }).catch(() => {
      categoryLoading.value = false
    })
  }

  const goodsLoading = ref(false)
  const goodsData = ref([])
  const getGoodsData = () => {
    goodsLoading.value = true
    sellerGoodsList({
      pageNum: 1,
      pageSize: 10,
      isHot: '1'
    }).then(res => {
      goodsData.value = res.pageList
      goodsLoading.value = false
    }).catch(() => {
      goodsLoading.value = false
    })
  }

  const intoGoodsList = (item) => {
    sessionStorage.setItem('currentcategoryId', item.categoryId)
    navigationTo('/goods/store')
  }

  onMounted(() => {
    getSellerHead()
    getChartLineData()
    getOrderStatsData()
    getGoodsData()
    getCategoryList()
  })
</script>

<style lang="less" scoped>
.block-content {
  border-radius: 8px;
  box-shadow: 0px 0px 20px 0px rgba(76, 87, 125, .02);
  border: 1px solid var(--color-border-1);
  padding: 15px;
  background-color: var(--color-bg-2);
  > .title-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .title {
    font-size: 16px;
    line-height: 26px;
    font-weight: bold;
    color: var(--color-text-1);
  }
  > .content {
    width: 100%;
    height: 320px;
    overflow: hidden;
    &.table {
      height: 500px;
      margin-top: 20px;
    }
  }
}

.chart-type {
  display: flex;
  align-items: center;
  gap: 10px;
  > .item {
    min-width: 60px;
    padding: 0 10px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(var(--gray-2));
    border-radius: 4px;
    font-size: 12px;
    color: var(--color-text-2);
    cursor: pointer;
    user-select: none;
    transition: all 0.3s ease;
    &.active {
      font-weight: bold;
      color: #fff;
      background-color: rgb(var(--primary-6));
    }
  }
}

.category-item {
  width: 100%;
  position: relative;
  margin-bottom: 20px;
  &::before {
    content: '';
    display: block;
    padding-top: 100%;
  }
  > .content {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: hidden;
    > .info-content {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
      background-color: rgba(0,0,0,.5);
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      line-height: 21px;
    }
  }
}
</style>
