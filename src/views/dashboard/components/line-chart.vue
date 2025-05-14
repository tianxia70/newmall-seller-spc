<template>
  <div>
    <a-spin :loading="loading">
      <div class="chart-content" ref="chartRef"></div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, shallowRef, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import { graphic } from 'echarts'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  chartData: {
    type: Object,
    default: () => {}
  }
})

const { t } = useI18n()

const chartInstance = shallowRef(null)
const chartRef = ref(null)

const handleResize = () => {
  chartInstance.value && chartInstance.value.resize()
}

const initChart = () => {
  chartInstance.value = echarts.init(chartRef.value)
  setOptions(props.chartData)
  window.addEventListener('resize', handleResize)
}

const setOptions = ({dateData = [], saleData = [], browseData = []} = {}) => {
  chartInstance.value.setOption({
    color: ['#17c653', '#2d8df1'],
    xAxis: {
      data: dateData,
      boundaryGap: false,
      axisTick: {
        show: false,
      },
      axisLine: {
        show: true
      }
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    yAxis: {
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          color: "rgba(0,0,0,.1)",
        }
      }
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: '#6a7985'
        }
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ccc',
      borderWidth: 1,
      textStyle: {
        color: '#666'
      },
      padding: [5, 10],
      formatter: function(params) {
        let result = params[0].axisValue + '<br/>'
        params.forEach(item => {
          result += item.marker + ' ' + item.seriesName + ': ' + item.value + '<br/>'
        })
        return result
      }
    },
    legend: {
      data: [t('销量'), t("浏览")],
      left: 'center',
      itemWidth: 20,
      itemHeight: 10,
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: t('销量'),
        smooth: true,
        type: "line",
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: {
          opacity: 0.8,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgba(23, 198, 83, 0.3)",
            },
            {
              offset: 1,
              color: "rgba(23, 198, 83, 0)",
            },
          ]),
        },
        data: saleData,
        animationDuration: 2800,
        animationEasing: "cubicInOut",
      },
      {
        name: t('浏览'),
        smooth: true,
        type: "line",
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: {
          opacity: 0.8,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgba(45, 141, 241, 0.3)",
            },
            {
              offset: 1,
              color: "rgba(45, 141, 241, 0)",
            },
          ]),
        },
        data: browseData,
        animationDuration: 2800,
        animationEasing: "quadraticOut",
      },
    ],
  })
}

watch(() => props.chartData, (newVal) => {
  if (newVal) {
    setOptions(newVal)
  }
}, { deep: true })

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance.value && chartInstance.value.dispose()
})
</script>

<style lang="less" scoped>
.chart-content {
  width: 100%;
  height: 320px;
  position: relative;
  overflow: hidden;
}
</style>