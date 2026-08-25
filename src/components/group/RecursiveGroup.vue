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
                    :class="['concept-item', { 'disabled': !isConceptExists(conceptName) }]"
                    @click.stop="isConceptExists(conceptName) && goToConceptHandler(conceptName)"
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
                    :concept-names="conceptNames"
                    @navigate="handleNavigate"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loadConcepts } from '../../utils/dataLoader'
import { goToConceptDetail } from '../../utils/navigation'

const props = defineProps({
    group: {
        type: Object,
        required: true
    },
    depth: {
        type: Number,
        default: 0
    },
    // 接收父组件传递的概念名称集合
    conceptNames: {
        type: Set,
        default: () => new Set()
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

// 判断概念是否存在
const isConceptExists = (conceptName) => {
    return props.conceptNames.has(conceptName)
}

// 跳转到概念详情
const goToConceptHandler = (conceptName) => {
    goToConceptDetail(router, conceptName)
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

.group-header-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
    min-height: 60px;
    cursor: pointer;
    transition: all 0.3s;
}

.group-header-row:hover {
    opacity: 0.95;
}

/* 没有子分组的标题行不可点击 */
.no-children {
    cursor: default !important;
}

/* 没有子分组时, 悬停背景不变 */
.no-children:hover {
    opacity: 1 !important;
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

/* 概念不存在时的禁用样式 */
.concept-item.disabled {
    background: #f0f0f0;
    color: #999;
    cursor: not-allowed;
    opacity: 0.6;
}

.concept-item.disabled:hover {
    background: #f0f0f0;
    color: #999;
    transform: none;
    box-shadow: none;
}
</style>
