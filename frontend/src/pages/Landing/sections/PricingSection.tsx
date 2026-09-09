import React, { useState } from "react";
import { useTheme } from "../../../contexts/useTheme";
import { Check, X, Sparkles, Zap, Building, Users, ArrowRight, HelpCircle } from "lucide-react";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  notIncluded: string[];
  cta: string;
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  badge?: string;
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Perfect for individual teachers getting started with AI-powered exams.",
    features: [
      "Up to 100 AI-generated questions/month",
      "Basic question bank (500 questions)",
      "Simple exam creation",
      "Email support",
      "Standard analytics",
      "Mobile-responsive exams",
    ],
    notIncluded: [
      "LMS integration",
      "Advanced anti-cheat",
      "Custom branding",
      "Priority support",
    ],
    cta: "Start Free",
    icon: <Sparkles className="w-6 h-6" />,
    color: "emerald",
    bgGradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "Educator",
    price: "$29",
    period: "/month",
    description: "For teachers and small departments ready to scale their examinations.",
    features: [
      "Unlimited AI-generated questions",
      "Question bank with 10,000 questions",
      "Advanced exam builder",
      "LMS integration (Canvas, Moodle)",
      "Basic anti-cheat features",
      "Email & chat support",
      "Detailed analytics dashboard",
      "Student progress tracking",
    ],
    notIncluded: [
      "Advanced anti-cheat proctoring",
      "Custom branding",
      "Dedicated account manager",
    ],
    cta: "Start Trial",
    popular: true,
    icon: <Zap className="w-6 h-6" />,
    color: "blue",
    bgGradient: "from-blue-600 to-indigo-600",
    badge: "Most Popular",
  },
  {
    name: "Institution",
    price: "$99",
    period: "/month",
    description: "Comprehensive solution for universities and large educational organizations.",
    features: [
      "Everything in Educator",
      "Unlimited question bank",
      "AI proctoring & monitoring",
      "SSO/OAuth 2.0 integration",
      "Advanced anti-cheat suite",
      "Custom branding",
      "API access",
      "Priority phone support",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    icon: <Building className="w-6 h-6" />,
    color: "violet",
    bgGradient: "from-violet-600 to-purple-600",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored solution for organizations with unique requirements and scale.",
    features: [
      "Everything in Institution",
      "White-label solution",
      "On-premise deployment option",
      "Custom AI model training",
      "Advanced integrations",
      "SLA 99.99% uptime",
      "24/7 dedicated support",
      "Quarterly business reviews",
      "Custom development",
    ],
    notIncluded: [],
    cta: "Contact Us",
    icon: <Users className="w-6 h-6" />,
    color: "slate",
    bgGradient: "from-slate-700 to-slate-900",
  },
];

const faqItems = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Absolutely! Both Educator and Institution plans include a 14-day free trial with full access to all features.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, PayPal, and wire transfers for annual plans. Enterprise customers can pay via invoice.",
  },
  {
    q: "How does the AI question generation work?",
    a: "EXAMORA uses advanced language models to generate questions based on your input topics, curriculum standards, and desired Bloom's taxonomy levels.",
  },
];

const colorMap: Record<string, { 
  light: { bg: string; text: string; border: string; badge: string };
  dark: { bg: string; text: string; border: string; badge: string };
}> = {
  emerald: { 
    light: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
    dark: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", badge: "bg-emerald-500/20 text-emerald-300" },
  },
  blue: { 
    light: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
    dark: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", badge: "bg-blue-500/20 text-blue-300" },
  },
  violet: { 
    light: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", badge: "bg-violet-100 text-violet-700" },
    dark: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20", badge: "bg-violet-500/20 text-violet-300" },
  },
  slate: { 
    light: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", badge: "bg-slate-200 text-slate-700" },
    dark: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20", badge: "bg-slate-500/20 text-slate-300" },
  },
};

const PricingSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <section id="pricing" className={`px-6 py-24 ${isDark ? "" : "bg-[#F8FAFC]"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full mb-4 ${
            isDark ? "bg-indigo-500/10 border-indigo-500/20" : "bg-blue-50 border-blue-100"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isDark ? "bg-indigo-400" : "bg-blue-500"
            }`} />
            <span className={`text-xs font-semibold tracking-wider uppercase ${
              isDark ? "text-indigo-400" : "text-blue-600"
            }`}>
              Pricing
            </span>
          </div>
          <h2 className={`text-3xl lg:text-4xl font-bold mb-3 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Simple, transparent pricing
          </h2>
          <p className={`max-w-xl mx-auto mb-8 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}>
            Choose the plan that fits your needs. All plans include our core AI examination features.
          </p>

          {/* Billing Toggle */}
          <div className={`inline-flex items-center gap-3 rounded-full p-1 shadow-sm ${
            isDark ? "bg-slate-800 border border-white/10" : "bg-white border border-gray-200"
          }`}>
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                billingCycle === "monthly"
                  ? isDark ? "bg-indigo-600 text-white shadow-md" : "bg-blue-600 text-white shadow-md"
                  : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? isDark ? "bg-indigo-600 text-white shadow-md" : "bg-blue-600 text-white shadow-md"
                  : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
              }`}>
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((plan) => {
            const colors = colorMap[plan.color][isDark ? "dark" : "light"];
            const price = billingCycle === "yearly" && plan.price !== "Custom"
              ? `$${Math.round(parseInt(plan.price.replace("$", "")) * 0.8)}`
              : plan.price;

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  plan.popular 
                    ? isDark 
                      ? "border-indigo-500/50 shadow-xl shadow-indigo-500/10" 
                      : "border-blue-300 shadow-xl shadow-blue-100"
                    : isDark
                      ? "border-white/10 shadow-sm hover:border-indigo-500/30"
                      : "border-gray-200 shadow-sm hover:border-gray-300"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className={`bg-gradient-to-r text-white text-center text-xs font-bold py-1.5 tracking-wide ${
                      isDark ? "from-indigo-600 to-violet-600" : "from-blue-600 to-indigo-600"
                    }`}>
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className={`p-6 ${plan.popular ? (isDark ? "pt-10" : "pt-10") : ""}`}>
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center`}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                      {plan.badge && !plan.popular && (
                        <span className={`text-xs ${colors.badge} px-2 py-0.5 rounded-full`}>
                          {plan.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{price}</span>
                    {plan.period && <span className={isDark ? "text-gray-500" : "text-gray-500"}>{plan.period}</span>}
                  </div>

                  <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{plan.description}</p>

                  {/* CTA Button */}
                  <a
                    href={plan.name === "Enterprise" ? "/contact" : "/register"}
                    className={`w-full block text-center py-3 rounded-xl font-semibold transition-all duration-200 mb-6 ${
                      plan.popular
                        ? isDark
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5"
                        : isDark
                          ? "bg-slate-700 text-gray-200 hover:bg-slate-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {plan.cta}
                  </a>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                        <span className={isDark ? "text-gray-400" : "text-gray-600"}>{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm opacity-50">
                        <X className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                        <span className={isDark ? "text-gray-500" : "text-gray-500"}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Frequently Asked Questions</h3>
            <p className={isDark ? "text-gray-500" : "text-gray-500"}>Still have questions? We're here to help.</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`rounded-xl border overflow-hidden ${
                  isDark ? "bg-slate-800/50 border-white/10" : "bg-white border-gray-200"
                }`}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
                    isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                  }`}
                >
                  <span className={`font-medium pr-4 flex items-center gap-3 ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}>
                    <HelpCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-indigo-400" : "text-blue-500"}`} />
                    {item.q}
                  </span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${expandedFaq === index ? "rotate-180" : ""} ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-5">
                    <p className={`leading-relaxed pl-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-10">
            <p className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Can't find the answer you're looking for?</p>
            <a href="/contact" className={`inline-flex items-center gap-2 font-semibold hover:gap-3 transition-all ${
              isDark ? "text-indigo-400 hover:text-indigo-300" : "text-blue-600 hover:text-blue-700"
            }`}>
              Contact our support team
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
