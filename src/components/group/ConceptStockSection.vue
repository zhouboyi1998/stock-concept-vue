<template>
    <div class="concept-stock-section">
        <!-- 概念标题行 -->
        <div class="concept-header">
            <div class="concept-title-wrapper" @click="goToConceptDetailHandler(conceptName)">
                <span class="concept-name">{{ conceptName }}</span>
                <span v-if="conceptPath" class="concept-path">{{ conceptPath }}</span>
                <span class="stock-count">（{{ stocks.length }}）</span>
            </div>
        </div>

        <!-- 简洁模式: 气泡显示股票名称 -->
        <div v-if="stocks.length > 0">
            <div v-if="displayMode === 'compact'" class="concept-stocks-compact">
                <span
                    v-for="stock in stocks"
                    :key="stock.name"
                    class="stock-tag"
                    @click="goToStockDetailHandler(stock.name, stock.codes && stock.codes.length > 0 ? stock.codes[0].code : null)"
                >
                    {{ stock.name }}
                </span>
            </div>

            <!-- 详情模式: 显示完整股票信息 -->
            <div v-else class="stock-list">
                <div
                    v-for="stock in stocks"
                    :key="stock.name"
                    class="stock-item"
                    @click="goToStockDetailHandler(stock.name, stock.codes && stock.codes.length > 0 ? stock.codes[0].code : null)"
                >
                    <div class="stock-header">
                        <span class="stock-name">{{ stock.name }}</span>
                        <div class="stock-codes">
                            <span
                                v-for="(codeObj, index) in (stock.codes || [])"
                                :key="index"
                                class="stock-code"
                            >
                                {{ codeObj.region }}:{{ codeObj.code }}
                            </span>
                        </div>
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
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { goToStockDetail, goToConceptDetail } from '../../utils/navigation'

const props = defineProps({
    conceptName: {
        type: String,
        required: true
    },
    conceptPath: {
        type: String,
        required: true
    },
    stocks: {
        type: Array,
        default: () => []
    },
    allStocks: {
        type: Array,
        default: () => []
    },
    displayMode: {
        type: String,
        default: 'compact' // 'compact' 或 'detailed'
    }
})

const router = useRouter()

// 跳转到概念详情
const goToConceptDetailHandler = (name) => {
    goToConceptDetail(router, name)
}

// 跳转到股票详情
const goToStockDetailHandler = (name, code) => {
    goToStockDetail(router, props.allStocks, name, code)
}
</script>

<style scoped>
.concept-stock-section {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
}

.concept-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f0f0f0;
}

.concept-title-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s;
    padding: 8px;
    margin: -8px;
    border-radius: 4px;
}

.concept-title-wrapper:hover {
    background: #f5f5ff;
}

.concept-name {
    font-size: 20px;
    font-weight: bold;
    color: #764ba2;
}

.concept-path {
    font-size: 14px;
    color: #4b5563;
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
}

.stock-count {
    font-size: 20px;
    font-weight: bold;
}

/* 简洁模式: 气泡显示股票 */
.concept-stocks-compact {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 0;
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
    margin-bottom: 12px;
}

.stock-name {
    font-size: 18px;
    font-weight: bold;
    color: #667eea;
}

.stock-codes {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
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

.reasons-divider {
    border-top: 1px dashed #e0e0e0;
    margin: 8px 0;
}
</style>
