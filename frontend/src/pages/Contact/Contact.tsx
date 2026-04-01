import React from "react";
import { Mail, MapPin, Github, MessageSquare } from "lucide-react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const contactInfo = [
  {
    icon: <Mail size={18} />,
    title: "Email",
    value: "support@exmora.ai"
  },
  {
    icon: <MapPin size={18} />,
    title: "Location",
    value: "Hanoi, Vietnam"
  },
  {
    icon: <Github size={18} />,
    title: "GitHub",
    value: "github.com/exmora"
  }
];

const faq = [
  {
    q: "Can EXMORA integrate with university LMS systems?",
    a: "Yes, the platform supports integration with existing LMS infrastructure."
  },
  {
    q: "Does the system support AI generated questions?",
    a: "EXMORA uses AI prompt engineering to generate intelligent exam questions."
  }
];

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-indigo-50">

      {/* HEADER */}
      <Header />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-14">

          {/* LEFT SIDE */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contact EXMORA
            </h1>

            <p className="text-gray-600 mb-10">
              Questions about our AI-powered examination platform,
              research collaboration or system integration?
              Reach out and our team will respond shortly.
            </p>

            {/* Contact Info */}
            <div className="space-y-4 mb-10">
              {contactInfo.map((item) => (
                <div
                  key={item.title}
                  className="bg-white p-4 rounded-xl shadow flex items-center gap-4"
                >
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a className="px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-100">GitHub</a>
              <a className="px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-100">Research Lab</a>
              <a className="px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-100">Documentation</a>
            </div>

            {/* FAQ */}
            <div className="mt-12 space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Quick Questions
              </h3>
              {faq.map((f) => (
                <div key={f.q}>
                  <p className="font-medium text-gray-800">{f.q}</p>
                  <p className="text-gray-600 text-sm">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="bg-white p-10 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-blue-600 font-semibold">
              <MessageSquare size={18} />
              Send a Message
            </div>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Your Message"
                rows={5}
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Contact;