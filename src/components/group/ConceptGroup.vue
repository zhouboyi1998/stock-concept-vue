<template>
    <div class="concept-group">
        <h1 class="page-title">概念分组</h1>

        <div v-if="groups.length > 0" class="tree-container">
            <RecursiveGroup
                v-for="group in groups"
                :key="group.name"
                :group="group"
                :depth="0"
            />
        </div>

        <div v-else class="loading">
            加载中...
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { loadGroups, loadConcepts } from '../../utils/dataLoader'
import RecursiveGroup from './RecursiveGroup.vue'

const groups = ref([])
const concepts = ref([])

// 排序函数: 有 sort 字段的按 sort 从小到大, 没有 sort 的放到后面
const sortBySortField = (items) => {
    if (!items || !Array.isArray(items)) return items

    return [...items].sort((a, b) => {
        const aHasSort = a.sort !== undefined && a.sort !== null
        const bHasSort = b.sort !== undefined && b.sort !== null

        // 如果两个都有 sort 字段, 按 sort 值排序
        if (aHasSort && bHasSort) {
            return a.sort - b.sort
        }

        // 如果只有 a 有 sort 字段, a 排在前面
        if (aHasSort && !bHasSort) {
            return -1
        }

        // 如果只有 b 有 sort 字段, b 排在前面
        if (!aHasSort && bHasSort) {
            return 1
        }

        // 如果都没有 sort 字段, 保持原顺序
        return 0
    })
}

// 递归排序分组数据
const sortGroupData = (group) => {
    const sorted = { ...group }

    // 排序概念列表 (字符串数组)
    if (sorted.concept && Array.isArray(sorted.concept)) {
        // 概念是字符串, 无法排序, 保持原顺序
        sorted.concept = [...sorted.concept]
    }

    // 排序子分组
    if (sorted.subgroup && Array.isArray(sorted.subgroup)) {
        sorted.subgroup = sortBySortField(sorted.subgroup).map(subgroup => sortGroupData(subgroup))
    }

    return sorted
}

// 加载数据
onMounted(async () => {
    const [groupsData, conceptsData] = await Promise.all([
        loadGroups(),
        loadConcepts()
    ])

    // 对分组数据进行排序
    const sortedGroups = sortBySortField(groupsData).map(group => sortGroupData(group))

    groups.value = sortedGroups
    concepts.value = conceptsData
})
</script>

<style scoped>
.concept-group {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.page-title {
    color: #764ba2;
    font-size: 32px;
    margin-bottom: 24px;
}

.tree-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.loading {
    text-align: center;
    padding: 60px;
    color: #999;
    font-size: 18px;
}
</style>
