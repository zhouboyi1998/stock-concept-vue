import { createRouter, createWebHistory } from 'vue-router'
import StockList from '../components/stock/StockList.vue'
import ConceptList from '../components/concept/ConceptList.vue'
import ConceptGroup from '../components/group/ConceptGroup.vue'
import Statistics from '../components/statistics/Statistics.vue'
import EarthGlobe from '../components/globe/EarthGlobe.vue'
import StockDetail from '../components/stock/StockDetail.vue'
import ConceptDetail from '../components/concept/ConceptDetail.vue'

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'Home',
        component: EarthGlobe
    },
    {
        path: '/stocks',
        name: 'StockList',
        component: StockList
    },
    {
        path: '/stock/:name',
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
        path: '/statistics',
        name: 'Statistics',
        component: Statistics
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
