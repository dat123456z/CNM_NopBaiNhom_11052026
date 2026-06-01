const normalizeProductArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.data)) return data.data;
    return [];
};

const dedupeById = (products) => {
    const seen = new Set();
    return products.filter((product) => {
        if (!product || seen.has(product.id)) return false;
        seen.add(product.id);
        return true;
    });
};

export const fetchAllProducts = async ({ apiBase, signal, headers = {}, pageSize = 100 }) => {
    const allProducts = [];
    let page = 1;
    let total = null;

    while (true) {
        const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
        const res = await fetch(`${apiBase}/api/products?${params.toString()}`, {
            signal,
            headers
        });

        if (!res.ok) {
            const error = new Error("Không tải được danh sách sản phẩm");
            error.status = res.status;
            throw error;
        }

        const payload = await res.json();
        const products = normalizeProductArray(payload);

        if (total == null && Number.isFinite(Number(payload?.total))) {
            total = Number(payload.total);
        }

        if (products.length === 0) break;

        allProducts.push(...products);

        const reachedKnownTotal = total != null && allProducts.length >= total;
        const reachedLastPage = products.length < pageSize;
        if (reachedKnownTotal || reachedLastPage) break;

        page += 1;
    }

    return dedupeById(allProducts);
};
