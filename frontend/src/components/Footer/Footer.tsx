import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Linkedin, Twitter, Instagram, Youtube } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-t shadow-inner mt-auto">

      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 md:grid-cols-5 gap-6 text-gray-600">

        {/* Contact */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-2.5">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li>+84 123 456 789</li>
            <li>support@exmora.ai</li>
            <li>Hanoi, Vietnam</li>
          </ul>
        </div>

        {/* Solutions */}
        <div>
          <h3 className="text-blue-600 font-semibold mb-2.5">Solutions</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-blue-600 transition">AI Question Generation</li>
            <li className="hover:text-blue-600 transition">Adaptive Examination</li>
            <li className="hover:text-blue-600 transition">Distributed System</li>
            <li className="hover:text-blue-600 transition">Exam Analytics</li>
            <li className="hover:text-blue-600 transition">Cloud Deployment</li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-blue-600 font-semibold mb-2.5">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-blue-600 transition">About Us</Link></li>
            <li className="hover:text-blue-600 transition">Careers</li>
            <li className="hover:text-blue-600 transition">Research</li>
            <li><Link to="/contact" className="hover:text-blue-600 transition">Contact</Link></li>
            <li><Link to="/terms" className="hover:text-blue-600 transition">Legal</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-blue-600 font-semibold mb-2.5">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-blue-600 transition">Documentation</li>
            <li className="hover:text-blue-600 transition">API Reference</li>
            <li className="hover:text-blue-600 transition">Knowledge Base</li>
            <li className="hover:text-blue-600 transition">System Status</li>
            <li className="hover:text-blue-600 transition">Partners</li>
          </ul>
        </div>

        {/* Social Icons */}
        <div className="flex md:justify-end">
          <div className="flex md:flex-col gap-2.5">
            {[
              { Icon: Facebook, link: "#" },
              { Icon: Linkedin, link: "#" },
              { Icon: Twitter, link: "#" },
              { Icon: Instagram, link: "#" },
              { Icon: Youtube, link: "#" }
            ].map(({ Icon, link }, index) => (
              <a
                key={index}
                href={link}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-100 hover:bg-blue-600 hover:text-white transition"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Bottom */}
      <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>© {new Date().getFullYear()} EXMORA. All rights reserved.</span>
          <div className="hidden md:flex items-center gap-4 text-xs">
            <Link to="/terms" className="hover:text-blue-600 transition">Terms</Link>
            <Link to="/privacy" className="hover:text-blue-600 transition">Privacy Policy</Link>
          </div>
        </div>
        <span className="mt-1.5 md:mt-0 hover:text-blue-600 transition cursor-pointer">
          Intelligent AI Examination Platform
        </span>
      </div>

    </footer>
  );
};

export default Footer;