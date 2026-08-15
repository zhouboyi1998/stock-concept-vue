<template>
    <div class="chart-container">
        <h2 class="chart-title">板块分布</h2>
        <v-chart class="chart" :option="chartOption" autoresize/>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import * as echarts from 'echarts'

const props = defineProps({
    data: {
        type: Array,
        required: true
    }
})

const chartOption = computed(() => ({
    tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
    },
    legend: {
        orient: 'vertical',
        left: '60%',
        top: 'center',
        textStyle: {
            fontSize: 12
        }
    },
    series: [
        {
            name: '股票数量',
            type: 'pie',
            radius: ['40%', '75%'],
            center: ['37%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 8,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: true,
                formatter: '{b}\n{c}',
                fontSize: 12
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            },
            data: props.data,
            color: [
                '#667eea',
                '#764ba2',
                '#f093fb',
                '#f5576c',
                '#4facfe',
                '#00f2fe',
                '#43e97b',
                '#fa709a',
                '#fee140',
                '#30cfd0',
                '#ff6b6b',
                '#a8edea',
                '#fed6e3',
                '#d299c2',
                '#fef9d7'
            ]
        }
    ]
}))
</script>

<style scoped>
.chart-container {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    height: 400px;
}

.chart-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 16px;
}

.chart {
    height: calc(100% - 40px);
}
</style>
