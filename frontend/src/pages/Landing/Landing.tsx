import React from "react";
import Header from "./../Header/Header";
import Footer from "../Footer/Footer";

const features = [
  {
    title: "AI Question Generation",
    desc: "Generate exam questions using AI prompt engineering."
  },
  {
    title: "Distributed Architecture",
    desc: "RabbitMQ messaging enables scalable exam systems."
  },
  {
    title: "Adaptive Learning",
    desc: "AI adjusts exam difficulty based on student performance."
  }
];

const tags = ["AI Generation", "RabbitMQ", "Adaptive Learning"];

const FeatureCard = ({ title, desc }: { title: string; desc: string }) => (
  <div className="bg-white p-5 rounded-xl shadow">
    <h3 className="text-blue-600 font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-indigo-50">

      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none
        bg-[linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)]
        bg-[size:60px_60px]"
      />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col">

        {/* Hero Section */}
        <section className="flex flex-1 items-center justify-center px-16 gap-20 py-16">

          {/* Left Content */}
          <div className="max-w-xl">

            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
              AI POWERED EXAM PLATFORM
            </span>

            <h1 className="text-5xl font-extrabold mt-4 mb-5 text-gray-900">
              The Future of{" "}
              <span className="text-blue-600">
                Intelligent Examination
              </span>
            </h1>

            <p className="text-gray-700 text-lg mb-7">
              EXMORA integrates AI, RabbitMQ distributed messaging and adaptive learning
              to build a scalable academic ecosystem.
            </p>

            {/* Buttons */}
            <div className="flex gap-4">

              <a
                href="/register"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </a>

              <button className="flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-gray-100 transition">
                <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full">
                  ▶
                </span>
                Watch Demo
              </button>

            </div>

            {/* Tags */}
            <div className="flex gap-3 mt-6 text-xs text-gray-500">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white shadow px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

          </div>

          {/* AI Card */}
          <div className="relative">

            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 blur-xl opacity-30 rounded-2xl" />

            <div className="relative w-[500px] bg-white p-6 rounded-2xl shadow-2xl space-y-4">

              <div className="flex items-center text-sm font-semibold text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                AI ENGINE RUNNING
                <span className="ml-auto text-gray-400 text-xs">
                  Processing...
                </span>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <b className="text-blue-600 text-xs">PROMPT</b>
                <p>
                  Generate physics questions about quantum entanglement.
                </p>
              </div>

              <div className="bg-blue-600 text-white p-4 rounded-lg text-sm">
                <b>GENERATED QUESTION</b>
                <p>
                  Explain Bell's inequality and its implications for local realism.
                </p>
              </div>

              <div className="flex gap-2 text-xs">
                {["Multiple Choice", "Bloom Level 5", "AI Generated"].map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

            </div>

          </div>

        </section>

        {/* Feature Section */}
        <section className="grid grid-cols-3 gap-6 px-16 pb-16">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </section>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default Landing;