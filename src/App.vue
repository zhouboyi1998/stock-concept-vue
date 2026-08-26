<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, watch, onMounted, ref } from 'vue'
import { ElScrollbar } from 'element-plus'
import html2canvas from 'html2canvas'
import { useTabStore } from './stores/tabStore'
import { useSearchStore } from './stores/searchStore'
import { useStockListStore } from './stores/stockListStore'
import { useConceptListStore } from './stores/conceptListStore'
import ConfirmModal from './components/common/ConfirmModal.vue'

const router = useRouter()
const route = useRoute()
const tabStore = useTabStore()
const searchStore = useSearchStore()
const stockListStore = useStockListStore()
const conceptListStore = useConceptListStore()

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
const tabSortOrder = computed({
    get: () => tabStore.tabSortOrder,
    set: (value) => {
        tabStore.tabSortOrder = value
    }
})

// 根据排序状态返回显示用的标签列表
const displayTabs = computed(() => {
    if (tabStore.tabSortOrder === 'desc') {
        // 最新的在顶部 - 反转数组
        return [...tabStore.tabs].reverse()
    }
    // 最新的在底部 - 保持原序
    return tabStore.tabs
})

// 生成标签页的唯一 key
const getTabKey = (route) => {
    if (route.path.startsWith('/stock/')) {
        const name = route.params.name
        const identifier = route.params.identifier
        return identifier ? `stock_${ name }_${ identifier }` : `stock_${ name }`
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
        // 概念名称可能包含特殊字符, 需要解码
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

    // 只有当关闭的是当前激活的标签时, 才处理跳转
    if (tab.key === tabStore.currentTabKey) {
        // 如果还有其它标签, 切换到前一个标签
        if (tabStore.tabs.length > 0) {
            const newIndex = Math.max(0, index - 1)
            const newTab = tabStore.tabs[newIndex]
            tabStore.currentTabKey = newTab.key
            router.push(newTab.fullPath)
        } else {
            // 没有标签了, 清空 currentTabKey
            tabStore.currentTabKey = ''

            // 根据当前页面类型决定跳转逻辑
            if (route.path.startsWith('/stock/')) {
                // 股票详情页 -> 跳转到股票列表
                router.push('/stocks')
            } else if (route.path.startsWith('/concept/')) {
                // 概念详情页 -> 跳转到概念列表
                router.push('/concepts')
            }
            // 非详情页 -> 保持当前页面, 不跳转
        }
    }
}

// 切换标签页
const switchTab = async (tab) => {
    // 保存当前标签页的滚动位置
    if (tabStore.currentTabKey) {
        const scrollbarWrap = document.querySelector('.content-scrollbar .el-scrollbar__wrap')
        if (scrollbarWrap) {
            tabStore.scrollPositions[tabStore.currentTabKey] = scrollbarWrap.scrollTop
        }
    }

    // 切换到新标签页
    tabStore.currentTabKey = tab.key
    await router.push(tab.fullPath)

    // 恢复新标签页的滚动位置
    setTimeout(() => {
        const scrollbarWrap = document.querySelector('.content-scrollbar .el-scrollbar__wrap')
        if (scrollbarWrap && tabStore.scrollPositions[tab.key]) {
            scrollbarWrap.scrollTop = tabStore.scrollPositions[tab.key]
        }
    }, 50)
}

// 监听路由变化, 自动添加标签页
watch(
    () => route.fullPath,
    (newFullPath) => {
        const isDetailPage = newFullPath.startsWith('/stock/') || newFullPath.startsWith('/concept/')

        // 只为股票详情和概念详情页添加标签页
        if (isDetailPage) {
            addTab(route)
            // 更新当前激活的 tab key
            const key = getTabKey(route)
            tabStore.currentTabKey = key
        } else {
            // 离开详情页时, 清空 currentTabKey, 让所有标签变为非选中状态
            tabStore.currentTabKey = ''
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

// 导航到板块列表 (概念分组)
const goToConceptGroup = () => {
    router.push('/concept-group')
}

// 导航到统计信息
const goToStatistics = () => {
    router.push('/statistics')
}

// 导航到首页 (地球仪)
const goToHome = () => {
    router.push('/home')
}

// 导航到搜索页面
const goToSearch = () => {
    router.push('/search')
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

// 清空所有标签页
const clearAllTabs = () => {
    tabStore.tabs = []
    tabStore.currentTabKey = ''
    tabStore.scrollPositions = {}

    // 根据当前页面类型决定跳转逻辑
    if (route.path.startsWith('/stock/')) {
        // 股票详情页 -> 跳转到股票列表
        router.push('/stocks')
    } else if (route.path.startsWith('/concept/')) {
        // 概念详情页 -> 跳转到概念列表
        router.push('/concepts')
    }
    // 非详情页 -> 保持当前页面, 不跳转
}

// 切换标签页排序方式
const toggleTabSortOrder = () => {
    tabStore.tabSortOrder = tabStore.tabSortOrder === 'desc' ? 'asc' : 'desc'
}

// 回到顶部
const scrollToTop = () => {
    const scrollbarWrap = document.querySelector('.content-scrollbar .el-scrollbar__wrap')
    if (scrollbarWrap) {
        scrollbarWrap.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
}

// 截屏弹窗状态
const showScreenshotModal = ref(false)

// 截屏功能 - 显示确认弹窗
const captureScreenshot = () => {
    showScreenshotModal.value = true
}

// 确认截屏
const handleScreenshotConfirm = async () => {
    try {
        // 1. 获取滚动容器和内容区
        const scrollbarWrap = document.querySelector('.content-scrollbar .el-scrollbar__wrap')
        const mainContent = document.querySelector('.main-content')
        const tabSidebar = document.querySelector('.tab-sidebar')

        if (!scrollbarWrap || !mainContent) {
            alert('无法找到页面内容')
            return
        }

        // 2. 保存当前滚动位置
        const currentScrollTop = scrollbarWrap.scrollTop

        // 3. 滚动到顶部
        scrollbarWrap.scrollTop = 0

        // 4. 等待滚动完成和 DOM 更新
        await new Promise(resolve => setTimeout(resolve, 100))

        // 5. 如果有标签栏, 临时隐藏它以保证左右空白对称
        let sidebarWasVisible = false
        if (tabSidebar) {
            sidebarWasVisible = tabSidebar.style.display !== 'none'
            if (sidebarWasVisible) {
                tabSidebar.style.display = 'none'
                // 等待 DOM 更新, 让内容重新布局
                await new Promise(resolve => setTimeout(resolve, 50))
            }
        }

        // 6. 设置最大高度 (10000px)
        const maxHeight = 10000
        const actualHeight = Math.min(mainContent.scrollHeight, maxHeight)

        // 7. 使用 html2canvas 截图
        const canvas = await html2canvas(mainContent, {
            width: mainContent.scrollWidth,
            height: actualHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: mainContent.scrollWidth,
            windowHeight: actualHeight,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            scale: 2 // 提高清晰度
        })

        // 8. 恢复标签栏显示
        if (tabSidebar && sidebarWasVisible) {
            tabSidebar.style.display = ''
        }

        // 9. 恢复原来的滚动位置
        scrollbarWrap.scrollTop = currentScrollTop

        // 10. 转换为图片并下载
        const image = canvas.toDataURL('image/png')
        const link = document.createElement('a')

        // 生成文件名
        let fileName = ''

        // 规则1: 股票详情页、概念详情页 - 使用名称
        if (route.path.startsWith('/stock/')) {
            fileName = decodeURIComponent(route.params.name)
        } else if (route.path.startsWith('/concept/')) {
            fileName = decodeURIComponent(route.params.name)
        }
        // 规则2: 股票列表页、概念列表页、全站搜索页 - 如果有搜索内容, 使用搜索内容
        else if (route.path === '/search' && searchStore.searchKeyword && searchStore.searchKeyword.trim()) {
            fileName = searchStore.searchKeyword.trim()
        } else if (route.path === '/stocks' && stockListStore.searchKeyword && stockListStore.searchKeyword.trim()) {
            fileName = stockListStore.searchKeyword.trim()
        } else if (route.path === '/concepts' && conceptListStore.searchKeyword && conceptListStore.searchKeyword.trim()) {
            fileName = conceptListStore.searchKeyword.trim()
        }
        // 规则3: 其他情况 - 使用页面类型
        else {
            fileName =
                route.path === '/search' ? '全站搜索' :
                    route.path === '/stocks' ? '股票列表' :
                        route.path === '/concepts' ? '概念列表' :
                            route.path === '/concept-group' ? '板块列表' :
                                route.path === '/statistics' ? '统计信息' :
                                    '页面'
        }

        const now = new Date()
        const timestamp = `${ now.getFullYear() }${ String(now.getMonth() + 1).padStart(2, '0') }${ String(now.getDate()).padStart(2, '0') }_${ String(now.getHours()).padStart(2, '0') }${ String(now.getMinutes()).padStart(2, '0') }${ String(now.getSeconds()).padStart(2, '0') }`
        const filename = `${ fileName }_${ timestamp }.png`

        link.download = filename
        link.href = image
        link.click()

    } catch (error) {
        console.error('截图失败:', error)
        alert('截图失败')
    }
}
</script>

<template>
    <div id="app">
        <!-- 导航栏 -->
        <nav class="navbar">
            <div class="nav-brand" @click="goToHome">股票概念库</div>
            <div class="nav-links">
                <button v-if="route.path !== '/stocks' && route.path !== '/concepts' && route.path !== '/concept-group' && route.path !== '/statistics' && route.path !== '/search' && route.path !== '/home'" class="back-btn" @click="goBack">
                    返回
                </button>
                <button
                    :class="['nav-btn', { active: route.path === '/search' }]"
                    @click="goToSearch"
                >
                    全站搜索
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
                    板块列表
                </button>
                <button
                    :class="['nav-btn', { active: route.path === '/statistics' }]"
                    @click="goToStatistics"
                >
                    统计信息
                </button>
            </div>
        </nav>

        <!-- 主容器 -->
        <div :class="['main-container', { 'home-page': route.path === '/home', 'search-page-container': route.path === '/search' }]">
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
            <aside v-if="route.path !== '/home' && route.path !== '/search'" class="tab-sidebar">
                <ElScrollbar class="tab-scrollbar">
                    <div class="tab-list">
                        <!-- 控制按钮区域 -->
                        <div v-if="tabs.length > 0" class="tab-controls">
                            <!-- 清空按钮 -->
                            <div class="clear-all-btn" @click="clearAllTabs">
                                <span class="clear-all-text">清 空</span>
                            </div>
                            <!-- 排序切换按钮 -->
                            <div class="sort-toggle-btn" @click="toggleTabSortOrder" :title="tabSortOrder === 'desc' ? 'DESC' : 'ASC'">
                                <svg v-if="tabSortOrder === 'desc'" class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 5v14M5 12l7 7 7-7"/>
                                </svg>
                                <svg v-else class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 19V5M5 12l7-7 7 7"/>
                                </svg>
                            </div>
                        </div>
                        <!-- 标签列表 -->
                        <div
                            v-for="tab in displayTabs"
                            :key="tab.key"
                            :class="['tab-item', { active: currentTabKey === tab.key }]"
                            @click="switchTab(tab)"
                        >
                            <span class="tab-title">{{ tab.title }}</span>
                            <span class="tab-close" @click.stop="closeTab(tab)">✖</span>
                        </div>
                        <div v-if="tabs.length === 0" class="empty-tip">
                            暂无打开的页面
                        </div>
                    </div>
                </ElScrollbar>
            </aside>
        </div>

        <!-- 截屏按钮 -->
        <div v-if="route.path !== '/home'" class="screenshot-btn" @click="captureScreenshot" title="截屏">
            <svg class="screenshot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <!-- 相机机身 -->
                <rect x="3" y="6" width="18" height="14" rx="2" ry="2"/>
                <!-- 镜头 -->
                <circle cx="12" cy="13" r="3.5"/>
                <!-- 闪光灯 -->
                <path d="M7 6V4h10v2"/>
                <!-- 快门按钮 -->
                <circle cx="17" cy="9" r="1" fill="currentColor"/>
            </svg>
        </div>

        <!-- 回到顶部按钮 -->
        <div v-if="route.path !== '/home'" class="back-to-top" @click="scrollToTop" title="回到顶部">
            <svg class="back-to-top-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
        </div>

        <!-- 截屏确认弹窗 -->
        <ConfirmModal
            :visible="showScreenshotModal"
            title="截屏确认"
            message="是否截取当前页面？将自动滚动到页面顶部并生成截图。"
            type="info"
            confirmButtonText="确定"
            cancelButtonText="取消"
            @confirm="handleScreenshotConfirm"
            @close="showScreenshotModal = false"
        />
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

/* 首页样式 */
.main-container.home-page {
    margin-top: 70px;
    height: calc(100vh - 70px);
}

.main-container.home-page .content-scrollbar {
    padding: 0;
}

.main-container.home-page .main-content {
    padding: 0;
}

/* 搜索页面样式 */
.main-container.search-page-container .content-scrollbar {
    padding: 0;
}

.main-container.search-page-container .main-content {
    padding: 0;
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

/* 控制按钮区域 */
.tab-controls {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
}

/* 清空所有标签按钮 */
.clear-all-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 12px;
    background: #ff6b6b;
    border: 1px solid #ff6b6b;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    min-height: 40px;
    color: white;
    font-weight: bold;
    position: relative;
    overflow: hidden;
}

.clear-all-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
    );
    transition: none;
}

.clear-all-btn:hover::before {
    animation: wave-flow 1.5s infinite;
}

@keyframes wave-flow {
    0% {
        left: -100%;
    }
    100% {
        left: 100%;
    }
}

.clear-all-text {
    text-align: center;
}

.empty-tip {
    text-align: center;
    color: #999;
    font-size: 13px;
    padding: 40px 20px;
}

/* 排序切换按钮 */
.sort-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    min-height: 40px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
}

.sort-toggle-btn:hover {
    border-color: #667eea;
    background: #f5f5ff;
}

.sort-icon {
    width: 20px;
    height: 20px;
    color: #667eea;
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
    color: #ff6b6b;
}

.tab-item.active .tab-close:hover {
    color: #ff6b6b;
}

/* 截屏按钮 */
.screenshot-btn {
    position: fixed;
    right: 254px;
    bottom: 90px;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    transition: all 0.3s;
    z-index: 999;
}

.screenshot-btn:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.screenshot-icon {
    width: 24px;
    height: 24px;
    color: white;
}

/* 回到顶部按钮 */
.back-to-top {
    position: fixed;
    right: 254px;
    bottom: 30px;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    transition: all 0.3s;
    z-index: 999;
}

.back-to-top:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.back-to-top-icon {
    width: 24px;
    height: 24px;
    color: white;
}
</style>
