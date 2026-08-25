<template>
    <div class="search-page">
        <!-- 搜索框区域 -->
        <div class="search-header">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索股票、概念、板块..."
                class="search-input"
                size="large"
                clearable
                @input="handleSearch"
            >
                <template #prefix>
                    <el-icon>
                        <Search/>
                    </el-icon>
                </template>
            </el-input>
        </div>

        <!-- 搜索结果区域 -->
        <div v-if="searchKeyword && (stockResults.length > 0 || conceptResults.length > 0 || groupResults.length > 0)" class="search-results">
            <!-- 股票结果 -->
            <div v-if="stockResults.length > 0" class="result-section stock-result">
                <h3 class="section-title" @click="toggleSection('stocks')">
                    <el-icon>
                        <TrendCharts/>
                    </el-icon>
                    <span class="title-text">股票（{{ stockResults.length }}）</span>
                    <el-icon class="toggle-icon">
                        <CaretTop v-if="expandedSections.stocks"/>
                        <CaretBottom v-else/>
                    </el-icon>
                </h3>
                <div v-show="expandedSections.stocks" class="result-list">
                    <div
                        v-for="stock in stockResults"
                        :key="`${stock.name}-${(stock.codes || []).map(c => `${c.region}:${c.code}`).join('-')}`"
                        class="result-item"
                        @click="goToStockDetailHandler(stock)"
                    >
                        <div class="item-info">
                            <span class="item-name">{{ stock.name }}</span>
                            <div class="item-codes">
                                <span
                                    v-for="(codeObj, index) in (stock.codes || [])"
                                    :key="index"
                                    class="item-code"
                                >
                                    {{ codeObj.region }}:{{ codeObj.code }}
                                </span>
                            </div>
                        </div>
                        <el-icon class="item-arrow">
                            <ArrowRight/>
                        </el-icon>
                    </div>
                </div>
            </div>

            <!-- 概念结果 -->
            <div v-if="conceptResults.length > 0" class="result-section concept-result">
                <h3 class="section-title" @click="toggleSection('concepts')">
                    <el-icon>
                        <Collection/>
                    </el-icon>
                    <span class="title-text">概念（{{ conceptResults.length }}）</span>
                    <el-icon class="toggle-icon">
                        <CaretTop v-if="expandedSections.concepts"/>
                        <CaretBottom v-else/>
                    </el-icon>
                </h3>
                <div v-show="expandedSections.concepts" class="result-list">
                    <div
                        v-for="concept in conceptResults"
                        :key="concept.name"
                        class="result-item"
                        @click="goToConceptDetailHandler(concept)"
                    >
                        <div class="item-info">
                            <span class="item-name">{{ concept.name }}</span>
                            <span class="item-count">{{ concept.stocks?.length || 0 }} 只股票</span>
                        </div>
                        <el-icon class="item-arrow">
                            <ArrowRight/>
                        </el-icon>
                    </div>
                </div>
            </div>

            <!-- 板块结果 -->
            <div v-for="group in groupResults" :key="group.groupName" class="result-section group-result">
                <h3 class="section-title" @click="toggleSection('groups', group.groupName)">
                    <el-icon>
                        <FolderOpened/>
                    </el-icon>
                    <span class="title-text">{{ group.groupName }}（{{ group.concepts.length }}）</span>
                    <el-icon class="toggle-icon">
                        <CaretTop v-if="expandedSections.groups[group.groupName] !== false"/>
                        <CaretBottom v-else/>
                    </el-icon>
                </h3>
                <div v-show="expandedSections.groups[group.groupName] !== false" class="result-list">
                    <div
                        v-for="concept in group.concepts"
                        :key="concept.name"
                        :class="['result-item', { 'disabled': !isConceptExists(concept.name) }]"
                        @click="isConceptExists(concept.name) && goToConceptDetailHandler(concept)"
                    >
                        <div class="item-info">
                            <span class="item-name">{{ concept.name }}</span>
                            <span class="item-path">{{ concept.path }}</span>
                        </div>
                        <el-icon v-if="isConceptExists(concept.name)" class="item-arrow">
                            <ArrowRight/>
                        </el-icon>
                    </div>
                </div>
            </div>
        </div>

        <!-- 无结果提示 -->
        <div v-if="searchKeyword && stockResults.length === 0 && conceptResults.length === 0 && groupResults.length === 0" class="no-results">
            <el-empty description="未找到相关结果"/>
        </div>

        <!-- 初始提示 -->
        <div v-if="!searchKeyword" class="search-hint">
            <p>大鹏一日同风起，扶摇直上九万里。</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, TrendCharts, Collection, ArrowRight, FolderOpened, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { loadStocks, loadConcepts, loadGroups, searchStocks, searchConcepts, searchGroups } from '../../utils/dataLoader'
import { ElMessage } from 'element-plus'
import { useSearchStore } from '../../stores/searchStore'
import { goToStockDetail, goToConceptDetail } from '../../utils/navigation'

const router = useRouter()
const searchStore = useSearchStore()

// 从 store 中获取状态
const searchKeyword = computed({
    get: () => searchStore.searchKeyword,
    set: (value) => searchStore.setSearchKeyword(value)
})

