<template>
    <div class="concept-list">
        <h1>概念列表</h1>

        <!-- 搜索框 -->
        <div class="search-box">
            <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索概念名称、别名或拼音首字母..."
                @input="handleSearch"
            />
        </div>

        <!-- 概念列表 -->
        <div class="concept-items">
            <div
                v-for="concept in filteredConcepts"
                :key="concept.name"
                class="concept-item"
                @click="goToConceptDetail(concept.name)"
            >
                <div class="concept-header">
                    <span class="concept-name">{{ concept.name }}</span>
                    <span class="stock-count">{{ concept.stocks?.length || 0 }} 只股票</span>
                </div>
                <div class="concept-description">
                    {{ concept.description }}
                </div>
                <div v-if="concept.related && concept.related.length > 0" class="concept-related-list">
                    <span
                        v-for="relatedName in concept.related"
                        :key="relatedName"
                        class="related-tag"
                        @click.stop="goToConceptDetail(relatedName)"
                    >
                        {{ relatedName }}
                    </span>
                </div>
            </div>

            <!-- 无结果提示 -->
            <div v-if="filteredConcepts.length === 0" class="no-result">
                未找到匹配的概念
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loadConcepts, searchConcepts } from '../../utils/dataLoader'

const router = useRouter()
const concepts = ref([])
const searchKeyword = ref('')
const filteredConcepts = ref([])

// 加载概念数据
onMounted(async () => {
    const data = await loadConcepts()
    concepts.value = data
    filteredConcepts.value = data
})

// 处理搜索
const handleSearch = () => {
    filteredConcepts.value = searchConcepts(concepts.value, searchKeyword.value)
}

// 跳转到概念详情页
const goToConceptDetail = (conceptName) => {
    router.push(`/concept/${ encodeURIComponent(conceptName) }`)
}
</script>

<style scoped>
.concept-list {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    color: #333;
    margin-bottom: 20px;
}

.search-box {
    margin-bottom: 20px;
}

.search-box input {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border: 2px solid #ddd;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.3s;
}

.search-box input:focus {
    border-color: #2196f3;
}

.concept-items {
    display: grid;
    gap: 16px;
}

.concept-item {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s;
}

.concept-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    border-color: #2196f3;
}

.concept-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.concept-name {
    font-size: 18px;
    font-weight: bold;
    color: #764ba2;
}

.stock-count {
    font-size: 14px;
    color: #667eea;
    background: #e8eaf6;
    padding: 4px 12px;
    border-radius: 16px;
    font-weight: bold;
}

.concept-description {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px dashed #e0e0e0;
}

.concept-related-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.related-tag {
    display: inline-block;
    padding: 4px 12px;
    background: #e8eaf6;
    color: #667eea;
    border-radius: 16px;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

.related-tag:hover {
    background: #667eea;
    color: white;
}

.no-result {
    text-align: center;
    padding: 40px;
    color: #999;
    font-size: 16px;
}
</style>
