import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const VendorSettings = ({ shop, onShopUpdate }) => {
    const [shopForm, setShopForm] = useState({
        name: shop?.name || "",
        description: shop?.description || "",
        address: shop?.address || "",
        phone: shop?.phone || ""
    });
    const [logoFile, setLogoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(
        shop?.logo
            ? (shop.logo.startsWith("http") ? shop.logo : `${API_URL}${shop.logo}`)
            : ""
    );
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Ảnh logo không được vượt quá 2MB.");
                e.target.value = "";
                return;
            }
            setLogoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        const token = localStorage.getItem("accessToken");
        try {
            const formData = new FormData();
            formData.append("name", shopForm.name);
            formData.append("description", shopForm.description);
            formData.append("address", shopForm.address);
            formData.append("phone", shopForm.phone);
            if (logoFile) {
                formData.append("logo", logoFile);
            }

            const res = await fetch(`${API_URL}/api/shops/me`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Cập nhật thất bại.");
            if (onShopUpdate) onShopUpdate(data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-gray-900">Cấu hình thông tin gian hàng</h1>

            <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-left max-w-2xl">
                {success && (
                    <div className="p-4 bg-green-50 text-green-600 border border-green-100 rounded-2xl text-xs font-semibold">
                        Cập nhật thông tin shop thành công!
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Logo cửa hàng</label>
                        <div className="flex items-center gap-4 mt-1.5">
                            <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-xs">No Logo</span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Tên cửa hàng</label>
                        <input
                            type="text"
                            value={shopForm.name}
                            onChange={(e) => setShopForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Mô tả gian hàng</label>
                        <textarea
                            value={shopForm.description}
                            onChange={(e) => setShopForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f] resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Địa chỉ gian hàng</label>
                        <input
                            type="text"
                            value={shopForm.address}
                            onChange={(e) => setShopForm(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Số điện thoại liên hệ</label>
                        <input
                            type="text"
                            value={shopForm.phone}
                            onChange={(e) => setShopForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f]"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3.5 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
            </form>
        </div>
    );
};

export default VendorSettings;
