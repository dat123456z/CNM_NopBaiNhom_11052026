import LineIcon from "../../components/LineIcon";
import AdminCard, { AdminStatCard } from "../../components/admin/AdminCard";

const AdminRoles = ({ users }) => {
    const admins = users.filter((user) => ["admin", "manager"].includes(user.role));

    return (
        <div className="space-y-6">
            <div>
                <p className="text-2xl font-black">Role & Permission Management</p>
                <p className="text-xs text-slate-500 mt-1">Review system access levels and administrative accounts.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <AdminStatCard icon={<LineIcon name="shield" size={18} />} label="Total Roles" value="4" />
                <AdminStatCard icon={<LineIcon name="users" size={18} />} label="Admin Users" value={admins.length} tone="red" />
                <AdminStatCard icon={<LineIcon name="eye" size={18} />} label="Active Sessions" value={users.filter((u) => u.isActive).length} />
                <AdminStatCard icon={<LineIcon name="alert" size={18} />} label="Auth Failures" value="0.02%" />
            </div>
            <AdminCard className="p-5">
                <p className="font-black">Administrative Users</p>
                <div className="mt-4 space-y-3">
                    {admins.map((user) => (
                        <div key={user.id} className="rounded-lg border border-slate-200 p-4 flex justify-between">
                            <div>
                                <p className="font-bold">{user.name}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                            <span className="text-xs font-black text-blue-600">{user.role}</span>
                        </div>
                    ))}
                </div>
            </AdminCard>
        </div>
    );
};

export default AdminRoles;
