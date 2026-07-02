import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTabStore = defineStore('tabs', () => {
    // 标签页列表
    const tabs = ref([])
    // 当前激活的标签页 key
    const currentTabKey = ref('')
    // 每个标签页的滚动位置
    const scrollPositions = ref({})

    return {
        tabs,
        currentTabKey,
        scrollPositions
    }
}, {
    // 持久化配置
    persist: {
        key: 'stock-concept-tabs',
        // 使用 LocalStorage 持久化
        storage: localStorage,
        // 需要持久化的字段
        paths: ['tabs', 'currentTabKey', 'scrollPositions']
    }
})
