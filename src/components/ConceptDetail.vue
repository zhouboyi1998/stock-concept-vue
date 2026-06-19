<template>
    <div class="concept-detail" v-if="concept">
        <!-- 概念基本信息 -->
        <div class="concept-info">
            <h1>{{ concept.name }}</h1>
            <div class="concept-description">{{ concept.description }}</div>

            <!-- 备注信息 -->
            <div v-if="concept.remarks && concept.remarks.length > 0" class="concept-remarks">
                <h3>备注</h3>
                <div class="remarks-list">
                    <div v-for="(remark, index) in concept.remarks" :key="index" class="remark-item">
                        {{ remark }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 关联股票列表 -->
        <div class="related-stocks">
            <h2>关联股票（{{ relatedStocks.length }}）</h2>
            <div class="stock-list">
                <div
                    v-for="stock in relatedStocks"
                    :key="stock.code"
                    class="stock-item"
                    @click="goToStockDetail(stock.code)"
                >
                    <div class="stock-header">
                        <span class="stock-name">{{ stock.name }}</span>
                        <span class="stock-code">{{ stock.code }}</span>
                    </div>
                    <div class="stock-reasons">
                        <!-- 概念JSON中的入选理由 -->
                        <div v-if="stock.conceptReasons && stock.conceptReasons.length > 0" class="concept-reasons-section">
                            <div v-for="(reason, index) in stock.conceptReasons" :key="index" class="reason-item concept-reason">
                                {{ reason }}
                            </div>
                        </div>

                        <!-- 虚线分隔 -->
                        <div v-if="stock.conceptReasons && stock.conceptReasons.length > 0 && stock.stockReasons && stock.stockReasons.length > 0" class="reasons-divider"></div>

                        <!-- 股票JSON中的入选理由 -->
                        <div v-if="stock.stockReasons && stock.stockReasons.length > 0" class="stock-reasons-section">
                            <div v-for="(reason, index) in stock.stockReasons" :key="index" class="reason-item stock-reason">
                                {{ reason }}
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="relatedStocks.length === 0" class="no-data">
                    暂无关联股票
                </div>
            </div>
        </div>

        <!-- 关联概念列表 -->
        <div v-if="relatedConcepts.length > 0" class="related-concepts-section">
            <h2>关联概念（{{ relatedConcepts.length }}）</h2>
            <div class="concept-list">
                <div
                    v-for="relatedConcept in relatedConcepts"
                    :key="relatedConcept.name"
                    class="concept-item-wrapper"
                >
                    <div class="concept-item" @click="goToRelatedConcept(relatedConcept.name)">
                        <span class="concept-name">{{ relatedConcept.name }}</span>
                        <span class="stock-count">{{ relatedConcept.stocks?.length || 0 }} 只股票</span>
                    </div>
                    <div v-if="relatedConcept.stocks && relatedConcept.stocks.length > 0" class="concept-stocks">
                        <span
                            v-for="stockItem in relatedConcept.stocks"
                            :key="stockItem.name"
                            class="stock-tag"
                            @click.stop="goToStockDetailByName(stockItem.name)"
                        >
                            {{ stockItem.name }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 加载中或错误提示 -->
    <div v-else class="loading">
        加载中...
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getConceptByName, getConceptStockDetails, getRelatedConcepts, loadConcepts, loadStocks } from '../utils/dataLoader'

const route = useRoute()
const router = useRouter()
const concept = ref(null)
const stocks = ref([])
const concepts = ref([])
const relatedStocks = ref([])
const relatedConcepts = ref([])

// 加载概念详情的函数
const loadConceptDetail = async (name) => {
    // 并行加载数据
    const [stocksData, conceptsData] = await Promise.all([
        loadStocks(),
        loadConcepts()
    ])

    stocks.value = stocksData
    concepts.value = conceptsData

    // 获取当前概念
    concept.value = getConceptByName(conceptsData, name)

    if (concept.value) {
        // 获取关联股票
        relatedStocks.value = getConceptStockDetails(conceptsData, stocksData, name)

        // 获取关联概念
        relatedConcepts.value = getRelatedConcepts(conceptsData, name)
    }
}

// 首次挂载时加载数据
onMounted(() => {
    const name = decodeURIComponent(route.params.name)
    loadConceptDetail(name)
})

// 监听路由参数变化, 重新加载数据
watch(
    () => route.params.name,
    (newName) => {
        if (newName) {
            const name = decodeURIComponent(newName)
            loadConceptDetail(name)
        }
    }
)

// 跳转到关联概念
const goToRelatedConcept = (name) => {
    router.push(`/concept/${ encodeURIComponent(name) }`)
}

// 根据股票代码获取股票名称
const getStockNameByCode = (code) => {
    const stock = stocks.value.find(s => s.code === code)
    return stock ? stock.name : code
}

// 根据股票名称跳转到股票详情
const goToStockDetailByName = (name) => {
    const stock = stocks.value.find(s => s.name === name)
    if (stock) {
        router.push(`/stock/${ stock.code }`)
    }
}

// 跳转到股票详情
const goToStockDetail = (code) => {
    router.push(`/stock/${ code }`)
}
</script>

<style scoped>
.concept-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.concept-info {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
}

.concept-info h1 {
    color: #764ba2;
    margin-bottom: 16px;
    font-size: 32px;
}

.concept-description {
    font-size: 16px;
    line-height: 1.8;
    margin-bottom: 16px;
}

.concept-remarks {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px dashed #e0e0e0;
}

.concept-remarks h3 {
    color: #333;
    font-size: 18px;
    margin-bottom: 12px;
}

.remarks-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.remark-item {
    font-size: 14px;
    line-height: 1.6;
    padding: 10px 12px;
    background: #f9f9f9;
    border-left: 3px solid #764ba2;
    border-radius: 4px;
}

.related-concepts-section {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
}

.related-concepts-section h2 {
    color: #333;
    margin-bottom: 16px;
    font-size: 24px;
}

.concept-list {
    display: grid;
    gap: 12px;
}

.concept-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.concept-item:hover {
    background: #e3f2fd;
    transform: translateX(4px);
}

.concept-item-wrapper {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.concept-stocks {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
    background: white;
    border-top: 1px dashed #e0e0e0;
}

.stock-tag {
    display: inline-block;
    padding: 4px 12px;
    background: #e8eaf6;
    color: #667eea;
    border-radius: 16px;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

.stock-tag:hover {
    background: #667eea;
    color: white;
}

.concept-name {
    font-size: 16px;
    font-weight: bold;
    color: #764ba2;
}

.stock-count {
    font-size: 14px;
    color: #667eea;
    background: #e8eaf6;
    padding: 4px 12px;
    border-radius: 16px;
    font-weight: bold;
}

.related-stocks {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 24px;
}

.related-stocks h2 {
    color: #333;
    margin-bottom: 16px;
    font-size: 24px;
}

.stock-list {
    display: grid;
    gap: 16px;
}

.stock-item {
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.stock-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #42b983;
}

.stock-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.stock-name {
    font-size: 18px;
    font-weight: bold;
    color: #667eea;
}

.stock-code {
    font-size: 14px;
    color: #667eea;
    background: #e8eaf6;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
}

.stock-reasons {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.concept-reasons-section,
.stock-reasons-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.reasons-divider {
    border-top: 1px dashed #e0e0e0;
    margin: 8px 0;
}

.reason-item {
    font-size: 14px;
    line-height: 1.6;
    padding-left: 12px;
    border-left: 3px solid #e0e0e0;
}

.concept-reason {
    border-left-color: #764ba2;
}

.stock-reason {
    border-left-color: #667eea;
}

.no-data {
    text-align: center;
    padding: 40px;
    color: #999;
    font-size: 16px;
}

.loading {
    text-align: center;
    padding: 60px;
    color: #999;
    font-size: 18px;
}
</style>
