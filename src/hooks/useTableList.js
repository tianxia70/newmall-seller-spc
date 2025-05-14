import { computed, onMounted, ref, onUnmounted } from 'vue'
import tool from '@/utils/tool'
import { debounce } from 'lodash-es'

/**
 * 表格列表 Hook
 * @param {Function} ajaxFn - 请求函数
 * @param {Object} params - 默认参数
 * @param {Boolean} immediate - 是否立即执行
 * @param {Number} debounceTime - 防抖时间(ms)
 * @returns {Object} 表格相关数据和方法
 */
export function useTableList(ajaxFn, params = {}, immediate = true, debounceTime = 300, extraFields = {}) {
  const tableRef = ref()
  const currentParams = ref() // 当前搜索项
  const pageNum = ref(1)
  const pageSize = ref(10)
  const pageTotal = ref(0)
  const tableLoading = ref(false)
  const paramsRef = ref()
  const tableData = ref([])
  const tableOtherData = ref(null)
  const otherInfo = ref(null)
  const error = ref(null)
  let controller = null

  if (params?.size) {
    pageSize.value = params.size
  }

  // 取消请求
  const cancelRequest = () => {
    if (controller) {
      controller.abort()
      controller = null
    }
  }

  // 合并参数
  const mergeParams = (arg) => {
    return {
      ...(params || {}),
      ...(paramsRef.value || {}),
      ...(arg || {}),
      pageSize: pageSize.value,
      pageNum: pageNum.value
    }
  }

  // 数据请求
  const getTableData = async (arg) => {
    try {
      // 取消之前的请求
      cancelRequest()
      
      // 创建新的 AbortController
      controller = new AbortController()
      tableLoading.value = true
      error.value = null

      if (arg) {
        pageNum.value = 1
        if (tool.getObjType(arg) === "object") {
          paramsRef.value = arg
        }
      }

      const argObj = mergeParams(arg)
      const res = await ajaxFn(argObj, { signal: controller.signal })

      const dataArr = res.pageList || []
      tableData.value = dataArr.map(item => ({
        ...item,
        ...extraFields
      }))
      pageTotal.value = res?.pageInfo?.totalElements || 0
      currentParams.value = argObj
    } catch (err) {
      error.value = err || 'error'
      tableData.value = []
      pageTotal.value = 0
    } finally {
      tableLoading.value = false
    }
  }

  // 使用防抖处理搜索
  const debouncedGetTableData = debounce(getTableData, debounceTime)

  // 分页参数
  const pageObj = computed({
    get() {
      return {
        total: pageTotal.value || 0,
        current: pageNum.value,
        pageSize: pageSize.value
      }
    },
    set() {}
  })

  // 分页改变
  const pageChange = (page) => {
    pageNum.value = page
    getTableData(false)
  }

  // 分页大小改变
  const pageSizeChange = (size) => {
    pageNum.value = 1
    pageSize.value = size
    getTableData(false)
  }

  // 重置搜索
  const searchReset = () => {
    paramsRef.value = {}
    getTableData({})
  }

  // 默认请求数据
  onMounted(() => {
    if (immediate) {
      getTableData(true)
    }
  })

  // 组件卸载时取消请求
  onUnmounted(() => {
    cancelRequest()
  })

  return {
    tableRef,
    currentParams,
    tableLoading,
    pageObj,
    tableData,
    tableOtherData,
    otherInfo,
    error,
    pageChange,
    pageSizeChange,
    searchReset,
    getTableData: debouncedGetTableData,
    cancelRequest
  }
}
