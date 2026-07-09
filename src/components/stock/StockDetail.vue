<template>
    <div class="stock-detail" v-if="stock">
        <!-- 股票基本信息 -->
        <div class="stock-info">
            <h1>{{ stock.name }}</h1>
            <div class="stock-codes">
                <span
                    v-for="(codeObj, index) in (stock.codes || [])"
                    :key="index"
                    class="stock-code"
                >
                    {{ codeObj.region }}:{{ codeObj.code }}
                </span>
            </div>
            <div class="stock-description">{{ stock.description }}</div>

            <!-- 备注信息 -->
            <div v-if="stock.remarks && stock.remarks.length > 0" class="stock-remarks">
                <h3>备注</h3>
                <div class="remarks-list">
                    <div v-for="(remark, index) in stock.remarks" :key="index" class="remark-item">
                        {{ remark }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 关联概念 -->
        <div class="related-concepts">
            <h2>关联概念（{{ stock.concepts?.length || 0 }}）</h2>
            <div class="concept-list">
                <div
                    v-for="concept in stock.concepts"
                    :key="concept.name"
                    class="concept-item"
                    @click="goToConceptDetail(concept.name)"
                >
                    <div class="concept-header">
                        <span class="concept-name">{{ concept.name }}</span>
                    </div>
                    <div class="concept-reasons">
                        <div v-for="(reason, index) in concept.reasons" :key="index" class="reason-item">
                            {{ reason }}
                        </div>
                    </div>
                </div>

                <div v-if="!stock.concepts || stock.concepts.length === 0" class="no-data">
                    暂无关联概念
                </div>
            </div>
        </div>

        <!-- 关联股票 -->
        <div v-if="stock.related && stock.related.length > 0" class="stock-related-section">
            <h2>关联股票（{{ stock.related.length }}）</h2>
            <div class="related-list">
                <div v-for="(item, index) in stock.related" :key="index" class="related-item">
                    <span class="related-name" @click="goToStockDetailByName(item.name)">{{ item.name }}</span>
                    <span class="related-relation">{{ item.relation }}</span>
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
import { getStockByName, loadStocks } from '../../utils/dataLoader'

// 组件名称，用于 keep-alive 缓存
const __name = 'StockDetail'

const route = useRoute()
const router = useRouter()
const stock = ref(null)

// 加载股票详情的函数
const loadStockDetail = async (name) => {
    const stocks = await loadStocks()
    stock.value = getStockByName(stocks, name)
}

// 首次挂载时加载数据
onMounted(() => {
    const name = decodeURIComponent(route.params.name)
    loadStockDetail(name)
})

// 监听路由参数变化, 重新加载数据
watch(
    () => route.params.name,
    (newName) => {
        if (newName) {
            const name = decodeURIComponent(newName)
            loadStockDetail(name)
        }
    }
)

// 跳转到概念详情页
const goToConceptDetail = (conceptName) => {
    router.push(`/concept/${ encodeURIComponent(conceptName) }`)
}

// 根据股票名称跳转到股票详情
const goToStockDetailByName = (name) => {
    router.push(`/stock/${ encodeURIComponent(name) }`)
}
</script>

<style scoped>
.stock-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.stock-info {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
}

.stock-info h1 {
    color: #667eea;
    margin-bottom: 12px;
    font-size: 32px;
}

.stock-code {
    display: inline-block;
    font-size: 18px;
    color: #667eea;
    background: #e8eaf6;
    padding: 8px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-weight: bold;
}

.stock-codes {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}

.stock-description {
    font-size: 16px;
    line-height: 1.8;
}

.stock-remarks {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px dashed #e0e0e0;
}

.stock-remarks h3 {
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
    border-left: 3px solid #667eea;
    border-radius: 4px;
}

.related-concepts {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
}

.related-concepts h2 {
    color: #333;
    margin-bottom: 16px;
    font-size: 24px;
}

.stock-related-section {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 24px;
}

.stock-related-section h2 {
    color: #333;
    margin-bottom: 16px;
    font-size: 24px;
}

.related-list {
    display: grid;
    gap: 12px;
}

.related-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s;
}

.related-item:hover {
    background: #e8eaf6;
    transform: translateX(4px);
}

.related-name {
    color: #667eea;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

.related-name:hover {
    color: #764ba2;
    text-decoration: underline;
}

.related-relation {
    color: #333;
}

.concept-list {
    display: grid;
    gap: 16px;
}

.concept-item {
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.concept-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #42b983;
}

.concept-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.concept-name {
    font-size: 18px;
    font-weight: bold;
    color: #764ba2;
}

.concept-reasons {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.reason-item {
    font-size: 14px;
    line-height: 1.6;
    padding-left: 12px;
    border-left: 3px solid #e0e0e0;
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
