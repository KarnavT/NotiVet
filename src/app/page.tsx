'use client'

import Link from 'next/link';
import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Stethoscope, 
  Building, 
  ArrowRight, 
  Shield, 
  Database,
  TrendingUp,
  Heart,
  Bell,
  Search,
  BarChart3,
  MessageSquare,
  Star,
  Sparkles,
  Zap,
  Award
} from 'lucide-react';
import Logo from '@/components/Logo';

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          const increment = end / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              setHasAnimated(true);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

// Smooth Typing Effect Component
function TypingRotator({ texts }: { texts: string[] }) {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const colors = ['text-blue-600', 'text-green-600', 'text-purple-600'];
  const words = ['Simpler', 'Smarter', 'Better'];

  useEffect(() => {
    if (!hasStarted) {
      // Start with "Simpler" already typed
      setCurrentText('Simpler');
      const startTimer = setTimeout(() => {
        setHasStarted(true);
        setIsPaused(true);
        // Pause to read, then start deleting
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, 2200); // 2.2s pause to read "Simpler"
      }, 1000);
      return () => clearTimeout(startTimer);
    }

    if (isPaused) return;

    const currentWord = words[currentIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing phase
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.substring(0, currentText.length + 1));
        } else {
          // Word is fully typed, pause before deleting
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, 2200); // 2.2s pause to read the word
        }
      } else {
        // Deleting phase
        if (currentText.length > 0) {
          setCurrentText(currentWord.substring(0, currentText.length - 1));
        } else {
          // Word is fully deleted, move to next word
          setIsDeleting(false);
          setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
          // Small pause before typing next word
          setIsPaused(true);
          setTimeout(() => setIsPaused(false), 300);
        }
      }
    }, isDeleting ? 65 : 100); // Slower typing (100ms), faster deleting (65ms)

    return () => clearTimeout(timeout);
  }, [currentText, currentIndex, isDeleting, hasStarted, isPaused, words]);

  return (
    <span className="relative whitespace-nowrap inline-block">
      <span className="text-gray-900">Made </span>
      <span className={`inline-block ${colors[currentIndex]} transition-colors duration-300`}>
        {currentText}
        <span className="animate-pulse ml-1 text-gray-400 relative -top-0.5">|</span>
      </span>
    </span>
  );
}

