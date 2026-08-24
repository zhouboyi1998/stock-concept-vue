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
 * 递归提取板块中的所有概念名称
 */
function extractAllConcepts(group, parentPath = []) {
    const results = []

    // 添加当前层级的概念
    if (group.concept && Array.isArray(group.concept)) {
        group.concept.forEach(conceptName => {
            results.push({
                name: conceptName,
                path: [...parentPath, group.name].filter(Boolean).join(' / '),
                groupName: group.name
            })
        })
    }

    // 递归处理子分组
    if (group.subgroup && Array.isArray(group.subgroup)) {
        group.subgroup.forEach(subgroup => {
            const subResults = extractAllConcepts(subgroup, [...parentPath, group.name])
            results.push(...subResults)
        })
    }

    return results
}

/**
 * 递归搜索匹配的节点 (板块或子板块)
 */
function searchMatchingNodes(node, keyword, parentPath = []) {
    const results = []
    const lowerKeyword = keyword.toLowerCase().trim()

    // 检查当前节点是否匹配
    const nodeNameMatch = node.name && node.name.toLowerCase().includes(lowerKeyword)
    const nodePinyin = getFirstLetters(node.name)
    const nodePinyinMatch = nodePinyin && nodePinyin.includes(lowerKeyword)

    if (nodeNameMatch || nodePinyinMatch) {
        // 找到匹配节点, 提取该节点下的所有概念
        const concepts = extractAllConcepts(node, parentPath)
        if (concepts.length > 0) {
            results.push({
                groupName: node.name,
                concepts: concepts,
                sort: node.sort || 999,
                isSubgroup: parentPath.length > 0 // 标记是否为子分组
            })
        }
    }

    // 递归搜索子分组
    if (node.subgroup && Array.isArray(node.subgroup)) {
        node.subgroup.forEach(subgroup => {
            const subResults = searchMatchingNodes(subgroup, keyword, [...parentPath, node.name])
            results.push(...subResults)
        })
    }

    return results
}

/**
 * 搜索板块 (支持按板块名称、子板块名称、拼音首字母搜索, 返回匹配节点下的概念列表)
 */
export function searchGroups(groups, keyword) {
    if (!keyword || !keyword.trim()) {
        return []
    }

    const matchedGroups = []

    groups.forEach(group => {
        const results = searchMatchingNodes(group, keyword)
        matchedGroups.push(...results)
    })

    // 按 sort 排序
    matchedGroups.sort((a, b) => a.sort - b.sort)

    return matchedGroups
}

/**
 * 搜索股票 (支持按名称、别名、代码、关键词、拼音首字母搜索)
 */
export function searchStocks(stocks, keyword) {
    if (!keyword || !keyword.trim()) {
        return stocks
    }

    const lowerKeyword = keyword.toLowerCase().trim()
    return stocks.filter(stock => {
        // 匹配股票名称
        if (stock.name) {
            if (stock.name.toLowerCase().includes(lowerKeyword)) {
                return true
            }
            // 匹配股票名称的拼音首字母
            const firstLetters = getFirstLetters(stock.name)
            if (firstLetters && firstLetters.includes(lowerKeyword)) {
                return true
            }
        }

        // 匹配股票别名
        if (stock.alias && Array.isArray(stock.alias) && stock.alias.length > 0) {
            for (const aliasName of stock.alias) {
                if (aliasName && aliasName.toLowerCase().includes(lowerKeyword)) {
                    return true
                }
                // 匹配股票别名的拼音首字母
                const aliasFirstLetters = getFirstLetters(aliasName)
                if (aliasFirstLetters && aliasFirstLetters.includes(lowerKeyword)) {
                    return true
                }
            }
        }

        // 匹配股票关键词
        if (stock.keywords && Array.isArray(stock.keywords) && stock.keywords.length > 0) {
            for (const keywordItem of stock.keywords) {
                if (keywordItem && keywordItem.toLowerCase().includes(lowerKeyword)) {
                    return true
                }
                // 匹配股票关键词的拼音首字母
                const keywordFirstLetters = getFirstLetters(keywordItem)
                if (keywordFirstLetters && keywordFirstLetters.includes(lowerKeyword)) {
                    return true
                }
            }
        }

        // 匹配股票代码
        const codes = stock.codes || []
        for (const codeObj of codes) {
            if (codeObj.region && codeObj.code) {
                const codeStr = `${ codeObj.region }:${ codeObj.code }`.toLowerCase()
                if (codeStr.includes(lowerKeyword)) {
                    return true
                }
            }
        }

        return false
    })
}

