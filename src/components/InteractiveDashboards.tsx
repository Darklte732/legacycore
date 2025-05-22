import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, FileText, Building2, BarChart2, Settings, DollarSign, 
  Clock, CheckCircle2, TrendingUp, LogOut, Bell, Home, Activity, ChevronRight
} from "lucide-react";

// Card components
const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-4 py-3 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`px-4 py-3 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-sm font-semibold">{children}</h3>
);

// Agent Dashboard Preview Component
export const AgentDashboardPreview = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const stats = [
    { label: "Applications Processed", value: "24K+", icon: <FileText className="h-3 w-3 text-gray-500" />, change: "+12%" },
    { label: "Monthly Revenue", value: "$5.2M+", icon: <DollarSign className="h-3 w-3 text-gray-500" />, change: "+8%" },
    { label: "Client Satisfaction", value: "98%", icon: <CheckCircle2 className="h-3 w-3 text-gray-500" />, change: "+5%" },
    { label: "Higher Closing Rate", value: "30%", icon: <TrendingUp className="h-3 w-3 text-gray-500" />, change: "+3%" }
  ];
  
  return (
    <div 
      className={`bg-white rounded-xl p-4 border border-gray-200 transition-all duration-300 ${isHovered ? 'shadow-lg' : 'shadow-sm'} relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ transform: isHovered ? 'translateY(-5px)' : 'translateY(0)' }}
    >
      <div className="absolute -top-2 -right-2 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
        INTERACTIVE PREVIEW
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-md font-bold text-gray-900">Agent Dashboard</h3>
          <p className="text-xs text-gray-500">Welcome back, Sarah!</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center relative cursor-pointer">
            <Bell className="h-3 w-3 text-blue-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
          </div>
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold cursor-pointer">
            SJ
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Performance Overview</h4>
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-white rounded-lg p-2 border border-gray-100 ${isHovered ? 'animate-pulse-light' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <div className="flex items-center">
                  {stat.change && (
                    <div className="text-green-500 text-xs flex items-center mr-1">
                      <ChevronRight className="h-3 w-3 rotate-90" /> {stat.change}
                    </div>
                  )}
                  {stat.icon}
                </div>
              </div>
              <p className="text-md font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Applications */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-gray-700">Recent Applications</h4>
          <span className="text-xxs text-blue-600 cursor-pointer hover:underline">View all</span>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-xxs text-gray-500">
              <tr>
                <th className="py-1 px-2 text-left">CLIENT</th>
                <th className="py-1 px-2 text-left">POLICY</th>
                <th className="py-1 px-2 text-left">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {[
                { client: 'John Smith', policy: 'Term Life', status: 'In Progress', color: 'green' },
                { client: 'Maria Garcia', policy: 'Whole Life', status: 'Review', color: 'yellow' },
                { client: 'Robert Chen', policy: 'IUL', status: 'Submitted', color: 'blue' },
                { client: 'Sarah Johnson', policy: 'Term Life', status: 'Issued Paid', color: 'purple' }
              ].map((app, i) => (
                <tr key={i} className={`border-t border-gray-100 ${isHovered && i === 0 ? 'bg-blue-50' : ''}`}>
                  <td className="py-1 px-2">{app.client}</td>
                  <td className="py-1 px-2">{app.policy}</td>
                  <td className="py-1 px-2">
                    {app.status === 'In Progress' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-medium bg-green-100 text-green-800">
                        In Progress
                      </span>
                    )}
                    {app.status === 'Review' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-medium bg-yellow-100 text-yellow-800">
                        Review
                      </span>
                    )}
                    {app.status === 'Submitted' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-medium bg-blue-100 text-blue-800">
                        Submitted
                      </span>
                    )}
                    {app.status === 'Issued Paid' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-medium bg-purple-100 text-purple-800">
                        Issued Paid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-xxs pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 text-gray-500 cursor-pointer ${isHovered ? 'text-blue-600' : ''}`}>
            <Home className="h-2.5 w-2.5" />
            <span>Dashboard</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 cursor-pointer hover:text-gray-700">
            <FileText className="h-2.5 w-2.5" />
            <span>Applications</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 cursor-pointer hover:text-gray-700">
            <Users className="h-2.5 w-2.5" />
            <span>Clients</span>
          </div>
        </div>
        <div className="text-gray-500 cursor-pointer hover:text-blue-600">
          <Settings className="h-2.5 w-2.5" />
        </div>
      </div>
    </div>
  );
};

// Manager Dashboard Preview Component
export const ManagerDashboardPreview = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedTab, setSelectedTab] = useState('performance');
  
  const stats = [
    { label: "Total Applications", value: "162", icon: <FileText className="h-3 w-3 text-gray-500" />, change: "+24%" },
    { label: "Total Commission", value: "$245K", icon: <DollarSign className="h-3 w-3 text-gray-500" />, change: "+18%" },
    { label: "Team Size", value: "8", icon: <Users className="h-3 w-3 text-gray-500" />, change: null },
    { label: "Approval Rate", value: "79%", icon: <TrendingUp className="h-3 w-3 text-gray-500" />, change: "+3%" }
  ];
  
  return (
    <div 
      className={`bg-white rounded-xl p-4 border border-gray-200 transition-all duration-300 ${isHovered ? 'shadow-lg' : 'shadow-sm'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ transform: isHovered ? 'translateY(-5px)' : 'translateY(0)' }}
    >
      <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
        INTERACTIVE PREVIEW
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-md font-bold text-gray-900">Manager Dashboard</h3>
          <p className="text-xs text-gray-500">Agency performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center relative cursor-pointer">
            <Bell className="h-3 w-3 text-blue-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
          </div>
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold cursor-pointer">
            JD
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-white rounded-lg p-2 border border-gray-100 ${isHovered ? 'animate-pulse-light' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <div className="flex items-center">
                  {stat.change && (
                    <div className="text-green-500 text-xs flex items-center mr-1">
                      <ChevronRight className="h-3 w-3 rotate-90" /> {stat.change}
                    </div>
                  )}
                  {stat.icon}
                </div>
              </div>
              <p className="text-md font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-3">
        <div className="flex border-b border-gray-100 mb-3">
          <button
            onClick={() => setSelectedTab('performance')}
            className={`text-xs px-3 py-1 ${selectedTab === 'performance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Performance
          </button>
          <button
            onClick={() => setSelectedTab('agents')}
            className={`text-xs px-3 py-1 ${selectedTab === 'agents' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Agents
          </button>
          <button
            onClick={() => setSelectedTab('applications')}
            className={`text-xs px-3 py-1 ${selectedTab === 'applications' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Applications
          </button>
        </div>
        
        {selectedTab === 'performance' && (
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="p-3 text-center">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-700">Monthly Goals</span>
                <span className="text-xs text-green-600">76% complete</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '76%' }}></div>
              </div>
              <div className={`mt-2 grid grid-cols-3 gap-2 ${isHovered ? 'animate-fade-in' : ''}`}>
                <div className="text-center">
                  <p className="text-xxs text-gray-500">Applications</p>
                  <p className="text-xs font-bold">128/200</p>
                </div>
                <div className="text-center">
                  <p className="text-xxs text-gray-500">Revenue</p>
                  <p className="text-xs font-bold">$187K/$250K</p>
                </div>
                <div className="text-center">
                  <p className="text-xxs text-gray-500">Conversions</p>
                  <p className="text-xs font-bold">24%/30%</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {selectedTab === 'agents' && (
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-xxs text-gray-500">
                <tr>
                  <th className="py-1 px-2 text-left">AGENT</th>
                  <th className="py-1 px-2 text-center">APPS</th>
                  <th className="py-1 px-2 text-right">COMMISSION</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Sarah Johnson', apps: 42, commission: '$54K' },
                  { name: 'Michael Chen', apps: 36, commission: '$48K' },
                  { name: 'Emily Davis', apps: 28, commission: '$37K' }
                ].map((agent, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${isHovered && i === 0 ? 'bg-blue-50' : ''}`}>
                    <td className="py-1 px-2">{agent.name}</td>
                    <td className="py-1 px-2 text-center">{agent.apps}</td>
                    <td className="py-1 px-2 text-right">{agent.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {selectedTab === 'applications' && (
          <div className="bg-white rounded-lg border border-gray-100 p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Applications by Status</span>
            </div>
            <div className={`grid grid-cols-3 gap-2 ${isHovered ? 'animate-fade-in' : ''}`}>
              <div className="bg-green-50 p-2 rounded-lg text-center">
                <p className="text-green-600 text-md font-bold">78</p>
                <p className="text-xxs text-gray-700">Approved</p>
              </div>
              <div className="bg-yellow-50 p-2 rounded-lg text-center">
                <p className="text-yellow-600 text-md font-bold">46</p>
                <p className="text-xxs text-gray-700">Pending</p>
              </div>
              <div className="bg-red-50 p-2 rounded-lg text-center">
                <p className="text-red-600 text-md font-bold">12</p>
                <p className="text-xxs text-gray-700">Declined</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-xxs pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 text-gray-500 cursor-pointer ${isHovered ? 'text-blue-600' : ''}`}>
            <LayoutDashboard className="h-2.5 w-2.5" />
            <span>Dashboard</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 cursor-pointer hover:text-gray-700">
            <Users className="h-2.5 w-2.5" />
            <span>Team</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 cursor-pointer hover:text-gray-700">
            <BarChart2 className="h-2.5 w-2.5" />
            <span>Analytics</span>
          </div>
        </div>
        <div className="text-gray-500 cursor-pointer hover:text-blue-600">
          <Settings className="h-2.5 w-2.5" />
        </div>
      </div>
    </div>
  );
};

const InteractiveDashboards = () => {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <AgentDashboardPreview />
      </div>
      <div className="flex-1">
        <ManagerDashboardPreview />
      </div>
    </div>
  );
};

export default InteractiveDashboards; 