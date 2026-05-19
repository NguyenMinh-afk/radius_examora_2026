import React from "react";

interface UserRow {
  avatarUrl?: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActivity: string;
}

interface UserTableProps {
  users: UserRow[];
}

const UserTable: React.FC<UserTableProps> = ({ users }) => (
  <div className="bg-white rounded-xl shadow border p-4 mt-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
      <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Add New User</button>
    </div>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-500 border-b">
          <th className="py-2 text-left">User</th>
          <th className="py-2 text-left">Role</th>
          <th className="py-2 text-left">Status</th>
          <th className="py-2 text-left">Last Activity</th>
          <th className="py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, idx) => (
          <tr key={idx} className="border-b last:border-0">
            <td className="py-2 flex items-center gap-2">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                  {user.name[0]}
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
            </td>
            <td className="py-2">
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">{user.role}</span>
            </td>
            <td className="py-2">
              <span className={`text-xs font-medium ${user.status === "Active" ? "text-green-600" : "text-gray-400"}`}>{user.status}</span>
            </td>
            <td className="py-2 text-xs text-gray-500">{user.lastActivity}</td>
            <td className="py-2">
              <button className="text-blue-600 hover:underline text-xs">Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default UserTable;