/**
 * 搜索概念 (支持按名称、别名、关键词、拼音首字母搜索)
 */
export function searchConcepts(concepts, keyword) {
    if (!keyword || !keyword.trim()) {
        return concepts
    }

    const lowerKeyword = keyword.toLowerCase().trim()
    return concepts.filter(concept => {
        try {
            // 匹配概念名称
            if (concept.name) {
                if (concept.name.toLowerCase().includes(lowerKeyword)) {
                    return true
                }
                // 匹配概念名称的拼音首字母
                const firstLetters = getFirstLetters(concept.name)
                if (firstLetters && firstLetters.includes(lowerKeyword)) {
                    return true
                }
            }

            // 匹配概念别名
            if (concept.alias && Array.isArray(concept.alias) && concept.alias.length > 0) {
                for (const alias of concept.alias) {
                    if (alias && alias.toLowerCase().includes(lowerKeyword)) {
                        return true
                    }
                    // 匹配概念别名的拼音首字母
                    const aliasFirstLetters = getFirstLetters(alias)
                    if (aliasFirstLetters && aliasFirstLetters.includes(lowerKeyword)) {
                        return true
                    }
                }
            }

            // 匹配概念关键词
            if (concept.keywords && Array.isArray(concept.keywords) && concept.keywords.length > 0) {
                for (const keyword of concept.keywords) {
                    if (keyword && keyword.toLowerCase().includes(lowerKeyword)) {
                        return true
                    }
                    // 匹配概念关键词的拼音首字母
                    const keywordFirstLetters = getFirstLetters(keyword)
                    if (keywordFirstLetters && keywordFirstLetters.includes(lowerKeyword)) {
                        return true
                    }
                }
            }

        } catch (error) {
            console.error('Error searching concept:', concept.name, error)
        }

        return false
    })
}

/**
 * 根据股票代码获取股票信息
 */
export function getStockByCode(stocks, code) {
    return stocks.find(stock => {
        const codes = stock.codes || []
        return codes.some(codeObj => codeObj.code === code)
    })
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

            // 概念中给股票的入选理由
            const conceptReasons = stockItem.reasons || []

            if (stock) {
                // 找到了股票详细信息
                const conceptInfo = stock.concepts?.find(c => c.name === conceptName)
                const stockReasons = conceptInfo?.reasons || []

                return {
                    ...stock,
                    conceptReasons: conceptReasons,
                    stockReasons: stockReasons
                }
            } else {
                // 没找到股票详细信息, 只返回概念中的股票信息
                return {
                    name: stockName,
                    codes: [],
                    description: '',
                    concepts: [],
                    remarks: [],
                    related: [],
                    conceptReasons: conceptReasons,
                    stockReasons: []
                }
            }
        })
}

/**
 * 获取关联概念的详细信息列表
 */
export function getRelatedConcepts(concepts, conceptName) {
    const concept = getConceptByName(concepts, conceptName)
    if (!concept || !concept.related) {
        return []
    }

    return concept.related.map(name => {
        const relatedConcept = getConceptByName(concepts, name)
        if (relatedConcept) {
            // 存在文件, 返回完整信息
            return {
                ...relatedConcept,
                exists: true
            }
        } else {
            // 不存在文件, 只返回名称
            return {
                name: name,
                exists: false
            }
        }
    })
}

/**
 * 获取关联股票的详细信息列表
 */
export function getRelatedStocks(stocks, stockName) {
    const stock = getStockByName(stocks, stockName)
    if (!stock || !stock.related) {
        return []
    }

    return stock.related.map(item => {
        const relatedStock = getStockByName(stocks, item.name)
        if (relatedStock) {
            // 存在文件, 返回完整信息
            return {
                ...relatedStock,
                relation: item.relation,
                exists: true
            }
        } else {
            // 不存在文件, 只返回名称和关系
            return {
                name: item.name,
                relation: item.relation,
                exists: false
            }
        }
    })
}
