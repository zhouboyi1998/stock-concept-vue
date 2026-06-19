<script setup>
import { useRoute, useRouter } from 'vue-router'
import { watch } from 'vue'

const router = useRouter()
const route = useRoute()

// 监听路由变化, 滚动到页面顶部
watch(
    () => route.path,
    () => {
        window.scrollTo(0, 0)
    }
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
</script>

<template>
    <div id="app">
        <!-- 导航栏 -->
        <nav class="navbar">
            <div class="nav-brand" @click="goToStocks">股票概念库</div>
            <div class="nav-links">
                <button v-if="route.path !== '/stocks' && route.path !== '/concepts'" class="back-btn" @click="goBack">
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
            </div>
        </nav>

        <!-- 路由视图 -->
        <main class="main-content">
            <router-view/>
        </main>
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
    padding: 16px 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
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

.main-content {
    padding: 20px;
    margin-top: 70px;
}
</style>
