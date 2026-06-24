// 数据加载工具函数
import { pinyin } from 'pinyin-pro'

// 使用 Vite 的 import.meta.glob 动态导入所有 JSON 文件
const stockModules = import.meta.glob('../data/stock/*.json', { eager: true })
const conceptModules = import.meta.glob('../data/concept/*.json', { eager: true })
const groupModules = import.meta.glob('../data/group/*.json', { eager: true })

/**
 * 获取字符串的拼音首字母
 */
function getFirstLetters(str) {
    if (!str) return ''
    try {
        const py = pinyin(str, {
            pattern: 'first',
            toneType: 'none',
            type: 'array'
        })
        return py.join('').toLowerCase()
    } catch (error) {
        console.error('Error converting to pinyin:', error)
        return ''
    }
}

/**
 * 从模块对象中提取数据数组
 */
function extractDataFromModules(modules) {
    return Object.values(modules)
        .map(module => module.default || module)
        .filter(data => data !== null && data !== undefined)
}

/**
 * 加载所有股票数据
 */
export async function loadStocks() {
    try {
        return extractDataFromModules(stockModules)
    } catch (error) {
        console.error('Error loading stocks:', error)
        return []
    }
}

/**
 * 加载所有概念数据
 */
export async function loadConcepts() {
    try {
        return extractDataFromModules(conceptModules)
    } catch (error) {
        console.error('Error loading concepts:', error)
        return []
    }
}

/**
 * 加载所有分组数据
 */
export async function loadGroups() {
    try {
        return extractDataFromModules(groupModules)
    } catch (error) {
        console.error('Error loading groups:', error)
        return []
    }
}

/**
 * 搜索股票 (支持按名称、代码、拼音首字母搜索)
 */
export function searchStocks(stocks, keyword) {
    if (!keyword || !keyword.trim()) {
        return stocks
    }

    const lowerKeyword = keyword.toLowerCase().trim()
    return stocks.filter(stock => {
        // 匹配股票名称
        if (stock.name.toLowerCase().includes(lowerKeyword)) {
            return true
        }

        // 匹配股票代码
        if (stock.code.toLowerCase().includes(lowerKeyword)) {
            return true
        }

        // 匹配股票名称的拼音首字母
        const firstLetters = getFirstLetters(stock.name)
        if (firstLetters.includes(lowerKeyword)) {
            return true
        }

        return false
    })
}

/**
 * 搜索概念 (支持按名称、别名、拼音首字母搜索)
 */
export function searchConcepts(concepts, keyword) {
    if (!keyword || !keyword.trim()) {
        return concepts
    }

    const lowerKeyword = keyword.toLowerCase().trim()
    return concepts.filter(concept => {
        // 匹配概念名称
        if (concept.name.toLowerCase().includes(lowerKeyword)) {
            return true
        }

        // 匹配概念别名
        if (concept.alias && concept.alias.length > 0) {
            for (const alias of concept.alias) {
                if (alias.toLowerCase().includes(lowerKeyword)) {
                    return true
                }
            }
        }

        // 匹配概念名称的拼音首字母
        const firstLetters = getFirstLetters(concept.name)
        if (firstLetters.includes(lowerKeyword)) {
            return true
        }

        // 匹配别名的拼音首字母
        if (concept.alias && concept.alias.length > 0) {
            for (const alias of concept.alias) {
                const aliasFirstLetters = getFirstLetters(alias)
                if (aliasFirstLetters.includes(lowerKeyword)) {
                    return true
                }
            }
        }

        return false
    })
}

/**
 * 根据股票代码获取股票信息
 */
export function getStockByCode(stocks, code) {
    return stocks.find(stock => stock.code === code)
}

/**
 * 根据股票名称获取股票信息
 */
export function getStockByName(stocks, name) {
    return stocks.find(stock => stock.name === name)
}

/**
 * 根据概念名称获取概念信息
 */
export function getConceptByName(concepts, name) {
    return concepts.find(concept => concept.name === name)
}

/**
 * 获取概念下的所有股票详细信息 (包含在该概念中的入选理由)
 */
export function getConceptStockDetails(concepts, stocks, conceptName) {
    const concept = getConceptByName(concepts, conceptName)
    if (!concept || !concept.stocks) {
        return []
    }

    return concept.stocks
        .map(stockItem => {
            const stockName = stockItem.name

            // 先尝试按名称查找, 如果找不到再尝试按代码查找 (兼容旧数据)
            let stock = getStockByName(stocks, stockName)
            if (!stock) {
                stock = getStockByCode(stocks, stockName)
            }
            if (!stock) return null

            // 概念JSON中给股票的入选理由
            const conceptReasons = stockItem.reasons || []

            // 股票JSON中自己写的入选理由
            const conceptInfo = stock.concepts?.find(c => c.name === conceptName)
            const stockReasons = conceptInfo?.reasons || []

            return {
                ...stock,
                conceptReasons: conceptReasons,
                stockReasons: stockReasons
            }
        })
        .filter(stock => stock !== null)
}

/**
 * 获取关联概念的详细信息列表
 */
export function getRelatedConcepts(concepts, conceptName) {
    const concept = getConceptByName(concepts, conceptName)
    if (!concept || !concept.related) {
        return []
    }

    return concept.related
        .map(name => getConceptByName(concepts, name))
        .filter(c => c !== undefined)
}