// Floating Particles Component
function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-blue-200 rounded-full opacity-20 animate-float"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0px); opacity: 1; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
        }
        @keyframes word-flip {
          0% { transform: rotateX(-90deg); opacity: 0; }
          50% { transform: rotateX(0deg); opacity: 1; }
          100% { transform: rotateX(0deg); opacity: 1; }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        .animate-word-flip {
          animation: word-flip 0.6s ease-out;
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px) scale(1.01);
        }
        .gradient-text {
          background: linear-gradient(-45deg, #3b82f6, #059669, #0284c7, #06d6a0);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 6s ease infinite;
        }
        .gradient-text-fallback {
          color: #2563eb;
        }
        @supports (-webkit-background-clip: text) {
          .gradient-text-fallback {
            background: linear-gradient(-45deg, #3b82f6, #059669, #0284c7, #06d6a0);
            background-size: 400% 400%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradient-shift 6s ease infinite;
          }
        }
      `}</style>
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className={`flex items-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <Logo size="md" variant="full" />
            </div>
            <div className={`hidden md:flex items-center space-x-2 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <button 
                onClick={() => {
                  const ctaSection = document.getElementById('cta-section');
                  ctaSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center text-sm text-green-600 bg-white border-2 border-green-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300 font-medium"
              >
                <span>Register Now</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 overflow-hidden" style={{ backgroundColor: '#f8fafc', backgroundImage: 'linear-gradient(to bottom right, #eff6ff, #f0fdf4, #dbeafe)' }}>
        <FloatingParticles />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-green-600/5" style={{ backgroundSize: '200% 200%', backgroundPosition: '0% 50%' }}></div>
        <div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10"
        >
          <div className="text-center mb-16">
            
            {/* Main Heading */}
            <div className={`transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Veterinary Medical Information
                <span className="block mt-[10px] animate-bounce-in">
                  <TypingRotator texts={['Made Simpler', 'Made Smarter', 'Made Better']} />
                </span>
              </h1>
            </div>
            
            {/* Subtitle */}
            <div className={`transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                Connect pharmaceutical companies with healthcare professionals through 
                <span className="font-semibold text-blue-600"> targeted notifications </span>
                and comprehensive drug databases.
                <br />
              </p>
            </div>
            
            {/* Stats */}
            <div className={`flex flex-wrap justify-center gap-12 mb-16 transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-center group hover-lift cursor-default">
                <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter end={915} suffix="+" />
                </div>
                <div className="text-sm text-gray-600 font-medium flex items-center justify-center">
                  <Database className="w-4 h-4 mr-1 text-blue-500" />
                  Drug Entries
                </div>
              </div>
              <div className="text-center group hover-lift cursor-default">
                <div className="text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter end={9} />
                </div>
                <div className="text-sm text-gray-600 font-medium flex items-center justify-center">
                  <Heart className="w-4 h-4 mr-1 text-green-500" />
                  Species Covered
                </div>
              </div>
              <div className="text-center group hover-lift cursor-default">
                <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter end={24} suffix="/7" />
                </div>
                <div className="text-sm text-gray-600 font-medium flex items-center justify-center">
                  <Zap className="w-4 h-4 mr-1 text-purple-500" />
                  Access
                </div>
              </div>
            </div>
          </div>

          {/* Login Cards */}
          <div className={`grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16 transition-all duration-1000 delay-1200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* HCP Login Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-2xl hover-lift group animate-pulse-glow">
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mx-auto mb-6 transition-transform duration-300 animate-bounce-in">
                <Stethoscope className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Healthcare Professionals
                </h3>
                
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  Access targeted drug notifications, save favorites, and search our comprehensive 
                  veterinary drug database with dosing guidelines and safety information.
                </p>
                
                {/* Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Bell className="w-4 h-4 text-blue-500 mr-3" />
                    <span>Targeted drug notifications</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Heart className="w-4 h-4 text-blue-500 mr-3" />
                    <span>Save favorite drugs</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Search className="w-4 h-4 text-blue-500 mr-3" />
                    <span>Advanced drug search</span>
                  </div>
                </div>
                
                <Link 
                  href="/hcp/login"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center group transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span>Login as HCP</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Pharma Login Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 hover:shadow-2xl hover-lift group animate-pulse-glow">
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-xl mx-auto mb-6 transition-transform duration-300 animate-bounce-in">
                <Building className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Pharmaceutical Companies
                </h3>
                
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  Send targeted drug notifications to veterinarians based on species focus and 
                  specialties. View detailed analytics on message engagement and reach.
                </p>
                
                {/* Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <MessageSquare className="w-4 h-4 text-green-500 mr-3" />
                    <span>Targeted campaigns</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BarChart3 className="w-4 h-4 text-green-500 mr-3" />
                    <span>Engagement analytics</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-3" />
                    <span>Performance tracking</span>
                  </div>
                </div>
                
                <Link 
                  href="/pharma/login"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center group transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span>Login as Pharma</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 gradient-text mb-4">
              Everything you need in one platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From comprehensive drug databases to targeted notifications and detailed analytics
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl hover-lift group transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4 group-hover:scale-110 transition-all duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">Targeted Notifications</h4>
              <p className="text-gray-600 leading-relaxed">
                Pharmaceutical companies can send precisely targeted drug information to veterinarians 
                based on their species focus and specialties, ensuring relevant content reaches the right professionals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl hover-lift group transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mb-4 group-hover:scale-110 transition-all duration-300">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">Comprehensive Database</h4>
              <p className="text-gray-600 leading-relaxed">
                Search through 915+ drugs by species, symptoms, and delivery methods. Access complete dosing guidelines, 
                contraindications, withdrawal times, and FARAD information in one centralized location.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl hover-lift group transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-lg mb-4 group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">Analytics Dashboard</h4>
              <p className="text-gray-600 leading-relaxed">
                Pharmaceutical companies can track detailed message engagement metrics, open rates, and 
                reach across different veterinary segments with comprehensive analytics and reporting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div id="cta-section" className="py-16 relative overflow-hidden animate-gradient" style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 25%, #10b981 50%, #60a5fa 75%, #2563eb 100%)', backgroundSize: '200% 200%' }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full animate-float"></div>
          <div className="absolute top-20 -right-10 w-32 h-32 bg-blue-100 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-10 left-1/2 w-48 h-48 bg-blue-200 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6 animate-bounce-in">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join the growing community of veterinary professionals and pharmaceutical companies 
            using NotiVet to stay connected and informed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/hcp/register"
              className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover-lift"
            >
              <span className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Register as HCP
              </span>
            </Link>
            <Link 
              href="/pharma/register"
              className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover-lift"
            >
              <span className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Register as Pharma
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-300 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6 animate-bounce-in">
              <Logo size="md" variant="full" className="text-blue-400" />
            </div>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Connecting pharmaceutical companies with healthcare professionals through 
              targeted drug information and comprehensive databases.
            </p>
            <div className="flex justify-center space-x-8 mb-6">
              <div className="text-center group hover-lift cursor-default">
                <div className="text-xl font-bold text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter end={918} suffix="+" />
                </div>
                <div className="text-sm text-gray-400">Drugs</div>
              </div>
              <div className="text-center group hover-lift cursor-default">
                <div className="text-xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter end={9} />
                </div>
                <div className="text-sm text-gray-400">Species</div>
              </div>
              <div className="text-center group hover-lift cursor-default">
                <div className="text-xl font-bold text-purple-400 group-hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter end={24} suffix="/7" />
                </div>
                <div className="text-sm text-gray-400">Access</div>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 NotiVet. Built for healthcare professionals and pharmaceutical partners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
