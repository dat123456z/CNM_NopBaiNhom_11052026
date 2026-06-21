import { useState } from "react";
import AdminCard from "../../components/admin/AdminCard";
import Pagination, { usePagination } from "../../components/Pagination";

const ROLE_OPTIONS = [
    { value: "user", label: "Người dùng" },
    { value: "vendor", label: "Nhà bán hàng" },
    { value: "manager", label: "Quản lý" },
    { value: "admin", label: "Admin" },
];

const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    role: "user",
};

const getRoleLabel = (role) => ROLE_OPTIONS.find((item) => item.value === role)?.label || role;

const AdminUsers = ({ users, onSetUserStatus, onCreateUser, creatingUser }) => {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [showCreateForm, setShowCreateForm] = useState(false);
    const {
        currentPage,
        pageItems: pagedUsers,
        setCurrentPage,
        totalPages,
    } = usePagination(users);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const nextErrors = {};
        const email = formData.email.trim().toLowerCase();

        if (!formData.name.trim()) nextErrors.name = "Vui lòng nhập họ tên.";
        else if (formData.name.trim().length < 2) nextErrors.name = "Họ tên tối thiểu 2 ký tự.";

        if (!email) nextErrors.email = "Vui lòng nhập email.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Email không hợp lệ.";

        if (!formData.phone.trim()) nextErrors.phone = "Vui lòng nhập số điện thoại.";
        else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone.trim())) {
            nextErrors.phone = "Số điện thoại không hợp lệ (10 chữ số).";
        }

        if (!formData.password) nextErrors.password = "Vui lòng nhập mật khẩu.";
        else if (formData.password.length < 6) nextErrors.password = "Mật khẩu tối thiểu 6 ký tự.";

        if (!formData.confirmPassword) nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
        else if (formData.password !== formData.confirmPassword) {
            nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
        }

        if (!formData.address.trim()) nextErrors.address = "Vui lòng nhập địa chỉ.";
        if (!ROLE_OPTIONS.some((role) => role.value === formData.role)) nextErrors.role = "Vai trò không hợp lệ.";

        return nextErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (creatingUser) return;

        const nextErrors = validate();
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        const ok = await onCreateUser({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            password: formData.password,
            address: formData.address.trim(),
            role: formData.role,
        });

        if (ok) {
            setFormData(EMPTY_FORM);
            setErrors({});
            setShowCreateForm(false);
        }
    };

    const fieldClass = (name) =>
        `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 ${errors[name] ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-2xl font-black">Quản lý người dùng</p>
                    <p className="text-xs text-slate-500 mt-1">Tạo tài khoản mới và quản lý trạng thái truy cập.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCreateForm((value) => !value)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-black text-white transition hover:bg-red-700"
                >
                    {showCreateForm ? "Đóng form" : "Tạo tài khoản"}
                </button>
            </div>

            {showCreateForm && <AdminCard className="p-5">
                <div className="mb-4">
                    <p className="text-lg font-black">Thêm người dùng</p>
                    <p className="text-xs text-slate-500 mt-1">Nhập thông tin như biểu mẫu đăng ký và chọn vai trò cho tài khoản.</p>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <label className="space-y-1">
                        <span className="text-xs font-bold text-slate-500">Họ và tên</span>
                        <input className={fieldClass("name")} name="name" value={formData.name} onChange={handleChange} placeholder="Nguyễn Văn A" />
                        {errors.name && <span className="text-xs font-bold text-rose-600">{errors.name}</span>}
                    </label>

                    <label className="space-y-1">
                        <span className="text-xs font-bold text-slate-500">Email</span>
                        <input className={fieldClass("email")} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="example@hcmute.edu.vn" />
                        {errors.email && <span className="text-xs font-bold text-rose-600">{errors.email}</span>}
                    </label>

                    <label className="space-y-1">
                        <span className="text-xs font-bold text-slate-500">Số điện thoại</span>
                        <input className={fieldClass("phone")} name="phone" value={formData.phone} onChange={handleChange} placeholder="0912345678" />
                        {errors.phone && <span className="text-xs font-bold text-rose-600">{errors.phone}</span>}
                    </label>

                    <label className="space-y-1">
                        <span className="text-xs font-bold text-slate-500">Mật khẩu</span>
                        <input className={fieldClass("password")} name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Tối thiểu 6 ký tự" />
                        {errors.password && <span className="text-xs font-bold text-rose-600">{errors.password}</span>}
                    </label>

                    <label className="space-y-1">
                        <span className="text-xs font-bold text-slate-500">Xác nhận mật khẩu</span>
                        <input className={fieldClass("confirmPassword")} name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" />
                        {errors.confirmPassword && <span className="text-xs font-bold text-rose-600">{errors.confirmPassword}</span>}
                    </label>

                    <label className="space-y-1">
                        <span className="text-xs font-bold text-slate-500">Vai trò</span>
                        <select className={fieldClass("role")} name="role" value={formData.role} onChange={handleChange}>
                            {ROLE_OPTIONS.map((role) => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                        {errors.role && <span className="text-xs font-bold text-rose-600">{errors.role}</span>}
                    </label>

                    <label className="space-y-1 md:col-span-2">
                        <span className="text-xs font-bold text-slate-500">Địa chỉ</span>
                        <input className={fieldClass("address")} name="address" value={formData.address} onChange={handleChange} placeholder="VD: 123 Lê Lợi, Phường 1, Quận 1, TP.HCM" />
                        {errors.address && <span className="text-xs font-bold text-rose-600">{errors.address}</span>}
                    </label>

                    <div className="flex items-end">
                        <button type="submit" disabled={creatingUser} className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                            {creatingUser ? "Đang tạo..." : "Tạo tài khoản"}
                        </button>
                    </div>
                </form>
            </AdminCard>}

            <AdminCard className="overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
                        <tr>
                            <th className="px-5 py-3">Người dùng</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Điểm</th>
                            <th className="text-right pr-5">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pagedUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="px-5 py-4 font-bold">
                                    {user.name}
                                    <p className="text-[10px] text-slate-400">{user.email}</p>
                                </td>
                                <td>
                                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700">
                                        {getRoleLabel(user.role)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`rounded-full px-2 py-1 text-[10px] font-black ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                        {user.isActive ? "Hoạt động" : "Đã khóa"}
                                    </span>
                                </td>
                                <td>{user.points || 0}</td>
                                <td className="text-right pr-5">
                                    <button onClick={() => onSetUserStatus(user.id, !user.isActive)} className="text-xs font-bold text-red-600 hover:underline">
                                        {user.isActive ? "Khóa" : "Mở khóa"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-5 py-10 text-center text-sm font-bold text-slate-400">
                                    Không tìm thấy tài khoản nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Pagination
                    currentPage={currentPage}
                    totalItems={users.length}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </AdminCard>
        </div>
    );
};

export default AdminUsers;
