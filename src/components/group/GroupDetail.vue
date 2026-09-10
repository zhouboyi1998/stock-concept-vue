<template>
    <div class="group-detail" v-if="groupData">
        <!-- 板块基本信息 -->
        <div class="group-info">
            <div class="group-header">
                <h1>{{ groupData.name }}</h1>
                <button @click="toggleDisplayMode" class="mode-toggle-btn">
                    {{ displayMode === 'compact' ? '简洁模式' : '详情模式' }}
                </button>
            </div>
        </div>

        <!-- 主内容区: 左侧导航 + 右侧内容 -->
        <div class="detail-content">
            <!-- 左侧导航目录 -->
            <div class="nav-sidebar">
                <div class="nav-title">概念目录</div>
                <div class="nav-list">
                    <div
                        v-for="(conceptInfo, index) in allConcepts"
                        :key="conceptInfo.name"
                        :class="['nav-item', { active: activeIndex === index }]"
                        @click="scrollToConcept(index)"
                    >
                        {{ conceptInfo.name }}
                    </div>
                </div>
            </div>

            <!-- 右侧内容区 -->
            <div class="content-area">
                <!-- 递归遍历板块下的所有概念 -->
                <ConceptStockSection
                    v-for="(conceptInfo, index) in allConcepts"
                    :key="conceptInfo.name"
                    :ref="el => setConceptRef(el, index)"
                    :concept-name="conceptInfo.name"
                    :concept-path="conceptInfo.path"
                    :stocks="conceptInfo.stocks"
                    :all-stocks="allStocks"
                    :all-concepts="allConceptsData"
                    :display-mode="displayMode"
                />
            </div>
        </div>
    </div>

    <!-- 加载中或错误提示 -->
    <div v-else class="loading">
        加载中...
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { loadGroups, loadConcepts, loadStocks, getConceptStockDetails } from '../../utils/dataLoader'
import ConceptStockSection from './ConceptStockSection.vue'

// 组件名称, 用于 keep-alive 缓存
const __name = 'GroupDetail'

const route = useRoute()
const groupData = ref(null)
const allConcepts = ref([]) // 板块下所有概念的扁平化列表
const allStocks = ref([])
const allConceptsData = ref([])
const displayMode = ref('compact') // 'compact' 简洁模式 (默认), 'detailed' 详情模式
const conceptRefs = ref([]) // 存储概念组件的引用
const activeIndex = ref(0) // 当前激活的概念索引

// 递归提取板块下所有概念 (深度优先)
const extractConcepts = (group, parentPath = '') => {
    const concepts = []
    const currentPath = parentPath ? `${ parentPath } / ${ group.name }` : group.name

    // 添加当前层级的概念
    if (group.concept && group.concept.length > 0) {
        group.concept.forEach(conceptName => {
            concepts.push({
                name: conceptName,
                path: currentPath,
                stocks: [] // 稍后填充
            })

            // 查找是否有与当前概念同名的子分组
            const matchingSubgroup = group.subgroup?.find(sub => sub.name === conceptName)
            if (matchingSubgroup) {
                // 递归处理该子分组下的所有概念
                concepts.push(...extractConcepts(matchingSubgroup, currentPath))
            }
        })
    }

    // 处理没有对应概念的纯子分组 (只有 subgroup 没有 concept 的情况)
    if (group.subgroup && group.subgroup.length > 0) {
        group.subgroup.forEach(subgroup => {
            // 检查这个子分组是否已经被上面的逻辑处理过
            const alreadyProcessed = group.concept?.some(conceptName => conceptName === subgroup.name)
            if (!alreadyProcessed) {
                concepts.push(...extractConcepts(subgroup, currentPath))
            }
        })
    }

    return concepts
}

// 切换显示模式
const toggleDisplayMode = () => {
    displayMode.value = displayMode.value === 'compact' ? 'detailed' : 'compact'
}

// 设置概念组件引用
const setConceptRef = (el, index) => {
    if (el) {
        conceptRefs.value[index] = el
    }
}

// 滚动到指定概念
const scrollToConcept = (index) => {
    const element = conceptRefs.value[index]?.$el
    if (element) {
        // 查找概念标题元素
        const headerElement = element.querySelector('.concept-header')
        const targetElement = headerElement || element

        // 获取 Element Plus 滚动容器
        const scrollbarWrap = document.querySelector('.content-scrollbar .el-scrollbar__wrap')
        if (scrollbarWrap) {
            // 计算目标元素相对于滚动容器的位置
            const containerRect = scrollbarWrap.getBoundingClientRect()
            const elementRect = targetElement.getBoundingClientRect()

            // 计算需要滚动的位置 (考虑当前滚动位置)
            const scrollTop = scrollbarWrap.scrollTop + elementRect.top - containerRect.top - 30

            scrollbarWrap.scrollTo({
                top: scrollTop,
                behavior: 'auto'
            })

            // 更新激活索引
            activeIndex.value = index
        }
    }
}