const expandedSections = computed({
    get: () => searchStore.expandedSections,
    set: (value) => {
        // 直接替换整个对象
        Object.keys(searchStore.expandedSections).forEach(key => {
            delete searchStore.expandedSections[key]
        })
        Object.assign(searchStore.expandedSections, value)
    }
})

const allStocks = ref([])
const allConcepts = ref([])
const allGroups = ref([])
const isLoading = ref(false)
const conceptNames = ref(new Set()) // 存储所有存在的概念名称集合

// 加载数据
const loadData = async () => {
    if (allStocks.value.length > 0 && allConcepts.value.length > 0 && allGroups.value.length > 0) {
        return // 已加载过, 直接返回
    }

    isLoading.value = true
    try {
        const [stocks, concepts, groups] = await Promise.all([
            loadStocks(),
            loadConcepts(),
            loadGroups()
        ])
        allStocks.value = stocks
        allConcepts.value = concepts
        allGroups.value = groups

        // 将所有概念名称存入 Set, 用于快速查找
        conceptNames.value = new Set(concepts.map(concept => concept.name))
    } catch (error) {
        console.error('Failed to load data:', error)
        ElMessage.error('加载数据失败')
    } finally {
        isLoading.value = false
    }
}

// 处理搜索
const handleSearch = async () => {
    if (!searchKeyword.value.trim()) {
        stockResults.value = []
        conceptResults.value = []
        groupResults.value = []
        return
    }

    await loadData()

    // 使用现有的搜索函数
    stockResults.value = searchStocks(allStocks.value, searchKeyword.value)
    conceptResults.value = searchConcepts(allConcepts.value, searchKeyword.value)
    groupResults.value = searchGroups(allGroups.value, searchKeyword.value)

    // 重置展开状态为默认值
    searchStore.resetExpandedSections()
}

// 搜索结果
const stockResults = ref([])
const conceptResults = ref([])
const groupResults = ref([])

// 跳转到股票详情
const goToStockDetailHandler = (stock) => {
    goToStockDetail(router, allStocks.value, stock.name, stock.codes && stock.codes.length > 0 ? stock.codes[0].code : null)
}

// 跳转到概念详情
const goToConceptDetailHandler = (concept) => {
    goToConceptDetail(router, concept.name)
}

// 判断概念是否存在
const isConceptExists = (conceptName) => {
    return conceptNames.value.has(conceptName)
}

// 切换展开/收缩
const toggleSection = (section, groupName = null) => {
    searchStore.toggleSection(section, groupName)
}

// 组件挂载时, 如果有搜索关键词, 重新执行搜索
onMounted(async () => {
    if (searchKeyword.value.trim()) {
        await loadData()
        stockResults.value = searchStocks(allStocks.value, searchKeyword.value)
        conceptResults.value = searchConcepts(allConcepts.value, searchKeyword.value)
        groupResults.value = searchGroups(allGroups.value, searchKeyword.value)
    }
})
</script>

<style scoped>
.search-page {
    min-height: calc(100vh - 70px);
    background: #f5f7fa;
    padding: 40px 20px;
}

/* 搜索框区域 */
.search-header {
    max-width: 800px;
    margin: 0 auto 40px;
}

.search-input {
    width: 100%;
}

.search-input :deep(.el-input__wrapper) {
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 12px 16px;
}

.search-input :deep(.el-input__inner) {
    font-size: 16px;
}

/* 初始提示 */
.search-hint {
    text-align: center;
    color: #999;
    font-size: 16px;
    margin-top: 200px;
}

/* 搜索结果区域 */
.search-results {
    max-width: 800px;
    margin: 0 auto;
}

.result-section {
    margin-bottom: 30px;
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.2s;
}

.section-title:hover {
    opacity: 0.8;
}

.section-title .el-icon {
    font-size: 20px;
    color: #667eea;
}

.title-text {
    flex: 1;
}

.toggle-icon {
    font-size: 20px;
    color: #999;
    transition: transform 0.2s;
}

.result-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background: #fafafa;
}

.result-item:hover {
    background: #f0f0f0;
    transform: translateX(4px);
}

/* 概念不存在时的禁用样式 */
.result-item.disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.result-item.disabled:hover {
    background: #fafafa;
    transform: none;
}

.result-item.disabled .item-name {
    color: #999 !important;
}

.item-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.item-codes {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.item-name {
    font-size: 15px;
    font-weight: bold;
}

/* 股票名称颜色 */
.stock-result .item-name {
    color: #667eea;
}

/* 概念名称颜色 */
.concept-result .item-name,
.group-section .item-name {
    color: #764ba2;
}

.item-code {
    font-size: 14px;
    color: #4b5563;
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
}

.item-count {
    font-size: 14px;
    color: #4b5563;
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
}

.item-path {
    font-size: 14px;
    color: #4b5563;
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
}

.item-arrow {
    color: #ccc;
    font-size: 16px;
}

.result-item:hover .item-arrow {
    color: #667eea;
}

/* 无结果 */
.no-results {
    max-width: 800px;
    margin: 100px auto 0;
}
</style>
