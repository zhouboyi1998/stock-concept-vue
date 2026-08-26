<template>
    <div class="statistics">
        <h1 class="page-title">统计信息</h1>

        <!-- 加载中提示 -->
        <div v-if="loading" class="loading">
            加载统计数据中...
        </div>

        <!-- 统计内容 -->
        <div v-else>
            <!-- 概览统计 -->
            <StatCards :stats="overviewStats"/>

            <!-- 统计图表 -->
            <div class="charts-grid">
                <!-- 板块分布 -->
                <GroupChart :data="groupData"/>
                <!-- 地区分布 -->
                <RegionChart :data="regionData"/>
            </div>

            <!-- 热门概念 -->
            <TopConcepts :data="topConceptsData" :concepts="allConcepts"/>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { loadStocks, loadConcepts, loadGroups } from '../../utils/dataLoader'
import {
    calculateRegionStats,
    calculateGroupStats,
    calculateTopConcepts,
    calculateOverviewStats
} from '../../utils/statistics'
import StatCards from './StatCards.vue'
import RegionChart from './RegionChart.vue'
import GroupChart from './GroupChart.vue'
import TopConcepts from './TopConcepts.vue'

const loading = ref(true)
const regionData = ref([])
const groupData = ref([])
const topConceptsData = ref([])
const allConcepts = ref([])
const overviewStats = ref({})

onMounted(async () => {
    try {
        const [stocks, concepts, groups] = await Promise.all([
            loadStocks(),
            loadConcepts(),
            loadGroups()
        ])

        // 计算统计数据
        regionData.value = calculateRegionStats(stocks)
        groupData.value = calculateGroupStats(groups, concepts)
        topConceptsData.value = calculateTopConcepts(concepts, 10)
        allConcepts.value = concepts
        overviewStats.value = calculateOverviewStats(stocks, concepts, groups, regionData.value)
    } catch (error) {
        console.error('Error loading statistic data:', error)
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.statistics {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.page-title {
    color: #667eea;
    font-size: 32px;
    margin-bottom: 24px;
}

.loading {
    text-align: center;
    padding: 60px;
    color: #999;
    font-size: 18px;
}

.charts-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
}
</style>
