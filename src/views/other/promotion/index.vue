<template>
  <div>
    <a-spin :loading="pageLoading" :size="32">
      <a-card :title="t('邀请链接')">
        <a-row :gutter="40">
          <a-col :xs="24" :sm="24" :md="16" :lg="16" :xl="12" class="mb-3">
            <a-input-search v-model="promotionalUrl" readonly search-button>
              <template #button-default>
                <a-button type="primary" @click="handleCopy(promotionalUrl)">{{ t('复制') }}</a-button>
              </template>
            </a-input-search>
          </a-col>
          <a-col v-if="showCodeCopy" :xs="24" :sm="24" :md="6" :lg="6" :xl="6" class="mb-3">
            <a-input-search v-model="userCode" readonly search-button>
              <template #button-default>
                <a-button type="primary" @click="handleCopy(userCode)">{{ t('复制') }}</a-button>
              </template>
            </a-input-search>
          </a-col>
        </a-row>
      </a-card>
    </a-spin>

    <a-spin v-if="showPromoRate" :loading="pageLoading" :size="32">
      <a-card :title="t('创业联盟')" class="mt-5">
        <div class="intro-content">
          <p class="mb-2 title-text">{{ t('成为创业联盟会员后，您可以邀请好友通过您的邀请码进行注册。每当您的好友在我们平台上完成一笔订单，您就能获得相应的佣金奖励。根据您邀请的好友层数，您可以获得不同比例的分成。') }}</p>
          <p v-html="t('一级好友的商品销售利润将给您{_$1}的分成，',{_$1:'<span class=tip>'+ Number(Number(tool.times(dataInfo.promoRate1 || 0, 100)).toFixed(2)) +'%</span>'})"></p>
          <p v-html="t('二级好友的商品销售利润将给您{_$1}的分成，',{_$1:'<span class=tip>'+ Number(Number(tool.times(dataInfo.promoRate2 || 0, 100)).toFixed(2)) +'%</span>'})"></p>
          <p v-html="t('三级好友的商品销售利润将给您{_$1}的分成。',{_$1:'<span class=tip>'+ Number(Number(tool.times(dataInfo.promoRate3 || 0, 100)).toFixed(2)) +'%</span>'})"></p>
          <p class="mb-2 mt-5 title-text">{{ t('以下是分成计算公式：') }}</p>
          <p v-html="t('一级好友分成计算公式：佣金 = 商品销售利润 x {_$1}',{_$1:'<span class=tip>'+ Number(Number(tool.times(dataInfo.promoRate1 || 0, 100)).toFixed(2)) +'%</span>'})"></p>
          <p v-html="t('二级好友分成计算公式：佣金 = 商品销售利润 x {_$1}',{_$1:'<span class=tip>'+ Number(Number(tool.times(dataInfo.promoRate2 || 0, 100)).toFixed(2)) +'%</span>'})"></p>
          <p v-html="t('三级好友分成计算公式：佣金 = 商品销售利润 x {_$1}',{_$1:'<span class=tip>'+ Number(Number(tool.times(dataInfo.promoRate3 || 0, 100)).toFixed(2)) +'%</span>'})"></p>
          <p class="mt-5 title-text">{{ t('我们提供详细的分成计算公式，以便您清晰了解佣金的计算方式。我们鼓励您了解平台的邀请制度规则，以便更好地管理和规划您的佣金收入。我们感谢您的参与，并期待与您共同发展。') }}</p>
        </div>
      </a-card>
    </a-spin>

    <div class="ma-content-block p-4 mt-5">
      <a-tabs v-model:activeKey="activeKey" @change="tabChange">
        <a-tab-pane v-for="item in navData" :key="item.key" :title="item.name"></a-tab-pane>
      </a-tabs>

      <a-table
        ref="tableRef"
        page-position="bottom"
        :columns="tableColumns"
        :data="tableData"
        :bordered="true"
        :loading="tableLoading"
        :pagination="{
          ...pageObj,
          showTotal: true,
          showPageSize: true
        }"
        @page-change="pageChange"
        @page-size-change="pageSizeChange"
      >
        <template #avatar="{ record }">
          <a-avatar>
            <img
              alt="avatar"
              :src="record.avatar || defaultLogo.href"
            />
          </a-avatar>
        </template>
        <template #name="{ record }">
          <span>{{ record.name ||'--' }}</span>
        </template>
        <template #rebate="{ record }">
          <pc-number :data="record.rebate || 0":color="true" />
        </template>
        <template #countOrder="{ record }">
          <pc-number :data="record.countOrder || 0" :currency="false" :decimals="0" />
        </template>
        <template #regTime="{ record }">
          <span>{{ record.regTime || '--' }}</span>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { sellerMyPromotional, sellerTeamLevel } from '@/api/user'
import tool from '@/utils/tool'
import useClipboard from 'vue-clipboard3'
import { navData, tableColumns } from './config'
import { useTableList } from '@/hooks/useTableList'

const appName = import.meta.env.VITE_APP
const defaultLogo = new URL('@/assets/images/level/default-logo.png', import.meta.url)

const { t, locale } = useI18n()
const { toClipboard } = useClipboard()

const showCodeCopy = computed(() => {
  return !['harrods'].includes(appName)
})

const showPromoRate = computed(() => {
  return !['oufan', 'ottoGroup', 'klepierre', 'flipkart3'].includes(appName)
})

const pageLoading = ref(false)
const dataInfo = ref({
  download: '',
  code: '',
  promoRate1: '',
  promoRate2: '',
  promoRate3: ''
})

const promotionalUrl = ref('')
const userCode = ref('')

const getDataInfo = () => {
  pageLoading.value = true
  sellerMyPromotional().then(res => {
    dataInfo.value = res
    userCode.value = dataInfo.value.code
    promotionalUrl.value = `${dataInfo.value.download}?usercode=${dataInfo.value.code}&lang=${locale.value}`
  }).finally(() => {
    pageLoading.value = false
  })
}

const activeKey = ref(navData[0].key)

const tabChange = (key) => {
  activeKey.value = key
  searchHandle()
}

const { tableData, tableLoading, getTableData, searchReset, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(
  sellerTeamLevel,
  {},
  false
)

const searchHandle = () => {
  const data = {
    level: activeKey.value
  }
  getTableData(data)
}

const handleCopy = async (str) => {
  try {
    await toClipboard(str)
    Message.success(t('复制成功'))
  } catch (e) {
    console.error(e);
  }
}

onMounted(() => {
  searchHandle()
  getDataInfo()
})
</script>

<style lang="less" scoped>
.intro-content {
  p {
    color: var(--color-text-1);
    line-height: 1.5;
    :deep(span) {
      color: rgb(var(--primary-6));
    }
  }
}
</style>
