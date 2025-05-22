'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { 
  ArrowRight, Shield, Clock, Users, Award, ChevronRight, 
  BarChart3, FileText, DollarSign, Star, ClipboardCheck, Building, UserCog,
  CheckCircle, Layers, CircleDollarSign, BarChart, Activity, LucideIcon, X, Bell, Home, Settings,
  Lock, Check, Server, Play, Share2, Smartphone, Headset, MapPin, UserPlus, Database, BookOpen,
  Calendar, MessageSquare, Phone, Mail, PhoneCall
} from 'lucide-react';
import { AgentDashboardPreview, ManagerDashboardPreview } from '../components/InteractiveDashboards';
import { CarrierLogoSlider } from '../components/ui/carrier-logo-slider';

// Interactive Status Badge Component using CSS classes from layout.tsx
const StatusBadge = ({ status }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return <span>{status}</span>;
  
  let className = '';
  
  switch(status) {
    case 'In Progress':
      className = 'status-green';
      break;
    case 'Review':
      className = 'status-yellow';
      break;
    case 'Submitted':
      className = 'status-blue';
      break;
    default:
      className = 'status-blue';
  }
  
  return (
    <span className={className}>
      {status}
    </span>
  );
};

// Modal component for "Learn more" pop-ups
const Modal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-xl">
        <div className="sticky top-0 bg-white p-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {content}
        </div>
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Modal content for "Learn more" pop-ups
  const modalContent = {
    applicationManagement: (
      <div className="space-y-4">
        <p>Our Application Management system provides a comprehensive solution for insurance agents to submit, track, and manage applications efficiently.</p>
        <h4 className="font-bold text-lg mt-4">Key Features:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Digital application forms with automatic validation</li>
          <li>Real-time status tracking from submission to approval</li>
          <li>Automated notifications for status changes</li>
          <li>Document management with secure storage</li>
          <li>Client signature collection through our secure portal</li>
          <li>Integration with carrier systems for seamless submission</li>
        </ul>
        <p className="mt-4">With our streamlined process, you can eliminate paperwork, reduce errors, and close applications faster than ever before.</p>
      </div>
    ),
    commissionTracking: (
      <div className="space-y-4">
        <p>Never lose track of your earnings with our comprehensive Commission Tracking system.</p>
        <h4 className="font-bold text-lg mt-4">Key Features:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Automated commission calculation based on policy type</li>
          <li>Real-time tracking of all commission payments</li>
          <li>Detailed reports with filtering options</li>
          <li>Commission forecasting based on pending applications</li>
          <li>Alerts for missed or delayed payments</li>
          <li>Integration with accounting software</li>
        </ul>
        <p className="mt-4">Our system ensures transparency and accuracy in commission payments, helping you focus on growing your business instead of chasing payments.</p>
      </div>
    ),
    clientManagement: (
      <div className="space-y-4">
        <p>Build stronger relationships with clients using our Client Management system that keeps all information organized and accessible.</p>
        <h4 className="font-bold text-lg mt-4">Key Features:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Comprehensive client profiles with contact information</li>
          <li>Policy tracking and renewal reminders</li>
          <li>Communication history tracking</li>
          <li>Secure document sharing</li>
          <li>Client portal for self-service options</li>
          <li>Automated follow-up reminders</li>
        </ul>
        <p className="mt-4">Keep all your client information in one place and provide exceptional service with timely follow-ups and personalized communication.</p>
      </div>
    ),
    analytics: (
      <div className="space-y-4">
        <p>Make data-driven decisions with our Advanced Analytics tools that provide deep insights into your insurance business.</p>
        <h4 className="font-bold text-lg mt-4">Key Features:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Customizable dashboards with key performance indicators</li>
          <li>Sales performance metrics by product, carrier, and period</li>
          <li>Trend analysis for business growth</li>
          <li>Client acquisition and retention metrics</li>
          <li>Commission analysis and forecasting</li>
          <li>Export capabilities for further analysis</li>
        </ul>
        <p className="mt-4">Transform raw data into actionable insights that help you identify opportunities, optimize performance, and grow your insurance business.</p>
      </div>
    ),
    scriptAssistant: (
      <div className="space-y-4">
        <p>Close more sales with our AI Script Assistant that provides intelligent conversation guidance during client calls.</p>
        <h4 className="font-bold text-lg mt-4">Key Features:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>AI-powered conversation suggestions in real-time</li>
          <li>Product-specific talking points and rebuttals</li>
          <li>Objection handling assistance</li>
          <li>Compliance-checked script templates</li>
          <li>Voice analysis for tone and pace recommendations</li>
          <li>Call recording and analysis for improvement</li>
        </ul>
        <p className="mt-4">Our AI assistant acts as your personal coach during calls, helping you communicate more effectively and close more sales with confidence.</p>
      </div>
    ),
    performanceTracking: (
      <div className="space-y-4">
        <p>Monitor and improve performance with our comprehensive tracking tools designed for both individual agents and teams.</p>
        <h4 className="font-bold text-lg mt-4">Key Features:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Individual performance metrics and goals</li>
          <li>Team performance dashboards for managers</li>
          <li>Conversion rate tracking at each sales stage</li>
          <li>Comparison reports against benchmarks</li>
          <li>Productivity metrics and time management analysis</li>
          <li>Coaching opportunity identification</li>
        </ul>
        <p className="mt-4">Identify strengths and growth opportunities with data-driven performance tracking that motivates agents and drives continuous improvement.</p>
      </div>
    ),
    agentFeatures: (
      <div className="space-y-4">
        <p>LegacyCore provides insurance agents with all the tools needed to streamline workflows and increase sales.</p>
        <h4 className="font-bold text-lg mt-4">Complete Agent Features:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Digital application submission with carrier integration</li>
          <li>Real-time commission tracking and reporting</li>
          <li>Comprehensive client management system</li>
          <li>AI-powered sales scripts and call assistance</li>
          <li>Automated policy renewal notifications</li>
          <li>Document management with secure storage</li>
          <li>Calendar integration for appointment scheduling</li>
          <li>Mobile app for on-the-go access</li>
          <li>Performance analytics dashboard</li>
          <li>Training resources and product guides</li>
        </ul>
      </div>
    ),
    managerFeatures: (
      <div className="space-y-4">
        <p>Empower your agency with LegacyCore's comprehensive tools designed specifically for insurance managers.</p>
        <h4 className="font-bold text-lg mt-4">Complete Manager Features:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Full visibility into agent activities and performance</li>
          <li>Team performance dashboards and analytics</li>
          <li>Commission hierarchy management and reporting</li>
          <li>Centralized application review and approval</li>
          <li>Agent onboarding and training tools</li>
          <li>Territory management and assignment</li>
          <li>Compliance monitoring and reporting</li>
          <li>Team goal setting and tracking</li>
          <li>Resource allocation optimization</li>
          <li>Agency growth analytics and forecasting</li>
        </ul>
      </div>
    )
  };

  const stats = [
    { value: "24K+", label: "Applications Processed" },
    { value: "$5.2M+", label: "Monthly Revenue" },
    { value: "98%", label: "Client Satisfaction" },
    { value: "30%", label: "Higher Closing Rate" },
  ];

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Add favicon */}
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      
      {/* Modal component */}
      <Modal 
        isOpen={activeModal !== null} 
        onClose={() => setActiveModal(null)} 
        title={activeModal ? `${activeModal.charAt(0).toUpperCase() + activeModal.slice(1).replace(/([A-Z])/g, ' $1')}` : ''}
        content={activeModal ? modalContent[activeModal] : null}
      />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm py-3">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="LegacyCore Logo"
                style={{ width: 40, height: 40, objectFit: 'contain' }}
                className="mr-3"
              />
              <h1 className="text-2xl font-bold text-gray-900">LegacyCore</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#solutions" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Solutions</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Pricing</a>
              <Link href="/documentation" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Documentation</Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Log In</Link>
              <Link href="/signup" className="hidden md:inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                The <span className="text-blue-600">All-in-One</span> <span className="text-blue-600">Platform</span> for Insurance Professionals
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Streamline applications, track commissions, and grow your business with the industry's most comprehensive insurance management solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/signup" 
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 hover:shadow-lg transition-all text-center"
                >
                  Start Your Free Trial
                </Link>
                <a 
                  href="#demo" 
                  className="text-gray-700 underline hover:text-blue-600 transition-colors px-4 py-2 text-lg font-medium text-center"
                >
                  Watch Demo
                </a>
              </div>
              <div className="mt-8 text-sm text-gray-500">
                No credit card required • 14-day free trial • Cancel anytime
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 relative overflow-hidden">
                <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  DASHBOARD PREVIEW
                </div>
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Agent Dashboard</h3>
                    <p className="text-sm text-gray-500">Welcome back, Sarah!</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                      SJ
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Overview</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, i) => (
                      <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-500">{stat.label}</p>
                          {i % 2 === 0 ? (
                            <div className="text-green-500 text-xs flex items-center">
                              <ChevronRight className="h-3 w-3 rotate-90" /> 12%
                            </div>
                          ) : (
                            <div className="text-blue-500 text-xs flex items-center">
                              <Activity className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Recent Applications</h4>
                    <span className="text-xs text-blue-600">View all</span>
                  </div>
                  {/* Completely hardcoded table with inline styles */}
                  <div dangerouslySetInnerHTML={{ __html: `
                    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <table class="w-full text-sm">
                        <thead class="bg-gray-50 text-xs text-gray-500">
                          <tr>
                            <th class="py-2 px-3 text-left">CLIENT</th>
                            <th class="py-2 px-3 text-left">POLICY</th>
                            <th class="py-2 px-3 text-left">STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="border-t border-gray-100">
                            <td class="py-2 px-3">John Smith</td>
                            <td class="py-2 px-3">Term Life</td>
                            <td class="py-2 px-3">
                              <span style="display: inline-block; background-color: rgb(240, 253, 244); color: rgb(22, 163, 74); border-radius: 9999px; font-size: 0.75rem; font-weight: 500; padding: 0.25rem 0.5rem;">
                                In Progress
                              </span>
                            </td>
                          </tr>
                          <tr class="border-t border-gray-100">
                            <td class="py-2 px-3">Maria Garcia</td>
                            <td class="py-2 px-3">Health</td>
                            <td class="py-2 px-3">
                              <span style="display: inline-block; background-color: rgb(254, 252, 232); color: rgb(202, 138, 4); border-radius: 9999px; font-size: 0.75rem; font-weight: 500; padding: 0.25rem 0.5rem;">
                                Review
                              </span>
                            </td>
                          </tr>
                          <tr class="border-t border-gray-100">
                            <td class="py-2 px-3">Robert Chen</td>
                            <td class="py-2 px-3">Auto</td>
                            <td class="py-2 px-3">
                              <span style="display: inline-block; background-color: rgb(239, 246, 255); color: rgb(37, 99, 235); border-radius: 9999px; font-size: 0.75rem; font-weight: 500; padding: 0.25rem 0.5rem;">
                                Submitted
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ` }} />
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Home className="h-3 w-3" />
                      <span>Dashboard</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <FileText className="h-3 w-3" />
                      <span>Applications</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>Clients</span>
                    </div>
                  </div>
                  <div className="text-blue-600">
                    <Settings className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Tracking Section with Infinite Slider */}
      <CarrierLogoSlider />

      {/* Product Demo Video */}
      <section id="demo" className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">See LegacyCore in Action</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how insurance professionals use LegacyCore to streamline their workflows and grow their business.
            </p>
          </div>
          
          <div className="relative mx-auto max-w-5xl rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center relative">
              <img 
                src="/images/video-thumbnail.jpg" 
                alt="LegacyCore Demo Video" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect fill="%23f0f9ff" width="800" height="450"/><text fill="%233b82f6" font-family="Arial" font-size="32" x="230" y="225">LegacyCore Demo Video</text></svg>';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-blue-600 bg-opacity-90 rounded-full p-5 cursor-pointer hover:bg-opacity-100 transition-all shadow-lg">
                  <Play className="h-12 w-12 text-white" fill="white" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl mb-1">LegacyCore Platform Overview</h3>
                  <p className="text-gray-300 text-sm">3:42 • Watch how it works</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <a href="#features" className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-sm font-medium">
                    Explore Features
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mt-12 justify-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:w-1/3">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Mobile Optimized</h3>
                  <p className="text-gray-600 text-sm">Access your dashboard, manage applications, and track commissions on any device.</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:w-1/3">
              <div className="flex items-start mb-4">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Quick Implementation</h3>
                  <p className="text-gray-600 text-sm">Get up and running in under 48 hours with our streamlined onboarding process.</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:w-1/3">
              <div className="flex items-start mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                  <Headset className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">24/7 Support</h3>
                  <p className="text-gray-600 text-sm">Our support team is available around the clock to help you make the most of LegacyCore.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 bg-white w-full border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why LegacyCore?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform delivers measurable results for insurance professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "62% Faster Application Processing",
                description: "Our digital application system reduces processing time from an average of 5.2 days to just 2 days, allowing you to bind policies faster.",
                icon: FileText
              },
              {
                title: "23% Higher Commission Recovery",
                description: "Our tracking system identifies and recovers missed commissions, with clients averaging $2,800 in additional monthly revenue.",
                icon: CircleDollarSign
              },
              {
                title: "30% Increase in Closing Rate",
                description: "Agents using our AI script assistant report closing 30% more sales compared to traditional methods, directly impacting your bottom line.",
                icon: Star
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-5">
                  <benefit.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with clearer organization */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features for Insurance Professionals</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage applications, track commissions, and grow your business.
            </p>
          </div>
          
          {/* Feature Categories */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white rounded-lg p-1 border border-gray-200">
              <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium">All Features</button>
              <button className="px-4 py-2 rounded-md text-gray-700 font-medium">For Agents</button>
              <button className="px-4 py-2 rounded-md text-gray-700 font-medium">For Managers</button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="h-10 w-10 text-blue-600" />,
                title: "Application Management",
                description: "Reduce application processing time by 62% with digital forms and automated underwriting rules that catch errors before submission.",
                action: () => setActiveModal('applicationManagement'),
                link: "#application-management"
              },
              {
                icon: <DollarSign className="h-10 w-10 text-blue-600" />,
                title: "Commission Tracking",
                description: "Track and reconcile 100% of your commission payments automatically, identifying discrepancies that recover an average of $2,800 monthly.",
                action: () => setActiveModal('commissionTracking'),
                link: "#commission-tracking"
              },
              {
                icon: <Users className="h-10 w-10 text-blue-600" />,
                title: "Client Management",
                description: "Improve retention by 22% with our automated follow-up system that ensures no client falls through the cracks after policy purchase.",
                action: () => setActiveModal('clientManagement'),
                link: "#client-management"
              },
              {
                icon: <BarChart className="h-10 w-10 text-blue-600" />,
                title: "Performance Analytics",
                description: "Identify your highest-performing sales strategies with customizable dashboards that highlight KPIs driving 80% of your business growth.",
                action: () => setActiveModal('analytics'),
                link: "#analytics"
              },
              {
                icon: <Layers className="h-10 w-10 text-blue-600" />,
                title: "AI Script Assistant",
                description: "Increase closing rates by 30% with our AI assistant that analyzes successful calls and suggests proven responses to client objections.",
                action: () => setActiveModal('scriptAssistant'),
                link: "#script-assistant"
              },
              {
                icon: <Activity className="h-10 w-10 text-blue-600" />,
                title: "Multi-Agent Management",
                description: "Reduce agent training time from 6 weeks to 10 days with standardized workflows and performance benchmarking against top producers.",
                action: () => setActiveModal('performanceTracking'),
                link: "#agent-management"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                id={feature.link.substring(1)} 
                className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-5">{feature.description}</p>
                <button
                  onClick={feature.action}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/documentation" className="text-blue-600 hover:text-blue-700 underline transition-all">
              View all features documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Solutions Section with improved transitions */}
      <section id="solutions" className="py-20 bg-white border-t border-b border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold">TAILORED FOR YOUR ROLE</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 mt-2">Solutions by Role</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're an individual agent or managing a team, we have the right solution for you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Insurance Agents</h3>
              <p className="text-gray-600 mb-6">
                Everything you need to streamline your workflow, manage applications, track commissions, and grow your client base.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Digital application submission with 62% faster processing',
                  'Commission tracking recovering an average of $2,800 monthly',
                  'Client management with 22% improved retention',
                  'AI-powered sales assistant increasing closing rates by 30%',
                  'Performance analytics identifying top-performing strategies',
                  'Document management with secure client portal'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <div className="text-green-500 mr-3 mt-1 flex-shrink-0">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setActiveModal('agentFeatures')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                Learn More
              </button>
            </div>
            <div className="order-1 md:order-2">
              <div className="bg-blue-50 rounded-xl overflow-hidden shadow-md border border-blue-100 p-4">
                <AgentDashboardPreview />
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-blue-50 rounded-xl overflow-hidden shadow-md border border-blue-100 p-4">
                <ManagerDashboardPreview />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Agency Managers</h3>
              <p className="text-gray-600 mb-6">
                Gain visibility into your team's performance, manage commissions, and drive business growth with our comprehensive tools.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Team performance dashboards with KPI tracking',
                  'Agent onboarding reduced from 6 weeks to 10 days',
                  'Commission hierarchy with automated split calculations',
                  'Advanced reporting with 34% improved conversion analytics',
                  'Territory assignment optimization',
                  'Compliance monitoring and audit-ready reporting'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <div className="text-green-500 mr-3 mt-1 flex-shrink-0">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setActiveModal('managerFeatures')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Challenges Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Section heading */}
          <h2 className="text-3xl font-bold text-center mb-4">Industry Challenges We're Solving</h2>
          <p className="text-center text-gray-600 mb-12">LegacyCore is built to address the most pressing challenges facing insurance professionals today.</p>

          {/* Industry statistics grid - replace fake customer numbers */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {/* Stat 1 */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-blue-600 mb-4">
                {/* Time icon */}
                <svg className="h-8 w-8 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">62%</h3>
              <p className="text-gray-600">of agents spend 15+ hours weekly on administrative tasks</p>
              <p className="text-xs text-gray-500 mt-2">Source: Insurance Journal Survey, 2023</p>
          </div>
          
            {/* Stat 2 */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-blue-600 mb-4">
                <svg className="h-8 w-8 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">23%</h3>
              <p className="text-gray-600">average commission leakage due to tracking inefficiencies</p>
              <p className="text-xs text-gray-500 mt-2">Source: McKinsey Insurance Report, 2023</p>
            </div>
            
            {/* Stat 3 */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-blue-600 mb-4">
                <svg className="h-8 w-8 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">$8,200</h3>
              <p className="text-gray-600">average monthly revenue lost to commission tracking errors</p>
              <p className="text-xs text-gray-500 mt-2">Source: IIABA Agency Universe Study, 2023</p>
            </div>
            
            {/* Stat 4 */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-blue-600 mb-4">
                <svg className="h-8 w-8 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">78%</h3>
              <p className="text-gray-600">of agencies lack integrated digital workflows</p>
              <p className="text-xs text-gray-500 mt-2">Source: Deloitte Insurance Tech Survey, 2023</p>
            </div>
              </div>

          {/* Expert insights instead of fake customer testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
            {/* Expert 1 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-blue-500 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804 .167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                </svg>
              </div>
              <p className="text-gray-700 mb-6">"Digital transformation in insurance isn't optional—it's essential. Agencies that streamline application processing through automation typically see a 40-60% reduction in processing time."</p>
              <div className="flex items-center">
                <div className="rounded-full overflow-hidden mr-4 flex-shrink-0 bg-blue-100 text-blue-600 w-12 h-12 flex items-center justify-center">
                  <span className="font-medium">EI</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Emily Ivers</h4>
                  <p className="text-gray-500 text-sm">Insurance Technology Analyst, Forrester Research</p>
                </div>
            </div>
          </div>
          
            {/* Expert 2 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-blue-500 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804 .167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804 .167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                  </svg>
                </div>
              <p className="text-gray-700 mb-6">"Our research found that agencies using integrated commission tracking systems recover an average of 22% more revenue compared to those using disconnected tracking methods."</p>
                <div className="flex items-center">
                <div className="rounded-full overflow-hidden mr-4 flex-shrink-0 bg-blue-100 text-blue-600 w-12 h-12 flex items-center justify-center">
                  <span className="font-medium">RD</span>
                  </div>
                  <div>
                  <h4 className="font-medium text-gray-900">Robert Davis</h4>
                  <p className="text-gray-500 text-sm">Director of Research, Insurance Information Institute</p>
                  </div>
                </div>
              </div>
            
            {/* Expert 3 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-blue-500 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804 .167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804 .167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                </svg>
              </div>
              <p className="text-gray-700 mb-6">"The most successful agencies today are using AI-driven tools to enhance their client interactions. These agencies report 30-35% higher closing rates on average compared to those using traditional methods."</p>
              <div className="flex items-center">
                <div className="rounded-full overflow-hidden mr-4 flex-shrink-0 bg-blue-100 text-blue-600 w-12 h-12 flex items-center justify-center">
                  <span className="font-medium">JW</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Jennifer Wilson</h4>
                  <p className="text-gray-500 text-sm">Chief Digital Officer, National Association of Insurance Agents</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Replace case study with industry trend report */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="uppercase text-blue-600 font-medium text-sm mb-2">INDUSTRY TREND REPORT</div>
              <h3 className="text-xl font-bold mb-4">Digital Transformation in Insurance</h3>
              <p className="text-gray-600 mb-4">Recent industry analysis reveals that agencies embracing digital transformation are seeing dramatic improvements in operational efficiency:</p>
              
              <ul className="space-y-4 mb-6">
                  <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Average 55-65% reduction in application processing time</span>
                  </li>
                  <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>25-40% improvement in client retention rates</span>
                  </li>
                  <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Recovery of $140,000-$180,000 annually in commissions for mid-sized agencies</span>
                  </li>
                </ul>
              
              <p className="text-gray-500 text-sm">Source: McKinsey & Company, "The Future of Insurance: Digital Transformation," 2023</p>
              
              <a href="#" className="text-blue-600 hover:underline flex items-center mt-4">
                Read the full industry report
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                </a>
              </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">See How LegacyCore Helps</h3>
                <p className="text-gray-600 mb-6">Discover how our platform addresses these industry challenges through modern, integrated solutions.</p>
                <a href="#features" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  Explore Features
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold uppercase tracking-wider">SEAMLESS CONNECTIVITY</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 mt-2">Powerful Integrations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              LegacyCore connects with all major insurance carriers and business tools, ensuring a smooth workflow.
            </p>
          </div>
          
          <div className="mb-16">
            <div className="insurance-specialization">
              <h3 className="text-lg font-medium mb-4">Specialized for Life Insurance Professionals</h3>
              <p className="text-gray-600 mb-4">
                LegacyCore is built specifically for life insurance agents, with tools designed to streamline client management, application processing, and commission tracking for all types of life insurance products.
                </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-lg">Life Insurance Products</h4>
                </div>
                  <ul className="space-y-3 ml-4">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="font-medium">Term Life</span>
                        <p className="text-sm text-gray-600">10, 15, 20, and 30-year terms</p>
              </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
              <div>
                        <span className="font-medium">Whole Life</span>
                        <p className="text-sm text-gray-600">Permanent coverage with cash value</p>
                    </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="font-medium">Universal Life</span>
                        <p className="text-sm text-gray-600">Flexible premiums and death benefits</p>
                </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="font-medium">Final Expense</span>
                        <p className="text-sm text-gray-600">Simplified issue coverage</p>
              </div>
                    </li>
                  </ul>
          </div>
          
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 relative">
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    Coming Soon
                </div>
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-lg">Mortgage Protection</h4>
                  </div>
                  <p className="text-gray-700 mb-4">
                    We're expanding our platform to include specialized tools for mortgage protection insurance, helping you protect your clients' most valuable asset.
                  </p>
                  <ul className="space-y-2 ml-1 text-gray-600">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Dedicated mortgage protection workflows</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Home value and mortgage tracking</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Multi-carrier quote comparison tools</span>
                    </li>
                  </ul>
                  <div className="mt-4">
                    <a href="#" className="text-blue-600 hover:underline flex items-center text-sm font-medium">
                      Join our early access program
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          </div>
          

          

        </div>
      </section>

      {/* Competitive Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold uppercase tracking-wider">COMPARISON</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 mt-2">Why Choose LegacyCore</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how LegacyCore compares to other insurance management solutions on the market.
            </p>
          </div>
          
          <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-4 px-6 text-left font-medium text-gray-500 border-b border-gray-200 min-w-[180px]">Features</th>
                    <th className="py-4 px-6 text-center font-bold text-blue-600 border-b border-gray-200 min-w-[150px]">
                      <div className="flex flex-col items-center">
                        <span className="text-lg">LegacyCore</span>
                        <span className="text-sm font-normal text-gray-500 mt-1">All-in-one platform</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-center font-medium text-gray-500 border-b border-gray-200 min-w-[150px]">
                      <div className="flex flex-col items-center">
                        <span className="text-lg">Legacy Systems</span>
                        <span className="text-sm font-normal text-gray-400 mt-1">Traditional software</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-center font-medium text-gray-500 border-b border-gray-200 min-w-[150px]">
                      <div className="flex flex-col items-center">
                        <span className="text-lg">Generic CRMs</span>
                        <span className="text-sm font-normal text-gray-400 mt-1">Not insurance-specific</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Insurance-specific workflows', legacyCore: true, legacy: true, generic: false },
                    { feature: 'Real-time commission tracking', legacyCore: true, legacy: false, generic: false },
                    { feature: 'Carrier connectivity API framework', legacyCore: true, legacy: 'Limited', generic: false },
                    { feature: 'AI-powered sales assistant', legacyCore: true, legacy: false, generic: false },
                    { feature: 'Mobile accessibility', legacyCore: true, legacy: false, generic: true },
                    { feature: 'Implementation time', legacyCore: '2 days', legacy: '2-4 weeks', generic: '1-2 weeks' },
                    { feature: 'Customer support', legacyCore: '24/7 dedicated', legacy: 'Business hours', generic: 'Business hours' },
                    { feature: 'Cost', legacyCore: 'From $29/mo', legacy: '$100+/mo', generic: '$50+/mo' },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-4 px-6 text-left font-medium text-gray-900 border-b border-gray-200">{row.feature}</td>
                      <td className="py-4 px-6 text-center border-b border-gray-200">
                        {typeof row.legacyCore === 'boolean' ? (
                          row.legacyCore ? (
                            <div className="flex justify-center">
                              <div className="text-green-500">
                                <CheckCircle className="h-6 w-6" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="text-red-500">
                                <X className="h-6 w-6" />
                              </div>
                            </div>
                          )
                        ) : (
                          <span className="font-medium text-blue-600">{row.legacyCore}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center border-b border-gray-200">
                        {typeof row.legacy === 'boolean' ? (
                          row.legacy ? (
                            <div className="flex justify-center">
                              <div className="text-green-500">
                                <CheckCircle className="h-6 w-6" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="text-red-500">
                                <X className="h-6 w-6" />
                              </div>
                            </div>
                          )
                        ) : (
                          <span className="text-gray-700">{row.legacy}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center border-b border-gray-200">
                        {typeof row.generic === 'boolean' ? (
                          row.generic ? (
                            <div className="flex justify-center">
                              <div className="text-green-500">
                                <CheckCircle className="h-6 w-6" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="text-red-500">
                                <X className="h-6 w-6" />
                              </div>
                            </div>
                          )
                        ) : (
                          <span className="text-gray-700">{row.generic}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Link href="/signup" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all text-center">
              Get Started with LegacyCore
            </Link>
          </div>
        </div>
      </section>

      {/* Support & Onboarding Section */}
      <div className="support-section py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="uppercase text-blue-600 font-medium text-sm mb-2">CUSTOMER SUCCESS</div>
            <h2 className="text-3xl font-bold mb-4">We're Here to Help You Succeed</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From initial setup to ongoing assistance, our support team is committed to helping you get the most out of LegacyCore.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Implementation Process */}
            <div>
              <h3 className="text-xl font-bold mb-6">Getting Started</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center text-blue-600 font-medium mr-4 flex-shrink-0">
                    1
                      </div>
                  <div>
                    <h4 className="font-medium">Initial Setup</h4>
                    <p className="text-gray-600">Create your account, customize your profile, and add your team members.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center text-blue-600 font-medium mr-4 flex-shrink-0">
                    2
                    </div>
                    <div>
                    <h4 className="font-medium">Data Organization</h4>
                    <p className="text-gray-600">Import and organize your client information and policy details.</p>
                      </div>
                    </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center text-blue-600 font-medium mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Training & Configuration</h4>
                    <p className="text-gray-600">Learn how to use the platform effectively with our guided training resources.</p>
                  </div>
            </div>
            
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center text-blue-600 font-medium mr-4 flex-shrink-0">
                    4
                  </div>
            <div>
                    <h4 className="font-medium">Launch</h4>
                    <p className="text-gray-600">Start using LegacyCore with continued support from our team.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Support Options */}
                  <div>
              <h3 className="text-xl font-bold mb-6">Ongoing Support</h3>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-4 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Responsive Support Team</h4>
                      <p className="text-gray-600 mb-2">Our support team is available during business hours to assist with any questions or issues.</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        (800) 555-1234
                    </div>
                  </div>
                </div>
              </div>
              
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-4 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                  </div>
                  <div>
                      <h4 className="font-medium">Knowledge Resources</h4>
                      <p className="text-gray-600 mb-2">Access our library of tutorials, guides, and best practices to maximize your use of LegacyCore.</p>
                      <a href="#" className="text-blue-600 hover:underline text-sm flex items-center">
                        Browse resources
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                  </div>
                </div>
              </div>
              
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-4 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                  </div>
                  <div>
                      <h4 className="font-medium">Enhanced Support for Enterprise</h4>
                      <p className="text-gray-600 mb-2">Enterprise plan subscribers receive priority support and additional resources.</p>
                      <a href="#" className="text-blue-600 hover:underline text-sm flex items-center">
                        Learn about Enterprise plans
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <a href="#" className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule a Demo
            </a>
            <a href="#" className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with Sales
            </a>
            <a href="tel:8005552345" className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call (800) 555-2345
            </a>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold uppercase tracking-wider">QUESTIONS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 mt-2">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about LegacyCore's platform, pricing, and implementation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                question: "How long does implementation take?",
                answer: "Most customers are up and running within 48 hours. Our implementation team will guide you through the entire process, including data migration, training, and configuration."
              },
              {
                question: "Can I import my existing client data?",
                answer: "Yes, LegacyCore offers multiple import options. You can upload CSV files, connect directly to common CRMs, or have our team assist with a custom migration for larger datasets."
              },
              {
                question: "Which insurance carriers do you integrate with?",
                answer: "LegacyCore integrates with 40+ major insurance carriers including Prudential, MetLife, New York Life, MassMutual, Northwestern Mutual, and many more. View our full list of carrier integrations in our documentation."
              },
              {
                question: "Is my data secure with LegacyCore?",
                answer: "Absolutely. LegacyCore is SOC 2, GDPR, and HIPAA compliant. We use bank-level encryption for all data, both in transit and at rest. Our platform undergoes regular security audits and penetration testing."
              },
              {
                question: "Can I use LegacyCore on my mobile device?",
                answer: "Yes, LegacyCore is fully responsive and works on any device. We also offer native mobile apps for iOS and Android that allow you to manage applications, track commissions, and communicate with clients on the go."
              },
              {
                question: "What kind of support is included?",
                answer: "All plans include 24/7 email and chat support. Professional and Enterprise plans include phone support and priority response times. Enterprise customers also receive a dedicated account manager."
              },
              {
                question: "Can I cancel my subscription at any time?",
                answer: "Yes, LegacyCore offers monthly plans with no long-term contracts. You can cancel your subscription at any time without penalty. We also offer annual plans at a discount for those who prefer that option."
              },
              {
                question: "Do you offer custom development for specific needs?",
                answer: "Yes, our Enterprise plan includes options for custom development and integrations. Contact our sales team to discuss your specific requirements and how we can tailor LegacyCore to your business."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-6">Don't see your question here?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#" className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all">
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat with Support
              </a>
              <a href="#" className="inline-flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all">
                <Mail className="mr-2 h-5 w-5" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-50 w-full">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-blue-600 rounded-xl overflow-hidden shadow-xl">
            <div className="px-8 py-12 md:p-14">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Ready to elevate your insurance business?
                  </h2>
                  <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                    Join thousands of insurance professionals who have transformed their business with LegacyCore.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                      href="/signup" 
                      className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:shadow-lg transition-all flex items-center justify-center"
                    >
                      Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <a href="#" className="flex items-center text-blue-100 hover:text-white">
                      <Calendar className="mr-2 h-5 w-5" />
                      <span>Schedule Demo</span>
                    </a>
                    <a href="#" className="flex items-center text-blue-100 hover:text-white">
                      <PhoneCall className="mr-2 h-5 w-5" />
                      <span>Contact Sales</span>
                    </a>
                    <a href="#" className="flex items-center text-blue-100 hover:text-white">
                      <Mail className="mr-2 h-5 w-5" />
                      <span>Newsletter</span>
                    </a>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                    <h3 className="text-white text-xl font-bold mb-6">Everything you need to succeed:</h3>
                    <ul className="space-y-4">
                      <li className="flex items-center text-white">
                        <div className="mr-3 text-green-300 flex-shrink-0">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <span>Streamlined application processing</span>
                      </li>
                      <li className="flex items-center text-white">
                        <div className="mr-3 text-green-300 flex-shrink-0">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <span>Complete commission tracking and reporting</span>
                      </li>
                      <li className="flex items-center text-white">
                        <div className="mr-3 text-green-300 flex-shrink-0">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <span>Comprehensive client management tools</span>
                      </li>
                      <li className="flex items-center text-white">
                        <div className="mr-3 text-green-300 flex-shrink-0">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <span>Advanced analytics and performance metrics</span>
                      </li>
                      <li className="flex items-center text-white">
                        <div className="mr-3 text-green-300 flex-shrink-0">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <span>AI-powered sales assistance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center mb-5">
                <img
                  src="/logo.png"
                  alt="LegacyCore Logo"
                  style={{ width: 48, height: 48, objectFit: 'contain', marginRight: 12 }}
                />
                <h1 className="text-2xl font-bold text-white">LegacyCore</h1>
              </div>
              <p className="text-gray-400 mb-4">The complete platform for insurance professionals.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.998 4.926c-.882.391-1.83.654-2.825.775 1.014-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-5">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#solutions" className="text-gray-400 hover:text-white transition-colors">Solutions</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/documentation" className="text-gray-400 hover:text-white transition-colors">Updates</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-5">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about-us" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/partners" className="text-gray-400 hover:text-white transition-colors">Partners</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-5">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/documentation" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/tutorials" className="text-gray-400 hover:text-white transition-colors">Tutorials</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} LegacyCore. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
