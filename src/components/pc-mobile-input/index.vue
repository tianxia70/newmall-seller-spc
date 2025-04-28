<template>
  <div class="pc-mobile-input">
    <a-dropdown :disabled="disabled" >
      <template #content>
        <div class="area-code-content">
          <div class="search-content">
            <a-input v-model="keywords" class="input-content" :placeholder="t('请输入搜索关键字')" />
          </div>
          <div v-if="areaCodeDataRef.length">
            <a-doption v-for="item in areaCodeDataRef" :key="item.name" @click="itemHandle(item)">
              <div class="code-item">
                <p>{{ item.name }}</p>
                <p>{{ item.showCode }}</p>
              </div>
            </a-doption>
          </div>
          <div v-else class="flex items-center justify-center p-5">{{ $t('暂无数据') }}</div>
        </div>
      </template>
      <a-button class="area-code-btn" :class="{'ar': isArLang()}">
        {{ areaCodeValue }}
      </a-button>
    </a-dropdown>

    <a-input
      v-model="mobileValue"
      :placeholder="t('请输入手机号')"
      :disabled="disabled"
      @input="inputHandle"
      allow-clear
    />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { cloneDeep } from 'lodash'
  import { countries } from './config'
  import { useI18n } from 'vue-i18n'
  import tool from '@/utils/tool'
  import { loadSiteConfig, isArLang } from '@/utils'
  import { phoneAreaCodeKey, phoneAreaCodeDefalut } from '@/configs'

  const { t } = useI18n()

  const appName = import.meta.env.VITE_APP
  const siteConfig = ref({})

  const emits = defineEmits(['update:value', 'update:areaCode']);

  const props = defineProps({
    value: {
      type: String,
      default: ''
    },
    areaCode: {
      type: [Number, String],
      default: phoneAreaCodeDefalut
    },
    disabled: {
      type: Boolean,
      default: false
    }
  })

  const keywords = ref('')
  const areaCodeValue = ref('')
  const mobileValue = ref('')

  const countriesData = cloneDeep(countries)
  const areaCodeData = countriesData.map(item => {
    return {
      ...item,
      showCode: `+${item.dialCode}`
    }
  })

  const areaCodeDataRef = computed(() => {
    const data = areaCodeData.filter(item => {
      const key = keywords.value.toLowerCase()
      const name = item.name.toLowerCase()
      const dialCode = String(item.dialCode)
      if (isNaN(key)) {
        return name.indexOf(key) > -1
      } else {
        return dialCode === key
      }
    })

    return keywords.value ? data : areaCodeData
  })

  const itemHandle = (data) => {
    areaCodeValue.value = data.showCode
    emits('update:areaCode', String(data.dialCode))
  }

  const inputHandle = () => {
    emits('update:value', mobileValue.value)
  }

  const dataInit = () => {
    const setCode = parseInt(tool.local.get(phoneAreaCodeKey) || siteConfig.value.phoneAreaCodeKey)

    areaCodeValue.value = props.areaCode ? `+${props.areaCode}` : `+${setCode}`
    mobileValue.value = props.value || ''

    const areaCode = props.areaCode || setCode
    emits('update:areaCode', areaCode)
  }

  watch(
    () => props.value,
    () => {
      dataInit()
    },
    {
      immediate: true
    }
  )
  
  onMounted(async () => {
    siteConfig.value = await loadSiteConfig(appName)

    dataInit()
  })
</script>

<style lang="less" scoped>
  .pc-mobile-input {
    display: flex;
    align-items: center;
    .area-code-btn {
      width: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      color: var(--color-text-1);
      &.ar {
        &::after {
          right: 100%;
        }
      }
      &::after {
        content: '';
        display: block;
        width: 1px;
        height: 26px;
        background-color: #999;
        position: absolute;
        right: -1px;
      }
    }
    :deep(.arco-input-wrapper) {
      flex: 1;
    }
  }
  .search-content {
    padding: 0 15px;
    padding-top: 15px;
  }
  .area-code-content {
    width: 300px;
    .input-content {
      margin-bottom: 15px;
    }
    .arco-dropdown-option {
      line-height: 1.5;
    }
    :deep(.arco-dropdown-option-content) {
      width: 100%;
      display: block;
      white-space: inherit;
    }
    .code-item {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 34px;
      padding: 5px 0;
      cursor: pointer;
      transition: all 0.3s ease;
      gap: 10px;
      > p {
        font-size: 13px;
        word-break: break-all;
        &:first-child {
          flex: 1;
          word-break: break-all;
        }
      }
    }
  }
</style>