// 监听滚动, 更新激活的概念索引
const handleScroll = () => {
    const scrollbarWrap = document.querySelector('.content-scrollbar .el-scrollbar__wrap')
    if (!scrollbarWrap || conceptRefs.value.length === 0) return

    const scrollTop = scrollbarWrap.scrollTop
    const containerTop = scrollbarWrap.getBoundingClientRect().top

    // 找到当前视口中最靠上的概念
    let currentIndex = 0
    let minDistance = Infinity

    conceptRefs.value.forEach((ref, index) => {
        if (!ref || !ref.$el) return

        const headerElement = ref.$el.querySelector('.concept-header')
        const targetElement = headerElement || ref.$el
        const rect = targetElement.getBoundingClientRect()

        // 计算元素顶部距离视口顶部的距离
        const distance = rect.top - containerTop

        // 如果元素在视口内或接近视口顶部, 且距离最小
        if (distance >= -100 && distance < minDistance) {
            minDistance = distance
            currentIndex = index
        }
    })

    activeIndex.value = currentIndex

    // 滚动左侧导航栏, 让激活项保持在中间位置
    scrollToActiveNavItem(currentIndex)
}

// 滚动左侧导航栏到激活项
const scrollToActiveNavItem = (index) => {
    const navList = document.querySelector('.nav-list')
    if (!navList) return

    const navItems = navList.querySelectorAll('.nav-item')
    const activeItem = navItems[index]

    if (!activeItem) return

    // 计算激活项应该滚动到的位置 (居中显示)
    const itemTop = activeItem.offsetTop
    const itemHeight = activeItem.offsetHeight
    const containerHeight = navList.clientHeight

    // 目标滚动位置: 让激活项在容器中间
    const targetScrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2)

    navList.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'auto'
    })
}

// 组件卸载时移除监听
onUnmounted(() => {
    const scrollbarWrap = document.querySelector('.content-scrollbar .el-scrollbar__wrap')
    if (scrollbarWrap) {
        scrollbarWrap.removeEventListener('scroll', handleScroll)
    }
})

// 加载数据
onMounted(async () => {
    const groupName = decodeURIComponent(route.params.name)

    const [groupsData, conceptsData, stocksData] = await Promise.all([
        loadGroups(),
        loadConcepts(),
        loadStocks()
    ])

    allStocks.value = stocksData
    allConceptsData.value = conceptsData

    // 查找对应的一级板块
    const targetGroup = groupsData.find(group => group.name === groupName)

    if (targetGroup) {
        groupData.value = targetGroup

        // 提取所有概念
        const extractedConcepts = extractConcepts(targetGroup)

        // 为每个概念获取关联股票
        allConcepts.value = extractedConcepts.map(conceptInfo => {
            const stocks = getConceptStockDetails(conceptsData, stocksData, conceptInfo.name)
            return {
                ...conceptInfo,
                stocks
            }
        })

        // 等待 DOM 更新后添加滚动监听
        setTimeout(() => {
            const scrollbarWrap = document.querySelector('.content-scrollbar .el-scrollbar__wrap')
            if (scrollbarWrap) {
                scrollbarWrap.addEventListener('scroll', handleScroll)
            }
        }, 100)
    }
})
</script>

<style scoped>
.group-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.group-info {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
}

.group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.group-info h1 {
    color: #764ba2;
    font-size: 32px;
    margin-bottom: 0;
}

.mode-toggle-btn {
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
}

.mode-toggle-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.loading {
    text-align: center;
    padding: 60px;
    color: #999;
    font-size: 18px;
}

/* 主内容区布局 */
.detail-content {
    display: flex;
    gap: 24px;
    align-items: flex-start;
}

/* 左侧导航目录 */
.nav-sidebar {
    width: 200px;
    flex-shrink: 0;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 40px);
    display: flex;
    flex-direction: column;
}

.nav-title {
    font-size: 16px;
    font-weight: bold;
    color: #764ba2;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f0f0f0;
    flex-shrink: 0;
}

.nav-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
    flex: 1;
}

.nav-item {
    padding: 8px 12px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    line-height: 1.5;
    font-weight: bold;
}

.nav-item:hover {
    background: #f5f5ff;
    color: #764ba2;
}

.nav-item.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: bold;
}

/* 右侧内容区 */
.content-area {
    flex: 1;
    min-width: 0;
}
</style>
