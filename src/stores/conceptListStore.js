import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConceptListStore = defineStore('conceptList', () => {
    // 概念列表搜索关键词
    const searchKeyword = ref('')

    // 设置搜索关键词
    const setSearchKeyword = (keyword) => {
        searchKeyword.value = keyword
    }

    // 清空搜索状态
    const clearSearch = () => {
        searchKeyword.value = ''
    }

    return {
        searchKeyword,
        setSearchKeyword,
        clearSearch
    }
})
