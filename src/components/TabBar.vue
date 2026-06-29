<template>
    <div class="tab-bar">
        <div
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab-item', { active: currentTab === tab.key }]"
            @click="switchTab(tab)"
        >
            <span class="tab-title">{{ tab.title }}</span>
            <span class="tab-close" @click.stop="closeTab(tab)">×</span>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
    tabs: {
        type: Array,
        required: true
    },
    currentTab: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['close', 'switch'])

const router = useRouter()

// 切换标签页
const switchTab = (tab) => {
    emit('switch', tab)
}

// 关闭标签页
const closeTab = (tab) => {
    emit('close', tab)
}
</script>

<style scoped>
.tab-bar {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    max-width: 100%;
}

/* 隐藏滚动条但保持滚动功能 */
.tab-bar::-webkit-scrollbar {
    height: 4px;
}

.tab-bar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
}

.tab-bar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
}

.tab-bar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

.tab-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    font-size: 13px;
    color: white;
}

.tab-item:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
}

.tab-item.active {
    background: rgba(255, 255, 255, 0.95);
    color: #667eea;
    border-color: transparent;
    font-weight: bold;
}

.tab-title {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tab-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    font-size: 14px;
    line-height: 1;
    transition: all 0.2s;
    flex-shrink: 0;
}

.tab-item:not(.active) .tab-close:hover {
    background: rgba(255, 68, 68, 0.8);
    color: white;
}

.tab-item.active .tab-close:hover {
    background: rgba(102, 126, 234, 0.2);
    color: #667eea;
}
</style>
