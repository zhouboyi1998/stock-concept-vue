import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTabStore = defineStore('tabs', () => {
    // 标签页列表
    const tabs = ref([])
    // 当前激活的标签页 key
    const currentTabKey = ref('')
    // 每个标签页的滚动位置
    const scrollPositions = ref({})
    // 标签页排序方式: 'desc' - 最新的在顶部, 'asc' - 最新的在底部
    const tabSortOrder = ref('desc')

    return {
        tabs,
        currentTabKey,
        scrollPositions,
        tabSortOrder
    }
}, {
    // 持久化配置
    persist: {
        key: 'stock-concept-tabs',
        // 使用 LocalStorage 持久化
        storage: localStorage,
        // 需要持久化的字段
        paths: ['tabs', 'currentTabKey', 'scrollPositions', 'tabSortOrder']
    }
})
