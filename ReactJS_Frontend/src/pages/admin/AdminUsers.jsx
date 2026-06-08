import AdminCard from "../../components/admin/AdminCard";

const AdminUsers = ({ users, onSetUserStatus }) => {
    const customerUsers = users.filter((user) => user.role === "user");

    return (
        <div className="space-y-6">
            <div>
                <p className="text-2xl font-black">User Management</p>
                <p className="text-xs text-slate-500 mt-1">Manage customer accounts and access state.</p>
            </div>
            <AdminCard className="overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
                        <tr>
                            <th className="px-5 py-3">User</th>
                            <th>Status</th>
                            <th>Points</th>
                            <th className="text-right pr-5">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {customerUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="px-5 py-4 font-bold">
                                    {user.name}
                                    <p className="text-[10px] text-slate-400">{user.email}</p>
                                </td>
                                <td>
                                    <span className={`rounded-full px-2 py-1 text-[10px] font-black ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                        {user.isActive ? "Active" : "Locked"}
                                    </span>
                                </td>
                                <td>{user.points || 0}</td>
                                <td className="text-right pr-5">
                                    <button onClick={() => onSetUserStatus(user.id, !user.isActive)} className="text-xs font-bold text-red-600 hover:underline">
                                        {user.isActive ? "Lock" : "Unlock"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {customerUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-5 py-10 text-center text-sm font-bold text-slate-400">
                                    No customer users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </AdminCard>
        </div>
    );
};

export default AdminUsers;
