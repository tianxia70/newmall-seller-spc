<template>
  <div>
    <!-- 密码输入弹窗 -->
    <safe-password-input v-model:visible="showSafePassword" @confirm="submitRequest" />

    <a-spin :loading="pageLoading" :size="32">
      <a-card :title="t('店铺升级套餐列表')">
        <div class="list-content">
          <div class="item" v-for="item in comboListData" :key="item.id">
            <div class="post"><img :src="item.icon" alt=""></div>
            <div class="content">
              <h3>{{ item.name }}</h3>
              <p>{{ t('可推广产品数') }}<span>{{ item.count }}</span></p>
              <p>{{ item.desc1 }}</p>
            </div>
            <div class="btn">
              <div>
                <pc-number :data="item.prize" :color="true" />
                <span>/{{ item.per }}{{ t('日') }}</span>
              </div>
              <a-button :loading="item.payLoading" type="primary" @click="handleBuy(item)">{{ t('购买套餐') }}</a-button>
            </div>
          </div>
        </div>
      </a-card>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { comboList, comboBuy } from '@/api/seller'

const { t } = useI18n()
const pageLoading = ref(false)

const comboListData = ref([])
const getComboList = () => {
  pageLoading.value = true
  comboList().then(res => {
    const data = res.line || []
    data.forEach(item => {
      item.payLoading = false
    })
    comboListData.value = data
    pageLoading.value = false
  }).catch(() => {
    pageLoading.value = false
  })
}

const showSafePassword = ref(false)
const currentItem = ref(null)
const handleBuy = (item) => {
  currentItem.value = item
  showSafePassword.value = true
}
const submitRequest = (safeword) => {
  if (!currentItem.value) return
  currentItem.value.payLoading = true
  comboBuy({
    id: currentItem.value.id,
    safeword
  }).then(() => {
    currentItem.value.payLoading = false
    Message.success(t('购买成功'))
    getComboList()
  }).catch(() => {
    currentItem.value.payLoading = false
  })
}

onMounted(() => {
  getComboList()
})
</script>

<style lang="less" scoped>
  .list-content {
    min-height: 300px;
    > .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      background-color: var(--color-fill-1);
      margin-top: 20px;
      border-radius: 8px;
      &:first-child {
        margin-top: 0;
      }
      .post {
        width: 100px;
        height: 100px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .content {
        flex: 1;
        padding-left: 30px;
        padding-right: 30px;
        h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-1);
          margin-bottom: 10px;
        }
        p {
          font-size: 14px;
          color: var(--color-text-2);
          margin-bottom: 10px;
          span {
            color: rgb(var(--primary-6));
            font-weight: 500;
            padding-left: 5px;
          }
        }
      }
      .btn {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        > div {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          :deep(.pc-number-wrapper) {
            font-size: 24px !important;
            font-weight: 500;
          }
          span {
            font-size: 14px;
            color: rgb(var(--primary-6));
            padding-left: 5px;
          }
        }
      }
    }
  }
</style>
