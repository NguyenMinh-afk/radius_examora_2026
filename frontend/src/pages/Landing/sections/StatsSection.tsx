import React from "react";

const stats = [
  { value: "10,000+", label: "Questions Generated", trend: "+12% this month" },
  { value: "500+", label: "Active Institutions", trend: "Growing community" },
  { value: "99.9%", label: "Uptime SLA", trend: "Enterprise-grade" },
  { value: "50,000+", label: "Exams Conducted", trend: "+8K this year" },
];

const StatsSection: React.FC = () => {
  return (
    <section className="px-6 py-20 bg-[#F8FAFC] border-y border-gray-200/60">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10">
          {stats.map((stat) => (
            <div key={stat.label} className="relative group">
              <div className="absolute -inset-px bg-gradient-to-b from-blue-600/10 to-indigo-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white rounded-2xl p-6 text-center border border-gray-200/50 shadow-sm">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  {stat.trend}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
