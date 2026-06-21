const VendorFooter = () => (
    <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <span className="font-bold text-gray-700">Trung tâm người bán UTEShop</span>
            <span>© {new Date().getFullYear()} UTEShop. Quản lý bán hàng tập trung.</span>
            <div className="flex gap-4">
                <a href="#" className="hover:text-gray-700 transition-colors">Hỗ trợ shop</a>
                <a href="#" className="hover:text-gray-700 transition-colors">Chính sách bán hàng</a>
            </div>
        </div>
    </footer>
);

export default VendorFooter;
