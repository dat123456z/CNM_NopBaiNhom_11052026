import LineIcon from "../../components/LineIcon";
import AdminCard, { AdminStatCard } from "../../components/admin/AdminCard";

const AdminRoles = ({ users }) => {
    const admins = users.filter((user) => ["admin", "manager"].includes(user.role));
    const rows = [
        ["Inventory Management", ["admin", "manager", "vendor"]],
        ["User Management", ["admin"]],
        ["Financial Reporting", ["admin", "manager"]],
        ["System Config", ["admin"]],
    ];
    const roles = ["admin", "manager", "user", "vendor"];

    return (
        <div className="space-y-6">
            <div><p className="text-2xl font-black">Role & Permission Management</p><p className="text-xs text-slate-500 mt-1">Configure system access levels and granular capabilities.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <AdminStatCard icon={<LineIcon name="shield" size={18} />} label="Total Roles" value="4" sub="+2 new rules added" />
                <AdminStatCard icon={<LineIcon name="users" size={18} />} label="Admin Users" value={admins.length} sub="account locked" tone="red" />
                <AdminStatCard icon={<LineIcon name="eye" size={18} />} label="Active Sessions" value={users.filter((u) => u.isActive).length} />
                <AdminStatCard icon={<LineIcon name="alert" size={18} />} label="Auth Failures" value="0.02%" />
            </div>
            <AdminCard className="overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between"><p className="font-black">Permission Matrix</p><button className="rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white">Save Changes</button></div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="px-5 py-3">Modules / Operations</th>{roles.map((role) => <th key={role}>{role}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100">{rows.map(([label, allowed]) => <tr key={label}><td className="px-5 py-4 font-bold">{label}</td>{roles.map((role) => <td key={role}>{allowed.includes(role) ? "●" : "○"}</td>)}</tr>)}</tbody>
                </table>
            </AdminCard>
            <AdminCard className="p-5">
                <p className="font-black">Administrative Users</p>
                <div className="mt-4 space-y-3">{admins.map((user) => <div key={user.id} className="rounded-lg border border-slate-200 p-4 flex justify-between"><div><p className="font-bold">{user.name}</p><p className="text-xs text-slate-400">{user.email}</p></div><span className="text-xs font-black text-blue-600">{user.role}</span></div>)}</div>
            </AdminCard>
        </div>
    );
};

export default AdminRoles;
