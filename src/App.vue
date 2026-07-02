<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, watch, onMounted } from 'vue'
import { ElScrollbar } from 'element-plus'
import { useTabStore } from './stores/tabStore'

const router = useRouter()
const route = useRoute()
const tabStore = useTabStore()

// 使用 store 中的状态 (自动持久化)
const tabs = computed(() => tabStore.tabs)
const currentTabKey = computed({
    get: () => tabStore.currentTabKey,
    set: (value) => {
        tabStore.currentTabKey = value
    }
})
const hasTabs = computed(() => tabStore.tabs.length > 0)
const scrollPositions = computed(() => tabStore.scrollPositions)

// 生成标签页的唯一 key
const getTabKey = (route) => {
    if (route.path.startsWith('/stock/')) {
        return `stock_${ route.params.name }`
    } else if (route.path.startsWith('/concept/')) {
        return `concept_${ route.params.name }`
    }
    return route.path
}

// 获取标签页标题
const getTabTitle = (route) => {
    if (route.path.startsWith('/stock/')) {
        // 股票名称从路由参数中直接获取
        return `股票: ${ decodeURIComponent(route.params.name) }`
    } else if (route.path.startsWith('/concept/')) {
        // 概念名称可能包含特殊字符，需要解码
        return `概念: ${ decodeURIComponent(route.params.name) }`
    }
    return route.meta.title || route.path
}

// 添加标签页
const addTab = (route) => {
    const key = getTabKey(route)

    // 检查是否已存在
    const existingTab = tabStore.tabs.find(tab => tab.key === key)
    if (!existingTab) {
        tabStore.tabs.push({
            key,
            title: getTabTitle(route),
            path: route.path,
            fullPath: route.fullPath
        })
        // 为新标签页初始化滚动位置
        if (!tabStore.scrollPositions[key]) {
            tabStore.scrollPositions[key] = 0
        }
    }

    tabStore.currentTabKey = key
}

// 关闭标签页
const closeTab = (tab) => {
    const index = tabStore.tabs.findIndex(t => t.key === tab.key)
    if (index === -1) return

    // 移除标签页
    tabStore.tabs.splice(index, 1)
    // 清除该标签页的滚动位置记录
    delete tabStore.scrollPositions[tab.key]

    // 如果关闭的是当前标签页，切换到其他标签页
    if (tab.key === tabStore.currentTabKey) {
        if (tabStore.tabs.length > 0) {
            // 切换到前一个或后一个标签页
            const newIndex = Math.max(0, index - 1)
            const newTab = tabStore.tabs[newIndex]
            tabStore.currentTabKey = newTab.key
            router.push(newTab.path)
        } else {
            // 没有标签页了，跳转到股票列表
            tabStore.currentTabKey = ''
            router.push('/stocks')
        }
    }
}

// 切换标签页
const switchTab = async (tab) => {
    // 保存当前标签页的滚动位置
    if (tabStore.currentTabKey) {
        const mainContent = document.querySelector('.main-content')
        if (mainContent) {
            tabStore.scrollPositions[tabStore.currentTabKey] = mainContent.scrollTop
        }
    }

    // 切换到新标签页
    tabStore.currentTabKey = tab.key
    await router.push(tab.path)

    // 恢复新标签页的滚动位置
    setTimeout(() => {
        const mainContent = document.querySelector('.main-content')
        if (mainContent && tabStore.scrollPositions[tab.key]) {
            mainContent.scrollTop = tabStore.scrollPositions[tab.key]
        }
    }, 50)
}

// 监听路由变化，自动添加标签页
watch(
    () => route.path,
    () => {
        // 只为股票详情和概念详情页添加标签页
        if (route.path.startsWith('/stock/') || route.path.startsWith('/concept/')) {
            addTab(route)
        }
    },
    { immediate: true }
)

// 返回上一页
const goBack = () => {
    router.back()
}

// 导航到股票列表
const goToStocks = () => {
    router.push('/stocks')
}

// 导航到概念列表
const goToConcepts = () => {
    router.push('/concepts')
}

// 导航到概念分组
const goToConceptGroup = () => {
    router.push('/concept-group')
}

