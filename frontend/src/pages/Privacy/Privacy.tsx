import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Search, Eye, Lock, FileText, Mail, Users, Database, Globe, AlertTriangle, CheckCircle, Bell, Cookie } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const Privacy: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCookieConsent, setShowCookieConsent] = useState(true);

  // Scroll spy - track which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for header
      const sections = document.querySelectorAll("section[id]");

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;
        const sectionId = section.getAttribute("id");

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          if (sectionId) setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Run once on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections: Section[] = [
    {
      id: "introduction",
      title: "1. Introduction",
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            EXMORA ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered examination platform and related services (collectively, the "Services").
          </p>
          <p>
            This policy applies to all users of our Services, including students, educators, administrators, and visitors. By using our Services, you consent to the collection and use of your information as described in this Privacy Policy.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Effective Date:</strong> January 1, 2025<br />
              <strong>Last Updated:</strong> June 15, 2025
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "information-we-collect",
      title: "2. Information We Collect",
      icon: <Database className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="text-gray-600 leading-relaxed">
            <h4 className="font-semibold text-gray-900 mb-2">2.1 Information You Provide</h4>
            <p>We collect information you voluntarily provide when you:</p>
            <ul className="space-y-1 ml-4 mt-2">
              <li>• Create an account (name, email, password, role)</li>
              <li>• Complete your profile (photo, institution, bio)</li>
              <li>• Create or upload content (questions, exams, documents)</li>
              <li>• Communicate with us (support tickets, feedback)</li>
              <li>• Make payments (billing information)</li>
            </ul>
          </div>

          <div className="text-gray-600 leading-relaxed">
            <h4 className="font-semibold text-gray-900 mb-2">2.2 Information Collected Automatically</h4>
            <p>When you use our Services, we automatically collect:</p>
            <ul className="space-y-1 ml-4 mt-2">
              <li>• <strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              <li>• <strong>Usage Data:</strong> Pages visited, features used, time spent, click patterns</li>
              <li>• <strong>Log Data:</strong> IP address, access times, referring URLs</li>
              <li>• <strong>Cookies:</strong> As described in our Cookie Policy below</li>
            </ul>
          </div>

          <div className="text-gray-600 leading-relaxed">
            <h4 className="font-semibold text-gray-900 mb-2">2.3 Educational Records</h4>
            <p>
              For educational institution users, we may collect and process:
            </p>
            <ul className="space-y-1 ml-4 mt-2">
              <li>• Student enrollment data</li>
              <li>• Examination responses and scores</li>
              <li>• Performance analytics and reports</li>
              <li>• Class and course information</li>
            </ul>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">
                We treat educational records with special care and comply with FERPA, GDPR Article 89, and other applicable educational data protection laws.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "how-we-use",
      title: "3. How We Use Your Information",
      icon: <Eye className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>We use your information to:</p>
          <ul className="space-y-3">
            {[
              { title: "Provide Services", desc: "Create your account, process examinations, generate AI-powered content" },
              { title: "Improve Our Platform", desc: "Analyze usage patterns, fix bugs, develop new features" },
              { title: "Communicate With You", desc: "Send notifications, respond to inquiries, provide support" },
              { title: "Ensure Security", desc: "Monitor for suspicious activity, prevent fraud, enforce Terms of Service" },
              { title: "Personalize Experience", desc: "Adapt difficulty levels, recommend features, customize content" },
              { title: "Legal Compliance", desc: "Meet regulatory requirements, respond to legal requests" },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">{item.title}</strong>
                  <p className="text-sm">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="bg-gray-100 rounded-xl p-4 mt-4">
            <p className="text-sm text-gray-700">
              <strong>AI Processing Notice:</strong> Your content may be processed by our AI systems to generate examination questions and provide adaptive learning features. We implement safeguards to protect your data during AI processing.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "data-sharing",
      title: "4. Data Sharing & Disclosure",
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>We share your information only in the following circumstances:</p>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">4.1 With Your Institution</h4>
              <p className="text-sm">
                If you are a student or teacher, your examination results and progress data may be shared with your educational institution's administrators.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">4.2 Service Providers</h4>
              <p className="text-sm">
                We share data with trusted third-party providers who help us operate: cloud hosting (AWS), payment processing (Stripe), email delivery, and analytics. These providers are bound by confidentiality agreements.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">4.3 Legal Requirements</h4>
              <p className="text-sm">
                We may disclose information if required by law, court order, or government request, or if we believe disclosure is necessary to protect our rights, ensure safety, or prevent fraud.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">4.4 Business Transfers</h4>
              <p className="text-sm">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              <strong>We never sell your personal information</strong> to advertisers or third parties for marketing purposes.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "data-security",
      title: "5. Data Security & Retention",
      icon: <Lock className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <h4 className="font-semibold text-gray-900">5.1 Security Measures</h4>
          <p>We implement industry-standard security measures including:</p>
          <ul className="space-y-2 ml-4">
            <li>• <strong>Encryption:</strong> AES-256 encryption for data at rest; TLS 1.3 for data in transit</li>
            <li>• <strong>Access Controls:</strong> Role-based access control, multi-factor authentication</li>
            <li>• <strong>Monitoring:</strong> 24/7 security monitoring, intrusion detection systems</li>
            <li>• <strong>Regular Audits:</strong> Annual third-party security audits and penetration testing</li>
          </ul>

          <h4 className="font-semibold text-gray-900 mt-6">5.2 Data Retention</h4>
          <p>We retain your information for as long as your account is active or as needed to provide services:</p>
          <div className="bg-gray-50 rounded-xl p-4 mt-2">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-medium text-gray-900">Account Data</td>
                  <td className="py-2 text-right">Until account deletion + 30 days</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-medium text-gray-900">Examination Records</td>
                  <td className="py-2 text-right">7 years (as required by law)</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-medium text-gray-900">Analytics Data</td>
                  <td className="py-2 text-right">2 years (anonymized)</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-gray-900">Support Communications</td>
                  <td className="py-2 text-right">3 years</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
            <p className="text-sm text-amber-800">
              <strong>No method of transmission over the Internet is 100% secure.</strong> While we strive to protect your data, we cannot guarantee absolute security. You are responsible for keeping your credentials confidential.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "your-rights",
      title: "6. Your Rights & Choices",
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>You have the following rights regarding your personal data:</p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Access", desc: "Request a copy of your personal data" },
              { title: "Rectification", desc: "Correct inaccurate or incomplete data" },
              { title: "Erasure", desc: "Request deletion of your data (where applicable)" },
              { title: "Portability", desc: "Receive your data in a portable format" },
              { title: "Object", desc: "Opt out of certain processing activities" },
              { title: "Restrict", desc: "Limit how we process your data" },
            ].map((right) => (
              <div key={right.title} className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-1">{right.title}</h4>
                <p className="text-sm">{right.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">How to Exercise Your Rights</h4>
            <p className="text-sm">
              You can exercise most rights through your account settings. For data export or deletion requests, contact privacy@exmora.ai. We will respond within 30 days.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>European Users (GDPR):</strong> You have additional rights including the right to lodge a complaint with your local data protection authority. Contact us at dpo@exmora.ai for GDPR-related inquiries.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "cookies",
      title: "7. Cookie Policy",
      icon: <Cookie className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            We use cookies and similar technologies to enhance your experience on our platform.
          </p>

          <h4 className="font-semibold text-gray-900">Types of Cookies We Use</h4>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">Essential</span>
                <span className="text-green-600 text-xs">Always Active</span>
              </div>
              <p className="text-sm">
                Required for basic platform functionality: authentication, security, session management.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded">Functional</span>
              </div>
              <p className="text-sm">
                Remember your preferences: language, theme, notification settings.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded">Analytics</span>
              </div>
              <p className="text-sm">
                Help us understand how users interact with our platform to improve services.
              </p>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 mt-6">Managing Cookies</h4>
          <p className="text-sm">
            You can control cookies through your browser settings. Disabling essential cookies may affect platform functionality. Our platform respects "Do Not Track" signals from browsers.
          </p>

          {showCookieConsent && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  We use cookies to enhance your experience. By continuing, you agree to our <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCookieConsent(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
                  >
                    Customize
                  </button>
                  <button
                    onClick={() => setShowCookieConsent(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "third-party",
      title: "8. Third-Party Services",
      icon: <Globe className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>Our Services may include links to or integration with third-party services:</p>

          <div className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-1">LMS Integrations</h4>
              <p className="text-sm">
                When you connect with Canvas, Moodle, or other LMS platforms, data may be shared according to their privacy policies. We recommend reviewing their privacy practices.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-1">AI Service Providers</h4>
              <p className="text-sm">
                We use AI services from OpenAI and Google Cloud to power our question generation. These providers process your content according to their privacy policies.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-1">Analytics Services</h4>
              <p className="text-sm">
                We use tools like Google Analytics to understand platform usage. Data collected is anonymized and subject to their privacy policies.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "childrens-privacy",
      title: "9. Children's Privacy",
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Our Services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13 without parental consent.
          </p>
          <p>
            If you are a parent or guardian and believe your child has provided us with personal information without your consent, please contact us immediately at privacy@exmora.ai.
          </p>
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <strong>For Schools (FERPA/COPPA):</strong> We work with educational institutions that serve as "school officials" with legitimate educational interests. Schools are responsible for obtaining appropriate parental consent as required by FERPA or COPPA.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "international",
      title: "10. International Data Transfers",
      icon: <Globe className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            EXMORA operates globally, and your information may be transferred to and processed in countries other than your own, including the United States and Vietnam.
          </p>
          <p>
            When we transfer data internationally, we ensure appropriate safeguards are in place:
          </p>
          <ul className="space-y-2 ml-4">
            <li>• Standard Contractual Clauses (SCCs) approved by the European Commission</li>
            <li>• Binding Corporate Rules for intra-group transfers</li>
            <li>• Compliance with applicable data protection frameworks</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>GDPR Users:</strong> International transfers are conducted under Article 46 of the GDPR with appropriate safeguards.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "changes",
      title: "11. Changes to This Policy",
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by:
          </p>
          <ul className="space-y-2 ml-4">
            <li>• Posting the updated policy on our website</li>
            <li>• Updating the "Last Updated" date at the top</li>
            <li>• Sending an email notification for significant changes</li>
            <li>• Displaying a notice in the platform for 30 days</li>
          </ul>
          <p>
            Your continued use of our Services after changes take effect constitutes acceptance of the updated policy.
          </p>
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <strong>Version History:</strong><br />
              v2.2 (June 15, 2025) - Updated AI processing disclosures<br />
              v2.1 (March 1, 2025) - Added international transfer section<br />
              v2.0 (January 1, 2025) - Comprehensive rewrite for GDPR compliance<br />
              v1.0 (March 1, 2023) - Original Privacy Policy
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      title: "12. Contact Us",
      icon: <Mail className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>For privacy-related questions or to exercise your rights:</p>

          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">General Privacy Inquiries</h4>
              <p className="text-sm">privacy@exmora.ai</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Data Protection Officer</h4>
              <p className="text-sm">dpo@exmora.ai</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Legal Department</h4>
              <p className="text-sm">legal@exmora.ai</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Mailing Address</h4>
              <p className="text-sm">
                EXMORA Privacy Team<br />
                Hanoi, Vietnam
              </p>
            </div>
          </div>

          <p className="text-sm">
            We aim to respond to all privacy inquiries within 30 days. For complex requests, we may extend this period with notice.
          </p>
        </div>
      ),
    },
  ];

  const filteredSections = searchQuery
    ? sections.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sections;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield size={16} />
              Your Data, Your Rights
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are committed to protecting your privacy. Learn how we collect, use, and safeguard your personal information.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="fixed w-72 top-20 max-h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search privacy policy..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-green-600" />
                    Quick Links
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/terms" className="text-sm text-blue-600 hover:underline">
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact" className="text-sm text-blue-600 hover:underline">
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" className="text-sm text-blue-600 hover:underline">
                        Create Account
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Table of Contents */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Contents</h3>
                  <nav className="space-y-1">
                    {filteredSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                          activeSection === section.id
                            ? "bg-green-50 text-green-700 font-semibold border-l-4 border-green-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {filteredSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                      {section.icon}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                  <div className="prose max-w-none text-gray-600">
                    {section.content}
                  </div>
                </section>
              ))}

              {/* Footer CTA */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
                <h3 className="text-xl font-bold mb-2">Have Privacy Questions?</h3>
                <p className="text-green-100 mb-6">
                  Our privacy team is here to help with any questions about your data.
                </p>
                <a
                  href="mailto:privacy@exmora.ai"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email Privacy Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
