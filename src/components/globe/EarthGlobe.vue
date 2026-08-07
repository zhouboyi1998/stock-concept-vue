<template>
    <div class="earth-globe">
        <!-- 地球仪容器 -->
        <div ref="chartRef" class="globe-container"></div>
    </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { loadStocks } from '../../utils/dataLoader'
import regions from '../../data/support/regions.json'
import Globe from 'globe.gl'

const chartRef = ref(null)
const loading = ref(true)
let globeInstance = null

onMounted(async () => {
    try {
        // 加载股票数据
        const stocks = await loadStocks()

        // 计算每个地区的股票数量
        const regionStats = {}
        stocks.forEach(stock => {
            stock.codes?.forEach(codeObj => {
                const region = codeObj.region
                if (!regionStats[region]) {
                    regionStats[region] = 0
                }
                regionStats[region]++
            })
        })

        // 转换为 globe.gl 数据格式
        const pointsData = Object.entries(regionStats).map(([code, count]) => {
            const regionInfo = regions.find(r => r.code === code)
            return {
                name: regionInfo?.name || '',
                englishName: regionInfo?.englishName || '',
                code: code,
                latitude: regionInfo?.latitude || 0,
                longitude: regionInfo?.longitude || 0,
                stockCount: count
            }
        })

        // 找到最大值用于计算圆点大小
        const maxStockCount = Math.max(...Object.values(regionStats))

        // 等待 DOM 渲染完成
        await new Promise(resolve => setTimeout(resolve, 100))

        // 检查 DOM 元素是否存在
        if (!chartRef.value) {
            throw new Error('The chart container DOM element does not exist')
        }

        // 创建 globe.gl 实例
        globeInstance = Globe()
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg')
            .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
            .width(chartRef.value.clientWidth)
            .height(chartRef.value.clientHeight)
            .pointsData(pointsData)
            .pointLat('latitude')
            .pointLng('longitude')
            .pointColor(() => 'rgba(0, 0, 0, 0)')
            .pointAltitude(0)
            .pointRadius(d => 0.8 + (d.stockCount / maxStockCount) * 1.2 + 1.8) // 根据股票数量动态调整显示大小
            .pointResolution(64)
            // 悬停文本
            .pointLabel(d => `
                <div style="background: rgba(0, 0, 0, 0.8); color: #ffaa00; padding: 10px; border-radius: 5px; font-size: 13px; line-height: 1.6; z-index: 9999; position: relative;">
                    <div>中文：${ d.name }</div>
                    <div>英文：${ d.englishName }</div>
                    <div>代码：${ d.code }</div>
                    <div>股票：${ d.stockCount }</div>
                </div>
            `)
            .onPointHover((point, prevPoint) => {
                if (point) {
                    // 鼠标悬停时停止自动旋转
                    globeInstance.controls().autoRotate = false
                    // 隐藏所有 HTML 标签, 避免遮挡信息框
                    const labels = document.querySelectorAll('.globe-label')
                    labels.forEach(label => {
                        label.style.opacity = '0.3'
                    })
                } else {
                    // 鼠标移开时恢复自动旋转
                    globeInstance.controls().autoRotate = true
                    // 恢复所有 HTML 标签的显示
                    const labels = document.querySelectorAll('.globe-label')
                    labels.forEach(label => {
                        label.style.opacity = '1'
                    })
                }
            })
            .htmlElementsData(pointsData)
            .htmlLat('latitude')
            .htmlLng('longitude')
            .htmlElement(d => {
                const el = document.createElement('div')
                el.innerHTML = `${ d.name }: ${ d.stockCount }`
                el.className = 'globe-label'
                // 根据股票数量动态调整字体大小
                const minFontSize = 12 // 最小字体
                const maxFontSize = 20 // 最大字体
                const fontSize = minFontSize + (d.stockCount / maxStockCount) * (maxFontSize - minFontSize)
                el.style.color = '#ffaa00' // 字体颜色
                el.style.fontSize = `${ fontSize }px`
                el.style.fontFamily = '"Microsoft YaHei", "微软雅黑", sans-serif'
                el.style.whiteSpace = 'nowrap'
                el.style.pointerEvents = 'none'
                el.style.textShadow = '0 0 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)'
                return el
            })
            (chartRef.value)

        // 自动旋转
        globeInstance.controls().autoRotate = true
        globeInstance.controls().autoRotateSpeed = 2

        // 设置相机初始位置, 以中国为中心
        globeInstance.pointOfView({ lat: 35.8617, lng: 104.1954, altitude: 1.7 })

    } catch (error) {
        console.error('Error loading globe:', error)
    } finally {
        loading.value = false
    }
})

onBeforeUnmount(() => {
    if (globeInstance && chartRef.value) {
        while (chartRef.value.firstChild) {
            chartRef.value.removeChild(chartRef.value.firstChild)
        }
    }
})
</script>

<style scoped>
.earth-globe {
    width: 100%;
    height: calc(100vh - 70px);
    position: relative;
    overflow: hidden;
}

/* 强制 globe.gl 的 canvas 居中 */
.earth-globe :deep(canvas) {
    display: block !important;
    margin: auto !important;
}

.page-title {
    position: absolute;
    top: 20px;
    left: 30px;
    color: white;
    font-size: 28px;
    z-index: 10;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    margin: 0;
}

.globe-container {
    width: 100%;
    height: 100%;
    display: block !important;
}
</style>
