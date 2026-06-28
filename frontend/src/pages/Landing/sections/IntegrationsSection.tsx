import React from "react";
import { Link2, Database, Globe, RefreshCw, Plug, Shield } from "lucide-react";

const integrations = [
  {
    name: "Canvas LMS",
    description: "Seamless integration with Instructure Canvas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Canvas_LMS_logo.svg/200px-Canvas_LMS_logo.svg.png",
    status: "Connected",
    statusColor: "emerald",
  },
  {
    name: "Moodle",
    description: "Open-source learning platform",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Moodle_logo.svg/200px-Moodle_logo.svg.png",
    status: "Connected",
    statusColor: "emerald",
  },
  {
    name: "Blackboard",
    description: "Enterprise learning management",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Blackboard_Logo.svg/200px-Blackboard_Logo.svg.png",
    status: "Connected",
    statusColor: "emerald",
  },
  {
    name: "Google Classroom",
    description: "Google Workspace integration",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Google_Classroom_logo.svg/200px-Google_Classroom_logo.svg.png",
    status: "Coming Soon",
    statusColor: "amber",
  },
  {
    name: "Microsoft Teams",
    description: "Education & collaboration",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/200px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png",
    status: "Coming Soon",
    statusColor: "amber",
  },
  {
    name: "Brightspace",
    description: "D2L learning platform",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Brightspace_logo.svg/200px-Brightspace_logo.svg.png",
    status: "Coming Soon",
    statusColor: "amber",
  },
];

const features = [
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "Auto-sync",
    description: "Grades and results sync automatically to your LMS gradebook",
  },
  {
    icon: <Plug className="w-5 h-5" />,
    title: "SSO Integration",
    description: "Single sign-on with SAML 2.0 and OAuth 2.0 protocols",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Data Security",
    description: "GDPR compliant with end-to-end encryption",
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "API Access",
    description: "RESTful API for custom integrations and webhooks",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Multi-language",
    description: "Support for 20+ languages and localization",
  },
  {
    icon: <Link2 className="w-5 h-5" />,
    title: "Webhooks",
    description: "Real-time event notifications for your systems",
  },
];

const IntegrationsSection: React.FC = () => {
  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
              Integrations
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Works with your existing tools
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            EXMORA integrates seamlessly with popular learning management systems, authentication providers, and third-party tools.
          </p>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="group relative bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
            >
              {/* Status Badge */}
              <div
                className={`absolute -top-2 -right-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  integration.statusColor === "emerald"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {integration.status}
              </div>

              {/* Logo placeholder */}
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <span className="text-lg font-bold text-gray-400">
                  {integration.name.charAt(0)}
                </span>
              </div>

              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {integration.name}
              </h4>
              <p className="text-xs text-gray-500">
                {integration.description}
              </p>
            </div>
          ))}
        </div>

        {/* Integration Features */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center group"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                {feature.icon}
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {feature.title}
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need a custom integration?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            <Plug className="w-4 h-4" />
            Request Integration
          </a>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
