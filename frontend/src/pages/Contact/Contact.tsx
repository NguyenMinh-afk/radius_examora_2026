import React, { useState } from "react";
import { Mail, MapPin, Github, MessageSquare, Phone, Clock, Send, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

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
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Example API call:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // if (!response.ok) throw new Error('Failed to send');

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-600", border: "hover:border-blue-300" },
    green: { bg: "bg-green-100", text: "text-green-600", border: "hover:border-green-300" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", border: "hover:border-purple-300" },
    orange: { bg: "bg-orange-100", text: "text-orange-600", border: "hover:border-orange-300" },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-indigo-50">

      {/* HEADER */}
      <Header />

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-6 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MessageSquare size={16} />
              Get in Touch
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contact <span className="text-blue-600">EXMORA</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Questions about our AI-powered examination platform, research collaboration, or system integration? Our team is ready to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

            {/* LEFT SIDE - Contact Info & FAQ */}
            <div className="lg:col-span-2 space-y-10">

              {/* Contact Info Cards */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-5">
                  Contact Information
                </h2>
                <div className="space-y-3">
                  {contactInfo.map((item) => (
                    <a
                      key={item.title}
                      href={item.link || undefined}
                      className={`block bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 ${item.link ? 'hover:shadow-md hover:border-blue-200 cursor-pointer' : 'cursor-default'} ${colorMap[item.color]?.border || ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`${colorMap[item.color]?.bg} ${colorMap[item.color]?.text} p-3 rounded-xl`}>
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-5">
                  Connect With Us
                </h2>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                    >
                      {link.icon}
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-5">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {faq.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-800 pr-4">
                          {item.q}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${expandedFaq === index ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                    <Send size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Send us a Message
                    </h2>
                    <p className="text-sm text-gray-500">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>

                {/* Success Message */}
                {submitStatus === "success" && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
                    <CheckCircle size={20} />
                    <div>
                      <p className="font-medium">Message sent successfully!</p>
                      <p className="text-sm">We'll get back to you soon.</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {submitStatus === "error" && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
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
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nguyen Van A"
                        className={`w-full border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contact@example.com"
                        className={`w-full border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.subject ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
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
                      <p className="mt-1.5 text-sm text-red-600">{errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      rows={6}
                      className={`w-full border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    <div className="flex justify-between mt-1.5">
                      {errors.message ? (
                        <p className="text-sm text-red-600">{errors.message}</p>
                      ) : (
                        <span />
                      )}
                      <span className="text-sm text-gray-400">
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

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Contact;
