import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { useEffect, useState, useRef } from "react";

import automationSvg from "../assets/automation.svg";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);
  const [visibleTexts, setVisibleTexts] = useState<number[]>([]);
  const [activeCardColor, setActiveCardColor] = useState("rgba(130, 67, 234, 0.5)");
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Features data - moved outside useEffect to avoid stale closure
  const features = [
    {
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png",
      title: "Smart CRM",
      description: "Manage your contacts and leads efficiently",
      color: "from-blue-500 to-cyan-500",
      glowColor: "rgba(59, 130, 246, 0.5)",
    },
    {
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/512px-Gmail_icon_%282020%29.svg.png",
      title: "Email Campaigns",
      description: "Send targeted campaigns with AI assistance",
      color: "from-red-500 to-pink-500",
      glowColor: "rgba(239, 68, 68, 0.5)",
    },
    {
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/New_Power_BI_Logo.svg/512px-New_Power_BI_Logo.svg.png",
      title: "Analytics",
      description: "Track performance with real-time insights",
      color: "from-yellow-500 to-orange-500",
      glowColor: "rgba(251, 191, 36, 0.5)",
    },
    {
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/512px-Google_2015_logo.svg.png",
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your data",
      color: "from-green-500 to-emerald-500",
      glowColor: "rgba(34, 197, 94, 0.5)",
    },
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Preload Google Fonts - optimized loading
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Saira:ital,wght@0,100..900;1,100..900&family=Varela+Round&display=swap';
    link.rel = 'stylesheet';
    link.setAttribute('data-crm-fonts', 'true');
    
    // Check if fonts already loaded to prevent duplicates
    if (!document.querySelector('[data-crm-fonts]')) {
      document.head.appendChild(link);
    }
    
    // Intersection Observer for feature cards
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = featureRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index !== -1) {
            if (entry.isIntersecting) {
              setVisibleFeatures((prev) => [...new Set([...prev, index])]);
              // Update thunder glow color based on the card color
              setActiveCardColor(features[index].glowColor);
            } else {
              setVisibleFeatures((prev) => prev.filter((i) => i !== index));
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    // Intersection Observer for text sections
    const textObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = textRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index !== -1) {
            if (entry.isIntersecting) {
              setVisibleTexts((prev) => [...new Set([...prev, index])]);
            } else {
              setVisibleTexts((prev) => prev.filter((i) => i !== index));
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) cardObserver.observe(ref);
    });

    textRefs.current.forEach((ref) => {
      if (ref) textObserver.observe(ref);
    });
    
    return () => {
      const existingLink = document.querySelector('[data-crm-fonts]');
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
      cardObserver.disconnect();
      textObserver.disconnect();
    };
  }, [features]); // Added features to dependencies

  const handleGetStarted = () => {
    // Navigate directly to the landing/login page. No skeleton/loading.
    navigate('/landing');
  };

  const decorativeDotsGroup1 = [
    { top: "top-24", left: "left-[78px]", size: "w-[7px] h-[7px]", delay: "0s" },
    { top: "top-[75px]", left: "left-[89px]", size: "w-[7px] h-[7px]", delay: "0.1s" },
    { top: "top-7", left: "left-[117px]", size: "w-[11px] h-[11px]", delay: "0.2s" },
    { top: "top-px", left: "left-[7px]", size: "w-[11px] h-[11px]", delay: "0.3s" },
    { top: "top-16", left: "left-px", size: "w-3.5 h-3.5", delay: "0.4s" },
    { top: "top-24", left: "left-9", size: "w-[7px] h-[7px]", delay: "0.5s" },
    { top: "top-16", left: "left-9", size: "w-[7px] h-[7px]", delay: "0.6s" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0b021c]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b021c]/80 backdrop-blur-xl border-b border-white/10" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#8243ea]" aria-hidden="true" />
            <span className="text-xl font-bold text-white" style={{ fontFamily: "'Saira', sans-serif" }}>
              CRM Portal
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-200 hover:text-white transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Features
            </a>
            <a href="#analytics" className="text-gray-200 hover:text-white transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Analytics
            </a>
            <a href="#about" className="text-gray-200 hover:text-white transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              About
            </a>
            <button
              onClick={handleGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-[#8243ea] to-[#a371f7] rounded-lg text-white font-medium hover:shadow-lg hover:shadow-[#8243ea]/50 transition-all duration-300"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              aria-label="Get started with CRM Portal"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Rotating Squares with Rounded Edges */}
      <div className="fixed top-20 left-10 w-32 h-32 border-2 border-[#8243ea]/30 rounded-3xl animate-slow-spin opacity-20" aria-hidden="true" />
      <div className="fixed top-40 right-20 w-24 h-24 border-2 border-[#a371f7]/30 rounded-2xl animate-slow-spin-reverse opacity-20" style={{ animationDelay: '1s' }} aria-hidden="true" />
      <div className="fixed bottom-32 left-1/4 w-20 h-20 border-2 border-[#8243ea]/20 rounded-xl animate-slow-spin opacity-15" style={{ animationDelay: '2s' }} aria-hidden="true" />
      <div className="fixed bottom-20 right-1/3 w-28 h-28 border-2 border-[#a371f7]/25 rounded-2xl animate-slow-spin-reverse opacity-20" style={{ animationDelay: '3s' }} aria-hidden="true" />

      {/* Fixed Thunder Icon Background - Does not scroll */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0" aria-hidden="true">
        <div className="relative">
          {/* Main Thunder Icon */}
          <Zap 
            className="w-[500px] h-[500px] opacity-10 transition-colors duration-1000"
            strokeWidth={0.5}
            style={{ color: activeCardColor }}
          />
          
          {/* Glowing layers - Reduced opacity */}
          <Zap 
            className="absolute inset-0 w-[500px] h-[500px] opacity-10 blur-3xl transition-colors duration-1000"
            strokeWidth={1}
            style={{ color: activeCardColor }}
          />
          <Zap 
            className="absolute inset-0 w-[500px] h-[500px] opacity-8 blur-2xl transition-colors duration-1000"
            strokeWidth={1}
            style={{ color: activeCardColor }}
          />
        </div>
      </div>

      {/* Animated Background Gradients - Reduced intensity */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-[#8243ea33] to-transparent rounded-full blur-[200px] opacity-50" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-[#8243ea20] to-transparent rounded-full blur-[150px] opacity-40" aria-hidden="true" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} aria-hidden="true" />

      {/* Decorative Dots - Left - Reduced animation */}
      <div className="absolute top-[130px] left-[100px] w-32 h-[103px]" aria-hidden="true">
        {decorativeDotsGroup1.map((dot, index) => (
          <div
            key={`dot-left-${index}`}
            className={`absolute ${dot.top} ${dot.left} ${dot.size} rounded-full shadow-[0px_0px_20px_#ffffff61] bg-gradient-to-br from-[#d6bdff] to-[#7b2cff] opacity-60`}
          />
        ))}
      </div>

      {/* Decorative Dots - Right - Reduced animation */}
      <div className="absolute top-[130px] right-[100px] w-32 h-[103px]" aria-hidden="true">
        {decorativeDotsGroup1.map((dot, index) => (
          <div
            key={`dot-right-${index}`}
            className={`absolute ${dot.top} ${dot.left} ${dot.size} rounded-full shadow-[0px_0px_20px_#ffffff61] bg-gradient-to-br from-[#d6bdff] to-[#7b2cff] opacity-60`}
          />
        ))}
      </div>

      {/* Main Content */}
      <main role="main">
      <div className="relative z-10 min-h-screen px-6 pt-20">
        {/* Hero Section with SVG - Grid Layout */}
        <section aria-labelledby="hero-heading">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mb-32">
          {/* Left Hero Content - Takes 7 columns */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
        
        {/* Hero Text */}
        <div 
          className={`text-center mb-16 transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 className="mb-4" id="hero-heading">
            <div className="text-[60px] md:text-[80px] font-bold bg-gradient-to-r from-[#8746eb] to-[#a371f7] bg-clip-text text-transparent [text-shadow:0px_4px_34px_#8050ff99] leading-tight mb-2" style={{ fontFamily: "'Saira', sans-serif" }}>
              Welcome to
            </div>
            <div className="text-[70px] md:text-[90px] font-bold text-white leading-tight" style={{ fontFamily: "'Saira', sans-serif" }}>
              CRM Dashboard
            </div>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mt-6 font-light" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300 }}>
            We’re building the future of CRM — powered by AI. Manage leads, automate workflows, and make data-driven decisions faster than ever.
          </p>
        </div>

        {/* CTA Button */}
        <div 
          className={`mb-20 transition-all duration-1000 delay-200 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <button
            onClick={handleGetStarted}
            className="group relative px-12 py-5 bg-gradient-to-r from-[#8243ea] to-[#a371f7] text-white text-xl font-semibold rounded-full shadow-[0px_8px_32px_#8243ea80] hover:shadow-[0px_12px_48px_#8243eacc] transform hover:scale-105 transition-all duration-300 overflow-hidden"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
          >
            <span className="relative z-10 flex items-center gap-3">
              Get Started
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
            {/* Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </button>
        </div>
        </div>

          {/* Right SVG Animation Area - Takes 5 columns (only for hero) */}
          <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Background glow effects - Reduced */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[500px] h-[500px] bg-gradient-to-br from-[#8243ea20] via-[#a371f730] to-transparent rounded-full blur-[100px] opacity-60" 
                  aria-hidden="true"
                />
              </div>

              {/* Single decorative rotating ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[550px] h-[550px] border border-[#8243ea15] rounded-full animate-slow-spin" aria-hidden="true" />
              </div>

              {/* SVG Container with enhanced styling */}
              <div 
                className={`relative z-10 transition-all duration-1000 transform w-full flex items-center justify-center ${
                  isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-20 scale-95'
                }`}
                style={{ transitionDelay: '600ms' }}
              >
                {/* Glow backdrop for SVG */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#8243ea15] to-[#a371f715] rounded-3xl blur-2xl" />
                
                <img 
                  src={automationSvg} 
                  alt="CRM Automation"
                  className="relative w-full h-auto max-w-[700px] px-8 animate-float drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 0 40px rgba(130, 67, 234, 0.3)) drop-shadow(0 0 80px rgba(163, 113, 247, 0.2))'
                  }}
                />
              </div>

              {/* Reduced floating particles - only 2 instead of 4 */}
              <div className="absolute top-1/4 left-1/4 w-2.5 h-2.5 bg-[#8243ea] rounded-full blur-sm animate-float opacity-40" 
                style={{ animationDelay: '0s', animationDuration: '6s' }}
                aria-hidden="true"
              />
              <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-[#a371f7] rounded-full blur-sm animate-float opacity-35" 
                style={{ animationDelay: '2s', animationDuration: '7s' }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        </section>

        {/* Features Section - Full Width */}
        <section aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto">
        <div className="w-full space-y-20 my-32" id="features">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: "'Saira', sans-serif" }} id="features-heading">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 font-light" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300 }}>
              Everything you need to supercharge your business
            </p>
          </div>

          {features.map((feature, index) => (
            <article 
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center justify-between gap-12 w-full`}
            >
              {/* Feature Card */}
              <div
                ref={(el) => (featureRefs.current[index] = el)}
                className={`group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 transition-all duration-500 transform w-full md:w-[48%] ${
                  visibleFeatures.includes(index)
                    ? 'opacity-100 translate-x-0 scale-100'
                    : index % 2 === 0 
                      ? 'opacity-0 -translate-x-20 scale-95'
                      : 'opacity-0 translate-x-20 scale-95'
                } hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-2xl`}
                style={{ 
                  minHeight: '320px',
                  transitionDelay: visibleFeatures.includes(index) ? `${index * 100}ms` : '0ms',
                }}
              >
                {/* Animated glow effect - Reduced intensity */}
                <div 
                  className={`absolute inset-0 rounded-3xl blur-2xl transition-opacity duration-500 ${
                    visibleFeatures.includes(index) ? 'opacity-40' : 'opacity-0'
                  } group-hover:opacity-50`}
                  style={{ 
                    background: `radial-gradient(circle at center, ${feature.glowColor}, transparent 70%)`,
                  }}
                />
                
                <div className="relative z-10 flex flex-col items-center text-center gap-6">
                  {/* Logo Section */}
                  <div className="flex-shrink-0">
                    <div className="relative w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center p-6 group-hover:scale-110 transition-all duration-500">
                      <img 
                        src={feature.logo} 
                        alt={feature.title}
                        className="w-full h-full object-contain filter drop-shadow-2xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {/* Glow ring */}
                      <div 
                        className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
                          visibleFeatures.includes(index) ? 'opacity-100' : 'opacity-0'
                        } group-hover:opacity-100`}
                        style={{ 
                          boxShadow: `0 0 40px ${feature.glowColor}, inset 0 0 30px ${feature.glowColor}`,
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Saira', sans-serif" }}>
                      {feature.title}
                    </h3>
                    <p className="text-lg md:text-xl text-gray-300 font-light" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300 }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                {/* Shine effect on hover - Enhanced */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden z-20 pointer-events-none">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{
                      transform: 'translateX(-100%) skewX(-15deg)',
                      transition: 'transform 0.8s ease-in-out',
                      width: '50%',
                    }}
                  />
                </div>
                
                {/* Animated shine on hover */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden z-20 pointer-events-none">
                  <div 
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    style={{ width: '50%' }}
                  />
                </div>
              </div>

              {/* Info Text Section - Slides in from opposite side */}
              <div 
                ref={(el) => (textRefs.current[index] = el)}
                className={`w-full md:w-[48%] transition-all duration-1000 transform ${
                  visibleTexts.includes(index)
                    ? 'opacity-100 translate-x-0 scale-100'
                    : index % 2 === 0 
                      ? 'opacity-0 translate-x-32 scale-95' // Card on left, text slides from right
                      : 'opacity-0 -translate-x-32 scale-95'   // Card on right, text slides from left
                }`}
                style={{ 
                  transitionDelay: visibleTexts.includes(index) ? `${index * 200 + 200}ms` : '0ms',
                }}
              >
                <div className="space-y-6 text-gray-300" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300 }}>
                  <p className="flex items-start gap-4 text-base md:text-lg leading-relaxed">
                    <span className="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: feature.glowColor }}></span>
                    <span>Streamline your workflow with intelligent automation</span>
                  </p>
                  <p className="flex items-start gap-4 text-base md:text-lg leading-relaxed">
                    <span className="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: feature.glowColor }}></span>
                    <span>Real-time insights and powerful analytics</span>
                  </p>
                  <p className="flex items-start gap-4 text-base md:text-lg leading-relaxed">
                    <span className="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: feature.glowColor }}></span>
                    <span>Seamless integration with your existing tools</span>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Stats Section */}
        <div 
          className={`mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full transition-all duration-1000 delay-800 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          role="region"
          aria-label="Platform statistics"
        >
          {[
            { value: "10K+", label: "Active Users" },
            { value: "50K+", label: "Campaigns Sent" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-[#8243ea] transition-all duration-300"
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#8746eb] to-[#a371f7] bg-clip-text text-transparent mb-2" style={{ fontFamily: "'Saira', sans-serif" }}>
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider font-light" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        </div>
        </section>
      </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0b021c]/95 backdrop-blur-sm" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-[#8243ea]" aria-hidden="true" />
                <span className="text-xl font-bold text-white" style={{ fontFamily: "'Saira', sans-serif" }}>
                  CRM Portal
                </span>
              </div>
              <p className="text-gray-400 text-sm font-light" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300 }}>
                AI-powered CRM for modern businesses. Automate workflows, manage leads, and drive growth.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="text-white font-semibold mb-4" style={{ fontFamily: "'Saira', sans-serif" }}>
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-[#8243ea] transition-colors text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-[#8243ea] transition-colors text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#integrations" className="text-gray-400 hover:text-[#8243ea] transition-colors text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#changelog" className="text-gray-400 hover:text-[#8243ea] transition-colors text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-white font-semibold mb-4" style={{ fontFamily: "'Saira', sans-serif" }}>
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#about" className="text-gray-400 hover:text-[#8243ea] transition-colors text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#careers" className="text-gray-400 hover:text-[#8243ea] transition-colors text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#blog" className="text-gray-400 hover:text-[#8243ea] transition-colors text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-gray-400 hover:text-[#8243ea] transition-colors text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="text-white font-semibold mb-4" style={{ fontFamily: "'Saira', sans-serif" }}>
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#privacy" className="text-gray-400 hover:text-[#8243ea] transition-colors text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-gray-400 hover:text-[#8243ea] transition-colors text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#security" className="text-gray-400 hover:text-[#8243ea] transition-colors text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Security
                  </a>
                </li>
                <li>
                  <a href="#cookies" className="text-gray-400 hover:text-[#8243ea] transition-colors text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300 }}>
              © 2025 CRM Portal. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#twitter" className="text-gray-400 hover:text-[#8243ea] transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#github" className="text-gray-400 hover:text-[#8243ea] transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#linkedin" className="text-gray-400 hover:text-[#8243ea] transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8243ea] to-transparent" />

      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes slow-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes slow-spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.02);
          }
        }

        .animate-slow-spin {
          animation: slow-spin 40s linear infinite;
        }

        .animate-slow-spin-reverse {
          animation: slow-spin-reverse 40s linear infinite;
        }

        .animate-float {
          animation: float 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Respect user's motion preferences */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
          
          .animate-pulse,
          .animate-bounce,
          .animate-float,
          .animate-slow-spin,
          .animate-slow-spin-reverse {
            animation: none !important;
          }
        }

        /* Improve text contrast for better readability */
        .text-gray-200 {
          color: rgb(229 231 235);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
