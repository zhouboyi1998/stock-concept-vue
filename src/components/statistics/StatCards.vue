<template>
    <div class="stat-cards">
        <div class="stat-card" v-for="(value, key) in stats" :key="key">
            <div class="stat-icon">
                <!-- 股票数量 -->
                <span v-if="key === 'totalStocks'">📊</span>
                <!-- 概念数量 -->
                <span v-else-if="key === 'totalConcepts'">💡</span>
                <!-- 板块数量 -->
                <span v-else-if="key === 'totalGroups'">📁</span>
                <!-- 地区数量 -->
                <span v-else-if="key === 'totalRegions'">🌍</span>
            </div>
            <div class="stat-content">
                <div class="stat-value">{{ value }}</div>
                <div class="stat-label">{{ getLabel(key) }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    stats: {
        type: Object,
        required: true
    }
})

const getLabel = (key) => {
    const labels = {
        totalStocks: '股票数量',
        totalConcepts: '概念数量',
        totalGroups: '板块数量',
        totalRegions: '覆盖地区'
    }
    return labels[key] || key
}
</script>

<style scoped>
.stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.stat-icon {
    font-size: 32px;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
}

.stat-content {
    flex: 1;
}

.stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #667eea;
    line-height: 1;
    margin-bottom: 6px;
}

.stat-label {
    font-size: 14px;
    color: #666;
}
</style>
