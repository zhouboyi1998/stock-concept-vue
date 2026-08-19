// 统计数据计算工具函数
import regions from '../data/support/regions.json'

// 创建地区代码到中文名的映射表
const regionNameMap = {}
regions.forEach(region => {
    regionNameMap[region.code] = region.name
})

/**
 * 按地区统计股票数量
 */
export function calculateRegionStats(stocks) {
    const regionMap = {}
    stocks.forEach(stock => {
        stock.codes?.forEach(codeObj => {
            const region = codeObj.region
            if (!regionMap[region]) {
                regionMap[region] = 0
            }
            regionMap[region]++
        })
    })

    return Object.entries(regionMap)
        .map(([region, count]) => ({
            name: regionNameMap[region] || region, // 使用中文名, 如果没有映射则显示原代码
            value: count
        }))
        .sort((a, b) => b.value - a.value)
}

/**
 * 递归收集分组下的所有概念名称
 */
function collectConcepts(group) {
    let result = [...(group.concept || [])]
    if (group.subgroup) {
        group.subgroup.forEach(sub => {
            result = result.concat(collectConcepts(sub))
        })
    }
    return result
}

/**
 * 按概念分组统计股票数量
 */
export function calculateGroupStats(groups, concepts) {
    return groups.map(group => {
        const conceptNames = collectConcepts(group)
        let stockCount = 0

        conceptNames.forEach(conceptName => {
            const concept = concepts.find(c => c.name === conceptName)
            if (concept && concept.stocks) {
                stockCount += concept.stocks.length
            }
        })

        return {
            name: group.name,
            value: stockCount
        }
    })
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
}

/**
 * 获取热门概念 TOP N
 * @param {Array} concepts - 概念列表
 * @param {number} topN - 返回数量 (-1 表示返回全部)
 */
export function calculateTopConcepts(concepts, topN = 10) {
    const sorted = concepts
        .map(concept => ({
            name: concept.name,
            value: concept.stocks?.length || 0
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)

    // 如果 topN 为 -1, 返回全部; 否则返回前 topN 个
    return topN === -1 ? sorted : sorted.slice(0, topN)
}

/**
 * 计算概览统计数据
 */
export function calculateOverviewStats(stocks, concepts, groups, regionStats) {
    return {
        totalStocks: stocks.length,
        totalConcepts: concepts.length,
        totalGroups: groups.length,
        totalRegions: regionStats.length
    }
}
