import React from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import UserTable from "../../../components/admin/UserTable";

import { Mail, Activity, Clock, UserCheck, CircleDot, User } from "lucide-react";

const mockUsers = [
  {
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Marcus Sterling",
    email: "marcus@exmora.io",
    role: "INITIAL_ADMIN",
    status: "Active",
    lastActivity: "2 mins ago",
  },
  {
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Elena Rodriguez",
    email: "elena@exmora.io",
    role: "AI_MODEL_OPS",
    status: "Active",
    lastActivity: "14 mins ago",
  },
  {
    avatarUrl: "https://randomuser.me/api/portraits/men/12.jpg",
    name: "Julian Smith",
    email: "julian@exmora.io",
    role: "OFFICE",
    status: "Offline",
    lastActivity: "3 hours ago",
  },
];

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <a
            href="#"
            className="text-xl font-semibold text-blue-700 hover:underline"
          >
            Infrastructure Dashboard
          </a>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search systems..."
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />

            <button className="relative">
              <Mail className="text-gray-400" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                3
              </span>
            </button>

            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="avatar"
              className="w-9 h-9 rounded-full border-2 border-blue-500"
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Left Section */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* System Health */}
            <div className="bg-white rounded-2xl shadow border p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    SYSTEM OPERATIONAL
                  </span>
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                  Infrastructure Health: 99.98%
                </h2>

                <p className="text-gray-500 max-w-md mb-4">
                  AI core systems and messaging queues are performing within
                  optimal latency parameters.
                </p>

                <div className="flex gap-3">
                  <button className="bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 text-sm hover:bg-blue-800 transition">
                    Run Diagnostics
                  </button>

                  <button className="text-blue-700 font-semibold rounded-lg px-4 py-2 text-sm hover:underline">
                    View Node Map
                  </button>
                </div>
              </div>

              <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
                <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
                  <ellipse cx="80" cy="60" rx="80" ry="60" fill="#3B82F6" />
                </svg>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div className="bg-white rounded-xl border shadow p-4">
                <div className="flex items-center gap-2 text-green-600 font-bold text-xs mb-1">
                  <Activity size={16} />
                  RABBITMQ ACTIVE
                </div>

                <div className="text-2xl font-bold">4,281</div>
                <div className="text-xs text-green-600">↗ 12% vs last hour</div>
              </div>

              <div className="bg-white rounded-xl border shadow p-4">
                <div className="flex items-center gap-2 text-yellow-600 font-bold text-xs mb-1">
                  <Clock size={16} />
                  RABBITMQ PENDING
                </div>

                <div className="text-2xl font-bold">142</div>
                <div className="text-xs text-gray-400">Steady state</div>
              </div>

              <div className="bg-white rounded-xl border shadow p-4">
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs mb-1">
                  <Mail size={16} />
                  DEAD-LETTER
                </div>

                <div className="text-2xl font-bold">3</div>
                <div className="text-xs text-red-500">
                  Manual retry required
                </div>
              </div>

              <div className="bg-white rounded-xl border shadow p-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs mb-1">
                  <UserCheck size={16} />
                  NEW USERS
                </div>

                <div className="text-2xl font-bold">+842</div>
                <div className="text-xs text-blue-600">Last 24 hours</div>
              </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-2xl shadow border p-6">
              <div className="flex items-center justify-between mb-4">

                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    User Management
                  </h3>
                  <span className="text-xs text-gray-400">
                    Manage platform roles and access
                  </span>
                </div>

                <div className="flex gap-2">
                  <button className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 flex items-center gap-1 hover:bg-slate-50">
                    <CircleDot size={14} />
                    Filter
                  </button>

                  <button className="bg-blue-700 text-white rounded-lg px-3 py-1.5 text-sm font-semibold flex items-center gap-1 hover:bg-blue-800">
                    <User size={14} />
                    Add New User
                  </button>
                </div>

              </div>

              <UserTable users={mockUsers} />
            </div>

          </div>

          {/* Right Section */}
          <div className="flex flex-col gap-8">

            {/* Live Traffic */}
            <div className="bg-white rounded-2xl shadow border p-6">

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">
                  LIVE TRAFFIC
                </span>
                <span className="text-xs text-blue-700 font-bold">
                  Active Requests
                </span>
              </div>

              <div className="text-2xl font-bold text-blue-700 mb-3">
                12.4k/s
              </div>

              <div className="flex items-center gap-2">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  className="w-6 h-6 rounded-full border-2 border-white"
                />
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  className="w-6 h-6 rounded-full border-2 border-white -ml-2"
                />

                <span className="text-xs text-gray-400 ml-2">
                  +3 admins monitoring
                </span>
              </div>

            </div>

            {/* AI Model Performance */}
            <div className="bg-white rounded-2xl shadow border p-6">

              <h3 className="text-base font-bold text-gray-900 mb-4">
                AI Model Performance
              </h3>

              <div className="space-y-4">

                <div className="flex items-center justify-between">
                  <span>GPT-4_PROCTOR_V2</span>

                  <div className="w-2/3 bg-gray-100 rounded-full h-2 mx-4">
                    <div
                      className="bg-blue-700 h-2 rounded-full"
                      style={{ width: "80%" }}
                    />
                  </div>

                  <span className="text-xs text-gray-500">145ms</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>BERTA_EVAL_XL</span>

                  <div className="w-2/3 bg-gray-100 rounded-full h-2 mx-4">
                    <div
                      className="bg-blue-400 h-2 rounded-full"
                      style={{ width: "60%" }}
                    />
                  </div>

                  <span className="text-xs text-gray-500">312ms</span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
