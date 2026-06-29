const STOP_WORDS = new Set([
    'san', 'pham', 'thoi', 'trang', 'nam', 'nu', 'cho', 'va', 'voi',
    'cua', 'cao', 'cap', 'dep', 'mau', 'phong', 'cach', 'chinh', 'hang'
]);

function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenize(value) {
    return normalizeText(value)
        .split(' ')
        .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function buildPreferenceProfile(recentlyViewed) {
    const items = (Array.isArray(recentlyViewed) ? recentlyViewed : [])
        .filter((item) => item && typeof item === 'object')
        .slice(0, 10);
    const categoryWeights = new Map();
    const tokenWeights = new Map();
    const prices = [];
    const viewedIds = new Set();

    items.forEach((item, index) => {
        const recencyWeight = Math.max(1, items.length - index);
        const category = normalizeText(item.category);

        if (item.id !== undefined && item.id !== null) {
            viewedIds.add(String(item.id));
        }
        if (category) {
            categoryWeights.set(
                category,
                (categoryWeights.get(category) || 0) + recencyWeight
            );
        }
        for (const token of new Set(tokenize(item.title))) {
            tokenWeights.set(token, (tokenWeights.get(token) || 0) + recencyWeight);
        }

        const price = toNumber(item.price);
        if (price > 0) prices.push(price);
    });

    const averagePrice = prices.length
        ? prices.reduce((total, price) => total + price, 0) / prices.length
        : 0;

    return { categoryWeights, tokenWeights, averagePrice, viewedIds };
}

function scoreProduct(product, profile) {
    const category = normalizeText(product.category);
    const titleTokens = new Set(tokenize(product.title));
    let relevanceScore = (profile.categoryWeights.get(category) || 0) * 8;

    for (const token of titleTokens) {
        relevanceScore += (profile.tokenWeights.get(token) || 0) * 1.5;
    }

    const price = toNumber(product.price);
    let priceScore = 0;
    if (profile.averagePrice > 0 && price > 0) {
        const ratio = Math.max(price, profile.averagePrice) /
            Math.min(price, profile.averagePrice);
        priceScore = Math.max(0, 5 - Math.log2(ratio) * 2);
    }

    const popularityScore =
        Math.log1p(toNumber(product.sold)) * 1.5 +
        Math.log1p(toNumber(product.views)) * 0.5 +
        toNumber(product.rating) * 0.8 +
        Math.log1p(toNumber(product.reviewCount)) * 0.3;

    return relevanceScore + priceScore + popularityScore;
}

function recommendProductIds(products, recentlyViewed, limit = 4) {
    const profile = buildPreferenceProfile(recentlyViewed);

    return (Array.isArray(products) ? products : [])
        .filter((product) =>
            product &&
            product.id !== undefined &&
            !profile.viewedIds.has(String(product.id))
        )
        .map((product) => ({
            id: product.id,
            score: scoreProduct(product, profile),
            sold: toNumber(product.sold),
            views: toNumber(product.views)
        }))
        .sort((a, b) =>
            b.score - a.score ||
            b.sold - a.sold ||
            b.views - a.views ||
            toNumber(a.id) - toNumber(b.id)
        )
        .slice(0, Math.max(0, limit))
        .map(({ id }) => id);
}

module.exports = { recommendProductIds };