// 计算需要缓存的路由
const cachedViews = computed(() => {
    return tabStore.tabs.map(tab => {
        if (tab.key.startsWith('stock_')) {
            return 'StockDetail'
        } else if (tab.key.startsWith('concept_')) {
            return 'ConceptDetail'
        }
        return null
    }).filter(Boolean)
})
</script>

<template>
    <div id="app">
        <!-- 导航栏 -->
        <nav class="navbar">
            <div class="nav-brand" @click="goToStocks">股票概念库</div>
            <div class="nav-links">
                <button v-if="route.path !== '/stocks' && route.path !== '/concepts' && route.path !== '/concept-group'" class="back-btn" @click="goBack">
                    返回
                </button>
                <button
                    :class="['nav-btn', { active: route.path === '/stocks' || route.path.startsWith('/stock/') }]"
                    @click="goToStocks"
                >
                    股票列表
                </button>
                <button
                    :class="['nav-btn', { active: route.path === '/concepts' || route.path.startsWith('/concept/') }]"
                    @click="goToConcepts"
                >
                    概念列表
                </button>
                <button
                    :class="['nav-btn', { active: route.path === '/concept-group' }]"
                    @click="goToConceptGroup"
                >
                    概念分组
                </button>
            </div>
        </nav>

        <!-- 主容器 -->
        <div class="main-container">
            <!-- 路由视图 (使用 Element Plus 滚动条) -->
            <ElScrollbar class="content-scrollbar">
                <main class="main-content">
                    <router-view v-slot="{ Component }">
                        <keep-alive :include="cachedViews">
                            <component :is="Component" :key="route.fullPath"/>
                        </keep-alive>
                    </router-view>
                </main>
            </ElScrollbar>

            <!-- 右侧标签页栏 -->
            <aside class="tab-sidebar">
                <ElScrollbar class="tab-scrollbar">
                    <div class="tab-list">
                        <div
                            v-for="tab in tabs"
                            :key="tab.key"
                            :class="['tab-item', { active: currentTabKey === tab.key }]"
                            @click="switchTab(tab)"
                        >
                            <span class="tab-title">{{ tab.title }}</span>
                            <span class="tab-close" @click.stop="closeTab(tab)">×</span>
                        </div>
                        <div v-if="tabs.length === 0" class="empty-tip">
                            暂无打开的页面
                        </div>
                    </div>
                </ElScrollbar>
            </aside>
        </div>
    </div>
</template>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f5f5f5;
}

#app {
    min-height: 100vh;
}

.navbar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    min-height: 70px;
}

.nav-left {
    flex-shrink: 0;
}

.nav-center {
    flex: 1;
    overflow: hidden;
    min-width: 0;
}

.nav-right {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-shrink: 0;
}

.nav-brand {
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    transition: opacity 0.2s;
}

.nav-brand:hover {
    opacity: 0.9;
}

.nav-links {
    display: flex;
    gap: 12px;
    align-items: center;
}

.back-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    transition: all 0.3s;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

.nav-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    transition: all 0.3s;
}

.nav-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

.nav-btn.active {
    background: white;
    color: #667eea;
    font-weight: bold;
}

.main-container {
    display: flex;
    height: calc(100vh - 70px);
    margin-top: 70px;
    overflow: hidden;
}

/* 内容区滚动条 */
.content-scrollbar {
    flex: 1;
    height: 100%;
}

.content-scrollbar :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
}

.main-content {
    padding: 20px;
    min-height: 100%;
}

/* 右侧标签页侧边栏 */
.tab-sidebar {
    width: 220px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 12px 24px 12px 0;
}

.tab-scrollbar {
    height: 100%;
}

.tab-scrollbar :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
}

.tab-list {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 100%;
}

.empty-tip {
    text-align: center;
    color: #999;
    font-size: 13px;
    padding: 40px 20px;
}

.tab-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    min-height: 40px;
}

.tab-item:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.tab-item.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
    font-weight: bold;
}

.tab-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tab-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 16px;
    line-height: 1;
    transition: all 0.2s;
    flex-shrink: 0;
}

.tab-item:not(.active) .tab-close:hover {
    background: #ff4444;
    color: white;
}

.tab-item.active .tab-close:hover {
    background: rgba(255, 255, 255, 0.3);
}
</style>
