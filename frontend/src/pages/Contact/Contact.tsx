import React, { useState } from "react";
import { Mail, MapPin, Github, MessageSquare, Phone, Clock, Send, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useTheme } from "../../contexts/useTheme";

const contactInfo = [
  {
    icon: <Mail size={20} />,
    title: "Email",
    value: "support@exmora.ai",
    link: "mailto:support@exmora.ai",
    color: "blue"
  },
  {
    icon: <Phone size={20} />,
    title: "Phone",
    value: "+84 123 456 789",
    link: "tel:+84123456789",
    color: "green"
  },
  {
    icon: <MapPin size={20} />,
    title: "Location",
    value: "Hanoi, Vietnam",
    link: null,
    color: "purple"
  },
  {
    icon: <Clock size={20} />,
    title: "Working Hours",
    value: "Mon - Fri: 8:00 - 18:00",
    link: null,
    color: "orange"
  }
];

const socialLinks = [
  { name: "GitHub", url: "https://github.com/exmora", icon: <Github size={18} /> },
  { name: "Documentation", url: "#", icon: <ExternalLink size={18} /> },
  { name: "Research Lab", url: "#", icon: <ExternalLink size={18} /> },
];

const faq = [
  {
    q: "Can EXMORA integrate with university LMS systems?",
    a: "Yes, the platform supports integration with existing LMS infrastructure including Canvas, Moodle, Blackboard, and custom solutions through our REST API."
  },
  {
    q: "Does the system support AI-generated questions?",
    a: "EXMORA uses advanced AI prompt engineering to generate intelligent exam questions. Teachers can customize difficulty, topic coverage, and question types."
  },
  {
    q: "How does anti-cheating work?",
    a: "Our AI-powered proctoring monitors exam sessions, detects suspicious behavior patterns, and provides real-time alerts to invigilators."
  },
  {
    q: "Is there a free trial available?",
    a: "Yes! We offer a 30-day free trial for institutions. Contact us to get started with full platform access."
  }
];

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const Contact: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: isDark ? "bg-blue-500/20" : "bg-blue-100", text: isDark ? "text-blue-400" : "text-blue-600" },
    green: { bg: isDark ? "bg-green-500/20" : "bg-green-100", text: isDark ? "text-green-400" : "text-green-600" },
    purple: { bg: isDark ? "bg-purple-500/20" : "bg-purple-100", text: isDark ? "text-purple-400" : "text-purple-600" },
    orange: { bg: isDark ? "bg-orange-500/20" : "bg-orange-100", text: isDark ? "text-orange-400" : "text-orange-600" },
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-slate-900" : "bg-gradient-to-br from-white via-blue-50 to-indigo-50"}`}>

      <Header />

      <main className="flex-1 px-4 sm:px-6 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
              <MessageSquare size={16} />
              Get in Touch
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Contact <span className="text-blue-600">EXMORA</span>
            </h1>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Questions about our AI-powered examination platform, research collaboration, or system integration? Our team is ready to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

            <div className="lg:col-span-2 space-y-10">

              <div>
                <h2 className={`text-xl font-semibold mb-5 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Contact Information
                </h2>
                <div className="space-y-3">
                  {contactInfo.map((item) => (
                    <a
                      key={item.title}
                      href={item.link || undefined}
                      className={`block p-4 rounded-xl border transition-all duration-200 ${isDark ? "bg-slate-800 border-white/10 hover:border-blue-500/50" : "bg-white border-gray-100 hover:shadow-md hover:border-blue-200"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`${colorMap[item.color].bg} ${colorMap[item.color].text} p-3 rounded-xl`}>
                          {item.icon}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                            {item.title}
                          </h3>
                          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h2 className={`text-xl font-semibold mb-5 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Connect With Us
                </h2>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg shadow-sm text-sm font-medium transition-all duration-200 ${isDark ? "bg-slate-800 border-white/10 text-gray-300 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400" : "bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"}`}
                    >
                      {link.icon}
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h2 className={`text-xl font-semibold mb-5 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {faq.map((item, index) => (
                    <div
                      key={index}
                      className={`rounded-xl border overflow-hidden ${isDark ? "bg-slate-800 border-white/10" : "bg-white border-gray-100 shadow-sm"}`}
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                      >
                        <span className={`font-medium pr-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                          {item.q}
                        </span>
                        <svg
                          className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isDark ? "text-gray-400" : "text-gray-500"} ${expandedFaq === index ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-4">
                          <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className={`p-8 md:p-10 rounded-2xl shadow-lg border ${isDark ? "bg-slate-800 border-white/10" : "bg-white border-gray-100"}`}>
                <div className="flex items-center gap-3 mb-8">
                  <div className={`p-3 rounded-xl ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                    <Send size={22} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Send us a Message
                    </h2>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>

                {submitStatus === "success" && (
                  <div className={`mb-6 p-4 border rounded-xl flex items-center gap-3 ${isDark ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-green-50 border-green-200 text-green-700"}`}>
                    <CheckCircle size={20} />
                    <div>
                      <p className="font-medium">Message sent successfully!</p>
                      <p className="text-sm">We&apos;ll get back to you soon.</p>
                    </div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className={`mb-6 p-4 border rounded-xl flex items-center gap-3 ${isDark ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-700"}`}>
                    <AlertCircle size={20} />
                    <div>
                      <p className="font-medium">Failed to send message</p>
                      <p className="text-sm">Please try again later.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nguyen Van A"
                        className={`w-full border rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? (isDark ? "border-red-400 bg-red-500/20" : "border-red-400 bg-red-50") : (isDark ? "border-white/10 bg-slate-700 text-gray-200 placeholder-gray-500" : "border-gray-200 bg-gray-50")}`}
                      />
                      {errors.name && (
                        <p className={`mt-1.5 text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contact@example.com"
                        className={`w-full border rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? (isDark ? "border-red-400 bg-red-500/20" : "border-red-400 bg-red-50") : (isDark ? "border-white/10 bg-slate-700 text-gray-200 placeholder-gray-500" : "border-gray-200 bg-gray-50")}`}
                      />
                      {errors.email && (
                        <p className={`mt-1.5 text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full border rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.subject ? (isDark ? "border-red-400 bg-red-500/20" : "border-red-400 bg-red-50") : (isDark ? "border-white/10 bg-slate-700 text-gray-200" : "border-gray-200 bg-gray-50")}`}
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="integration">LMS Integration</option>
                      <option value="pricing">Pricing & Plans</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                    </select>
                    {errors.subject && (
                      <p className={`mt-1.5 text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>{errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      rows={6}
                      className={`w-full border rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.message ? (isDark ? "border-red-400 bg-red-500/20" : "border-red-400 bg-red-50") : (isDark ? "border-white/10 bg-slate-700 text-gray-200 placeholder-gray-500" : "border-gray-200 bg-gray-50")}`}
                    />
                    <div className="flex justify-between mt-1.5">
                      {errors.message ? (
                        <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>{errors.message}</p>
                      ) : (
                        <span />
                      )}
                      <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {formData.message.length} characters
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
