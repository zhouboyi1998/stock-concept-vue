<template>
    <div :class="['group-item', { 'root-group': depth === 0 }]">
        <!-- 分组标题行 -->
        <div
            :class="['group-header-row', { 'root-header': depth === 0, 'no-children': !hasChildren }]"
            @click="handleToggle"
        >
            <!-- 左侧: 分组名称和展开/收起图标 -->
            <div class="group-header-left">
                <span v-if="hasChildren" class="group-icon">{{ isExpanded ? '▼' : '▶' }}</span>
                <span v-else class="group-icon-placeholder"></span>
                <span class="group-name">{{ group.name }}</span>
            </div>

            <!-- 右侧: 概念列表 -->
            <div v-if="group.concept && group.concept.length > 0" class="group-concepts">
                <div
                    v-for="conceptName in group.concept"
                    :key="conceptName"
                    class="concept-item"
                    @click.stop="goToConcept(conceptName)"
                >
                    {{ conceptName }}
                </div>
            </div>
        </div>

        <!-- 分组内容: 子分组列表 -->
        <div v-show="isExpanded" class="group-content">
            <div v-if="group.subgroup && group.subgroup.length > 0" class="subgroup-list">
                <RecursiveGroup
                    v-for="subgroup in group.subgroup"
                    :key="subgroup.name"
                    :group="subgroup"
                    :depth="depth + 1"
                    @navigate="handleNavigate"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
    group: {
        type: Object,
        required: true
    },
    depth: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['navigate'])

const router = useRouter()
const isExpanded = ref(false) // 默认收起

// 判断是否有子分组
const hasChildren = computed(() => {
    return props.group.subgroup && props.group.subgroup.length > 0
})

// 切换展开/收起
const handleToggle = () => {
    if (!hasChildren.value) return // 没有子分组, 不允许展开
    isExpanded.value = !isExpanded.value
}

// 跳转到概念
const goToConcept = (conceptName) => {
    router.push(`/concept/${ encodeURIComponent(conceptName) }`)
    emit('navigate')
}

// 处理子组件的导航事件
const handleNavigate = () => {
    emit('navigate')
}
</script>

<style scoped>
.group-item {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 12px;
}

/* 一级分组特殊样式 */
.root-group {
    background: white;
    margin-bottom: 16px;
}

.root-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white;
}

.root-header:hover {
    opacity: 0.95;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.group-header-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: #f5f5f5;
    min-height: 60px;
    cursor: pointer;
    transition: all 0.3s;
}

.group-header-row:hover {
    background: #e8eaf6;
}

/* 没有子分组的标题行不可点击 */
.no-children {
    cursor: default !important;
}

/* 非一级分组且没有子分组时, 悬停背景不变 */
.group-header-row.no-children:hover {
    background: #f5f5f5 !important;
}

/* 一级分组且没有子分组时, 悬停只改变透明度, 不改变背景 */
.root-header.no-children:hover {
    opacity: 0.95 !important;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.group-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}

.group-icon {
    font-size: 14px;
    width: 20px;
}

.group-icon-placeholder {
    width: 20px;
    display: inline-block;
}

.group-name {
    font-size: 20px;
    font-weight: bold;
    color: inherit;
}

.group-concepts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
}

.group-content {
    padding: 16px 20px;
    background: white;
}

.subgroup-list {
    display: flex;
    flex-direction: column;
}

.concept-item {
    display: inline-block;
    padding: 6px 14px;
    background: #e8eaf6;
    color: #764ba2;
    border-radius: 16px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

.concept-item:hover {
    background: #764ba2;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(118, 75, 162, 0.3);
}

/* 一级分组的概念按钮样式 */
.root-header .concept-item {
    background: rgba(255, 255, 255, 0.3);
    color: white;
}

.root-header .concept-item:hover {
    background: white;
    color: #764ba2;
}
</style>
