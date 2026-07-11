import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Search, Clock, AlertTriangle, Scale, Users, Shield, BookOpen, Mail } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useTheme } from "../../contexts/useTheme";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const Terms: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [searchQuery, setSearchQuery] = useState("");

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
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Welcome to EXMORA ("we," "us," or "our"). By accessing or using our AI-powered examination platform and related services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). Please read these Terms carefully before using our Services.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you and EXMORA regarding your use of the Services. If you do not agree to these Terms, you may not access or use the Services.
          </p>
          <div className={`${isDark ? "bg-blue-500/20 border-white/10" : "bg-blue-50 border-blue-200"} border rounded-xl p-4`}>
            <p className={`text-sm ${isDark ? "text-blue-300" : "text-blue-800"}`}>
              <strong>Effective Date:</strong> January 1, 2025<br />
              <strong>Last Updated:</strong> June 15, 2025
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "definitions",
      title: "2. Definitions",
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-3 text-gray-600">
          <p>Throughout these Terms, the following definitions apply:</p>
          <ul className="space-y-2 ml-4">
            <li><strong>"Account"</strong> – Your registered user account on the EXMORA platform.</li>
            <li><strong>"Content"</strong> – Any material, data, questions, exams, or information uploaded, created, or submitted through the Services.</li>
            <li><strong>"Educational Institution"</strong> – Any school, university, college, or accredited educational organization.</li>
            <li><strong>"Intellectual Property"</strong> – Patents, copyrights, trademarks, trade secrets, and other proprietary rights.</li>
            <li><strong>"User"</strong> – Any individual who accesses or uses the Services, including Students, Teachers, and Administrators.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "account",
      title: "3. Account Registration & Eligibility",
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>3.1 Eligibility</h4>
          <p>
            You must be at least 13 years old to create an Account. If you are under 18, you represent that you have obtained parental or guardian consent. Educational institutions may register on behalf of their students with appropriate authorization.
          </p>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>3.2 Account Information</h4>
          <p>
            You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are solely responsible for maintaining the confidentiality of your login credentials.
          </p>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>3.3 Account Security</h4>
          <p>
            You agree to immediately notify us of any unauthorized use of your Account. We are not liable for any loss or damage arising from unauthorized use of your credentials.
          </p>
          
          <div className={`${isDark ? "bg-amber-500/20 border-white/10" : "bg-amber-50 border-amber-200"} border rounded-xl p-4 flex items-start gap-3`}>
            <AlertTriangle className={`w-5 h-5 ${isDark ? "text-amber-400" : "text-amber-600"} flex-shrink-0 mt-0.5`} />
            <p className={`text-sm ${isDark ? "text-amber-300" : "text-amber-800"}`}>
              You are responsible for all activities that occur under your Account. Do not share your password with others.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "services",
      title: "4. Description of Services",
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>EXMORA provides an AI-powered examination platform that includes:</p>
          <ul className="space-y-2 ml-4">
            <li>• <strong>AI Question Generation:</strong> Automated creation of exam questions using artificial intelligence.</li>
            <li>• <strong>Question Bank Management:</strong> Storage, organization, and tagging of examination questions.</li>
            <li>• <strong>Exam Creation & Administration:</strong> Tools for educators to create and manage examinations.</li>
            <li>• <strong>Student Assessment:</strong> Online examination taking with adaptive difficulty features.</li>
            <li>• <strong>Analytics & Reporting:</strong> Performance analytics and detailed reporting tools.</li>
            <li>• <strong>LMS Integration:</strong> Compatibility with various Learning Management Systems.</li>
          </ul>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the Services at any time without prior notice.
          </p>
        </div>
      ),
    },
    {
      id: "acceptable-use",
      title: "5. Acceptable Use Policy",
      icon: <Scale className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>5.1 Permitted Uses</h4>
          <p>You may use the Services only for lawful educational purposes, including:</p>
          <ul className="space-y-1 ml-4">
            <li>• Creating and taking academic examinations</li>
            <li>• Managing question banks for educational purposes</li>
            <li>• Analyzing student performance data</li>
            <li>• Integrating with authorized educational systems</li>
          </ul>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>5.2 Prohibited Activities</h4>
          <p>You agree NOT to:</p>
          <ul className="space-y-1 ml-4">
            <li>• Use the Services for any illegal or unauthorized purpose</li>
            <li>• Attempt to gain unauthorized access to any account or system</li>
            <li>• Interfere with or disrupt the integrity or performance of the Services</li>
            <li>• Reverse engineer, decompile, or disassemble any component of the Services</li>
            <li>• Use automated tools to scrape, mine, or extract data from the platform</li>
            <li>• Share exam content outside of authorized contexts</li>
            <li>• Impersonate any person or entity</li>
            <li>• Upload malicious code, viruses, or harmful content</li>
          </ul>
          
          <div className={`${isDark ? "bg-red-500/20 border-white/10" : "bg-red-50 border-red-200"} border rounded-xl p-4`}>
            <p className={`text-sm ${isDark ? "text-red-300" : "text-red-800"}`}>
              Violation of this Acceptable Use Policy may result in immediate termination of your Account and access to the Services.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "content",
      title: "6. User Content & Intellectual Property",
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>6.1 Ownership</h4>
          <p>
            You retain ownership of all Content you upload, create, or submit through the Services. By using our Services, you grant us a limited license to use, store, and process your Content solely for providing the Services to you.
          </p>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>6.2 License to User Content</h4>
          <p>
            You grant EXMORA a non-exclusive, worldwide, royalty-free license to use your Content for: operating and improving our Services, generating AI-powered features, and ensuring the security and integrity of the platform.
          </p>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>6.3 Platform Intellectual Property</h4>
          <p>
            EXMORA and its licensors own all rights, title, and interest in the Services, including but not limited to: the platform software, AI models, algorithms, user interfaces, designs, and trademarks. You may not use our intellectual property without prior written consent.
          </p>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>6.4 AI-Generated Content</h4>
          <p>
            Questions and content generated by our AI are provided for educational purposes. While we strive for accuracy, EXMORA does not guarantee the correctness or appropriateness of AI-generated content. Educators should review all AI-generated material before use.
          </p>
        </div>
      ),
    },
    {
      id: "privacy",
      title: "7. Privacy & Data Protection",
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
          </p>
          <p>
            By using the Services, you consent to our data practices as described in the Privacy Policy. For educational institution users, we comply with FERPA, GDPR, and other applicable educational data protection laws.
          </p>
          <Link to="/privacy" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
            View our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </Link>
        </div>
      ),
    },
    {
      id: "payment",
      title: "8. Payment & Subscription",
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>8.1 Subscription Plans</h4>
          <p>
            EXMORA offers various subscription plans for different user tiers. Pricing and features are described on our pricing page and are subject to change with 30 days' notice.
          </p>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>8.2 Billing</h4>
          <p>
            Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law or as explicitly stated in our refund policy.
          </p>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>8.3 Free Tier</h4>
          <p>
            Our free tier provides basic access to the Services. We reserve the right to modify or discontinue free tier features at any time with reasonable notice.
          </p>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>8.4 Taxes</h4>
          <p>
            You are responsible for all applicable taxes. We will charge tax where required by law.
          </p>
        </div>
      ),
    },
    {
      id: "warranties",
      title: "9. Disclaimers & Warranties",
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>9.1 "As Is" Basis</h4>
          <p>
            THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>9.2 No Guarantee of Results</h4>
          <p>
            While we strive to provide accurate AI-generated content and reliable services, we do not guarantee any specific outcomes, results, or improvements in educational performance.
          </p>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>9.3 Third-Party Content</h4>
          <p>
            The Services may contain links to third-party websites or content. We are not responsible for the accuracy, reliability, or content of any third-party services.
          </p>
        </div>
      ),
    },
    {
      id: "liability",
      title: "10. Limitation of Liability",
      icon: <Scale className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, EXMORA AND ITS AFFILIATES SHALL NOT BE LIABLE FOR:
          </p>
          <ul className="space-y-1 ml-4">
            <li>• Indirect, incidental, special, consequential, or punitive damages</li>
            <li>• Loss of profits, revenue, data, or business opportunities</li>
            <li>• Any damages arising from your reliance on AI-generated content</li>
            <li>• Any actions taken by educational institutions using the platform</li>
          </ul>
          <p>
            OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
          </p>
        </div>
      ),
    },
    {
      id: "termination",
      title: "11. Termination",
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>11.1 Termination by You</h4>
          <p>
            You may terminate your Account at any time through your account settings or by contacting support. Termination will take effect immediately, and you will lose access to your Content unless you request an export within 30 days.
          </p>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>11.2 Termination by Us</h4>
          <p>
            We may suspend or terminate your Account if you violate these Terms, engage in prohibited activities, or for any other reason with 30 days' notice. We may terminate immediately if required by law or for material breach.
          </p>
          
          <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>11.3 Effect of Termination</h4>
          <p>
            Upon termination, your right to use the Services ceases immediately. Sections regarding Intellectual Property, Disclaimers, Limitation of Liability, and Dispute Resolution survive termination.
          </p>
        </div>
      ),
    },
    {
      id: "changes",
      title: "12. Modifications to Terms",
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            We may modify these Terms at any time. We will notify you of material changes via email or through the Services at least 30 days before the changes take effect. Your continued use of the Services after the changes take effect constitutes your acceptance of the modified Terms.
          </p>
          <p>
            If you do not agree to the modified Terms, you must stop using the Services and terminate your Account.
          </p>
          <div className={`${isDark ? "bg-slate-700" : "bg-gray-100"} rounded-xl p-4`}>
            <p className={`text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              <strong>Version History:</strong><br />
              v2.1 (June 15, 2025) - Updated AI content disclaimers<br />
              v2.0 (January 1, 2025) - Comprehensive rewrite<br />
              v1.0 (March 1, 2023) - Original Terms
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      title: "13. Contact Information",
      icon: <Mail className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>For questions regarding these Terms, please contact us:</p>
          <div className={`${isDark ? "bg-slate-700" : "bg-gray-50"} rounded-xl p-6 space-y-3`}>
            <div>
              <strong className={isDark ? "text-white" : "text-gray-900"}>EXMORA Legal Department</strong>
            </div>
            <div>Email: legal@exmora.ai</div>
            <div>Address: Hanoi, Vietnam</div>
            <div>Website: www.exmora.ai</div>
          </div>
          <p>
            For educational institutions, we also offer custom Data Processing Agreements (DPAs) upon request.
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
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-white via-blue-50 to-indigo-50"}`}>
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 ${isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"} px-4 py-2 rounded-full text-sm font-medium mb-6`}>
              <FileText size={16} />
              Legal Documents
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-4`}>
              Terms of Service
            </h1>
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"} max-w-2xl mx-auto`}>
              These terms govern your use of EXMORA's AI-powered examination platform. Please read carefully.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Table of Contents */}
            <div className="lg:col-span-1">
              <div className="fixed w-72 top-20 max-h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search terms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 ${isDark ? "bg-slate-700 border-white/10 text-gray-200 placeholder-gray-500" : "bg-white border-gray-200"} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                {/* Quick Links */}
                <div className={`${isDark ? "bg-slate-800 border-white/10" : "bg-white border-gray-200"} rounded-xl border p-4 mb-6`}>
                  <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"} mb-3 flex items-center gap-2`}>
                    <Clock className="w-4 h-4 text-blue-600" />
                    Quick Links
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/privacy" className="text-sm text-blue-600 hover:underline">
                        Privacy Policy
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
                <div className={`${isDark ? "bg-slate-800 border-white/10" : "bg-white border-gray-200"} rounded-xl border p-4`}>
                  <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"} mb-3`}>Contents</h3>
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
                            ? isDark
                              ? "bg-blue-500/20 text-blue-300 font-semibold border-l-4 border-blue-400"
                              : "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600"
                            : isDark
                              ? "text-gray-400 hover:bg-slate-700"
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
                  className={`${isDark ? "bg-slate-800 border-white/10 shadow-slate-950" : "bg-white border-gray-200 shadow-sm"} rounded-2xl border p-6 md:p-8 scroll-mt-24`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"} rounded-xl flex items-center justify-center`}>
                      {section.icon}
                    </div>
                    <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{section.title}</h2>
                  </div>
                  <div className={`prose max-w-none ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {section.content}
                  </div>
                </section>
              ))}

              {/* Footer CTA */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
                <h3 className="text-xl font-bold mb-2">Questions about our Terms?</h3>
                <p className="text-blue-100 mb-6">
                  Our legal team is here to help with any questions you may have.
                </p>
                <Link
                  to="/contact"
                  className={`inline-flex items-center gap-2 px-6 py-3 ${isDark ? "bg-slate-800 text-blue-300 hover:bg-slate-700" : "bg-white text-blue-600 hover:bg-blue-50"} rounded-xl font-semibold transition-colors`}
                >
                  <Mail className="w-4 h-4" />
                  Contact Legal Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
