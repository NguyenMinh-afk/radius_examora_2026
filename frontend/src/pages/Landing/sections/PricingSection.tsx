import React, { useState } from "react";
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
    a: "EXMORA uses advanced language models to generate questions based on your input topics, curriculum standards, and desired Bloom's taxonomy levels.",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", badge: "bg-violet-100 text-violet-700" },
  slate: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", badge: "bg-slate-200 text-slate-700" },
};

const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <section id="pricing" className="px-6 py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase">
              Pricing
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8">
            Choose the plan that fits your needs. All plans include our core AI examination features.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                billingCycle === "monthly"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((plan) => {
            const colors = colorMap[plan.color];
            const price = billingCycle === "yearly" && plan.price !== "Custom"
              ? `$${Math.round(parseInt(plan.price.replace("$", "")) * 0.8)}`
              : plan.price;

            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl border-2 ${
                  plan.popular ? "border-blue-300 shadow-xl shadow-blue-100" : "border-gray-200 shadow-sm"
                } overflow-hidden transition-all duration-300 hover:shadow-lg ${plan.popular ? "" : "hover:border-gray-300"}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center text-xs font-bold py-1.5 tracking-wide">
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className={`p-6 ${plan.popular ? "pt-10" : ""}`}>
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center`}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{plan.name}</h3>
                      {plan.badge && !plan.popular && (
                        <span className={`text-xs ${colors.badge} px-2 py-0.5 rounded-full`}>
                          {plan.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">{price}</span>
                    {plan.period && <span className="text-gray-500">{plan.period}</span>}
                  </div>

                  <p className="text-sm text-gray-600 mb-6">{plan.description}</p>

                  {/* CTA Button */}
                  <a
                    href={plan.name === "Enterprise" ? "/contact" : "/register"}
                    className={`w-full block text-center py-3 rounded-xl font-semibold transition-all duration-200 mb-6 ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5"
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
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm opacity-50">
                        <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500">{feature}</span>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h3>
            <p className="text-gray-500">Still have questions? We're here to help.</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800 pr-4 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    {item.q}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${expandedFaq === index ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-600 leading-relaxed pl-8">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4">Can't find the answer you're looking for?</p>
            <a href="/contact" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
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
