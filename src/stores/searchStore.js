import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
    // 搜索关键词
    const searchKeyword = ref('')

    // 展开/收缩状态
    const expandedSections = ref({
        stocks: true,
        concepts: true,
        groups: {}
    })

    // 设置搜索关键词
    const setSearchKeyword = (keyword) => {
        searchKeyword.value = keyword
    }

    // 切换展开/收缩
    const toggleSection = (section, groupName = null) => {
        if (groupName) {
            // 板块分组
            expandedSections.value.groups[groupName] = !expandedSections.value.groups[groupName]
        } else {
            // 股票或概念
            expandedSections.value[section] = !expandedSections.value[section]
        }
    }

    // 重置展开状态为默认值
    const resetExpandedSections = () => {
        expandedSections.value = {
            stocks: true,
            concepts: true,
            groups: {}
        }
    }

    // 清空搜索状态
    const clearSearch = () => {
        searchKeyword.value = ''
        resetExpandedSections()
    }

    return {
        searchKeyword,
        expandedSections,
        setSearchKeyword,
        toggleSection,
        resetExpandedSections,
        clearSearch
    }
})
