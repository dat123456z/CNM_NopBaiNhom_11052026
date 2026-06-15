import LineIcon from "../../components/LineIcon";
import AdminCard, { AdminStatCard } from "../../components/admin/AdminCard";
import Pagination, { usePagination } from "../../components/Pagination";

const AdminRoles = ({ users }) => {
    const admins = users.filter((user) => ["admin", "manager"].includes(user.role));
    const {
        currentPage,
        pageItems: pagedAdmins,
        setCurrentPage,
        totalPages,
    } = usePagination(admins);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-2xl font-black">Quản lý vai trò và phân quyền</p>
                <p className="text-xs text-slate-500 mt-1">Kiểm tra cấp truy cập hệ thống và các tài khoản quản trị.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <AdminStatCard icon={<LineIcon name="shield" size={18} />} label="Tổng vai trò" value="4" />
                <AdminStatCard icon={<LineIcon name="users" size={18} />} label="Tài khoản quản trị" value={admins.length} tone="red" />
                <AdminStatCard icon={<LineIcon name="eye" size={18} />} label="Phiên hoạt động" value={users.filter((u) => u.isActive).length} />
                <AdminStatCard icon={<LineIcon name="alert" size={18} />} label="Lỗi xác thực" value="0.02%" />
            </div>
            <AdminCard className="p-5">
                <p className="font-black">Người dùng quản trị</p>
                <div className="mt-4 space-y-3">
                    {pagedAdmins.map((user) => (
                        <div key={user.id} className="rounded-lg border border-slate-200 p-4 flex justify-between">
                            <div>
                                <p className="font-bold">{user.name}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                            <span className="text-xs font-black text-blue-600">{user.role}</span>
                        </div>
                    ))}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalItems={admins.length}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </AdminCard>
        </div>
    );
};

export default AdminRoles;
