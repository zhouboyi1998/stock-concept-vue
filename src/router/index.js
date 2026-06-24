import { createRouter, createWebHistory } from 'vue-router'
import StockList from '../components/stock/StockList.vue'
import ConceptList from '../components/concept/ConceptList.vue'
import ConceptGroup from '../components/group/ConceptGroup.vue'
import StockDetail from '../components/stock/StockDetail.vue'
import ConceptDetail from '../components/concept/ConceptDetail.vue'

const routes = [
    {
        path: '/',
        redirect: '/stocks'
    },
    {
        path: '/stocks',
        name: 'StockList',
        component: StockList
    },
    {
        path: '/stock/:code',
        name: 'StockDetail',
        component: StockDetail
    },
    {
        path: '/concepts',
        name: 'ConceptList',
        component: ConceptList
    },
    {
        path: '/concept-group',
        name: 'ConceptGroup',
        component: ConceptGroup
    },
    {
        path: '/concept/:name',
        name: 'ConceptDetail',
        component: ConceptDetail
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
