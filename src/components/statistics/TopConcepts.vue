<template>
    <div class="chart-container">
        <h2 class="chart-title">热门概念</h2>
        <v-chart class="chart" :option="chartOption" autoresize/>

        <!-- 查看所有概念按钮 -->
        <button class="view-all-btn" @click="openModal">
            查看所有概念
        </button>
    </div>

    <!-- 查看所有概念弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">概念统计</h3>
                <el-button type="danger" circle :icon="CloseBold" class="modal-close" @click="closeModal"/>
            </div>
            <div class="modal-body">
                <v-chart class="modal-chart" :option="modalChartOption" autoresize/>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import * as echarts from 'echarts'
import { calculateTopConcepts } from '../../utils/statistics'
import { ElButton, ElIcon } from 'element-plus'
import { CloseBold } from '@element-plus/icons-vue'

const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    concepts: {
        type: Array,
        default: () => []
    }
})

const showModal = ref(false)
const allConceptsData = ref([])

// 打开弹窗时计算所有概念数据 (懒加载)
const openModal = () => {
    // 使用 -1 表示获取所有概念
    allConceptsData.value = calculateTopConcepts(props.concepts, -1)
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    allConceptsData.value = []
}

// 弹窗中的图表配置
const modalChartOption = computed(() => {
    // 如果没有数据, 返回空配置
    if (!allConceptsData.value || allConceptsData.value.length === 0) {
        return {}
    }

    // 计算固定的 X 轴最大值 (所有概念中最大值的往上取整)
    const maxValue = Math.ceil(allConceptsData.value[0].value / 10) * 10

    // 计算初始显示范围 (显示前20个)
    const visibleCount = Math.min(20, allConceptsData.value.length)
    const startPercent = 0
    const endPercent = (visibleCount / allConceptsData.value.length) * 100

    return {
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
            left: '15%',
            right: '6%',
            bottom: '3%',
            top: '3%',
            containLabel: false
        },
        dataZoom: [
            {
                type: 'slider',
                yAxisIndex: 0,
                width: 20,
                right: 10,
                start: startPercent,
                end: endPercent,
                zoomLock: true,
                brushSelect: false
            },
            {
                type: 'inside',
                yAxisIndex: 0,
                start: startPercent,
                end: endPercent,
                zoomOnMouseWheel: false,
                moveOnMouseMove: true,
                moveOnMouseWheel: true
            }
        ],
        xAxis: {
            type: 'value',
            name: '股票数量',
            max: maxValue,
            nameTextStyle: {
                fontSize: 12
            }
        },
        yAxis: {
            type: 'category',
            data: allConceptsData.value.map(item => item.name),
            inverse: true,
            axisLabel: {
                fontSize: 12,
                interval: 0,
                width: 150
            }
        },
        series: [
            {
                name: '股票数量',
                type: 'bar',
                data: allConceptsData.value.map(item => item.value),
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
    position: relative;
}

.chart-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 16px;
}

.chart {
    height: calc(100% - 90px);
}

/* 查看全部按钮 */
.view-all-btn {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    z-index: 10;
}

.view-all-btn:hover {
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.view-all-btn:active {
    transform: translateX(-50%) translateY(0);
}

/* 弹窗遮罩 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* 弹窗内容 */
.modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 1200px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* 弹窗头部 */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #eee;
}

.modal-title {
    font-size: 20px;
    font-weight: bold;
    color: #667eea;
    margin: 0;
}

.modal-close {
    margin-right: 3px;
}

/* 弹窗主体 */
.modal-body {
    padding: 20px 24px;
    flex: 1;
    min-height: 400px;
}

/* 弹窗中的图表 */
.modal-chart {
    width: 100%;
    height: 100%;
    min-height: 400px;
}
</style>
