// 导航工具函数
import { useRouter } from 'vue-router'

/**
 * 跳转到股票详情页
 * @param {Object} router - Vue Router 实例
 * @param {Array} allStocks - 所有股票数据
 * @param {string} name - 股票名称
 * @param {string} code - 股票代码 - 可选
 */
export function goToStockDetail(router, allStocks, name, code) {
    // 检查是否有同名股票
    const matchedStocks = allStocks.filter(s => s.name === name)

    if (matchedStocks.length > 1) {
        // 有多个同名股票, 必须带 identifier
        if (!code) {
            console.error(`有多个 "${ name }" 同名股票, 必须指定股票代码`)
            return
        }
        const stock = matchedStocks.find(s => {
            const codes = s.codes || []
            return codes.some(c => c.code === code)
        })
        if (stock && stock.codes && stock.codes.length > 0) {
            const firstCode = stock.codes[0]
            router.push(`/stock/${ encodeURIComponent(name) }/${ firstCode.region }-${ firstCode.code }`)
        }
    } else if (matchedStocks.length === 1) {
        // 只有一个, 直接跳转
        router.push(`/stock/${ encodeURIComponent(name) }`)
    }
}

/**
 * 跳转到概念详情页
 * @param {Object} router - Vue Router 实例
 * @param {string} name - 概念名称
 */
export function goToConceptDetail(router, name) {
    router.push(`/concept/${ encodeURIComponent(name) }`)
}
