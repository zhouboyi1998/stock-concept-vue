<template>
    <div class="chart-container">
        <h2 class="chart-title">热门概念</h2>
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
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        },
        formatter: (params) => {
            const item = params[0]
            return `${ item.name }<br/>股票数量: ${ item.value }`
        }
    },
    grid: {
        left: '3%',
        right: '6%',
        bottom: '3%',
        top: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'value',
        name: '股票数量',
        nameTextStyle: {
            fontSize: 12
        }
    },
    yAxis: {
        type: 'category',
        data: props.data.map(item => item.name).reverse(),
        axisLabel: {
            fontSize: 12,
            interval: 0
        }
    },
    series: [
        {
            name: '股票数量',
            type: 'bar',
            data: props.data.map(item => item.value).reverse(),
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#667eea' },
                    { offset: 1, color: '#764ba2' }
                ]),
                borderRadius: [0, 4, 4, 0]
            },
            emphasis: {
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#ffaa00' },
                        { offset: 1, color: '#ff6b6b' }
                    ])
                }
            },
            label: {
                show: true,
                position: 'right',
                fontSize: 11
            }
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
    height: 350px;
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
