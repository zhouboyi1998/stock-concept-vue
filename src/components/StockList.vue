<template>
    <div class="stock-list">
        <h1>股票列表</h1>

        <!-- 搜索框 -->
        <div class="search-box">
            <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索股票名称、代码或拼音首字母..."
                @input="handleSearch"
            />
        </div>

        <!-- 股票列表 -->
        <div class="stock-items">
            <div
                v-for="stock in filteredStocks"
                :key="stock.code"
                class="stock-item"
                @click="goToStockDetail(stock.code)"
            >
                <div class="stock-header">
                    <span class="stock-name">{{ stock.name }}</span>
                    <span class="stock-code">{{ stock.code }}</span>
                </div>
                <div class="stock-description">
                    {{ stock.description }}
                </div>
                <div class="stock-concepts">
          <span
              v-for="concept in stock.concepts"
              :key="concept.name"
              class="concept-tag"
              @click.stop="goToConceptDetail(concept.name)"
          >
            {{ concept.name }}
          </span>
                </div>
            </div>

            <!-- 无结果提示 -->
            <div v-if="filteredStocks.length === 0" class="no-result">
                未找到匹配的股票
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loadStocks, searchStocks } from '../utils/dataLoader'

const router = useRouter()
const stocks = ref([])
const searchKeyword = ref('')
const filteredStocks = ref([])

// 加载股票数据
onMounted(async () => {
    const data = await loadStocks()
    stocks.value = data
    filteredStocks.value = data
})

// 处理搜索
const handleSearch = () => {
    filteredStocks.value = searchStocks(stocks.value, searchKeyword.value)
}

// 跳转到股票详情页
const goToStockDetail = (code) => {
    router.push(`/stock/${ code }`)
}

// 跳转到概念详情页
const goToConceptDetail = (conceptName) => {
    router.push(`/concept/${ encodeURIComponent(conceptName) }`)
}
</script>

<style scoped>
.stock-list {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    color: #333;
    margin-bottom: 20px;
}

.search-box {
    margin-bottom: 20px;
}

.search-box input {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border: 2px solid #ddd;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.3s;
}

.search-box input:focus {
    border-color: #42b983;
}

.stock-items {
    display: grid;
    gap: 16px;
}

.stock-item {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s;
}

.stock-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    border-color: #42b983;
}

.stock-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
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

.stock-description {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px dashed #e0e0e0;
}

.stock-concepts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.concept-tag {
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

.concept-tag:hover {
    background: #667eea;
    color: white;
}

.no-result {
    text-align: center;
    padding: 40px;
    color: #999;
    font-size: 16px;
}
</style>
