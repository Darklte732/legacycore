"use client"

import React from 'react'

const InteractiveDashboards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-2">Agent Dashboard</h3>
        <p className="text-gray-600 mb-4">Manage applications, view commissions, and track your performance.</p>
        <a href="/agent/dashboard" className="text-blue-600 hover:underline font-medium">View Dashboard →</a>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-2">Manager Dashboard</h3>
        <p className="text-gray-600 mb-4">Supervise agents, monitor team performance, and analyze sales data.</p>
        <a href="/manager/dashboard" className="text-blue-600 hover:underline font-medium">View Dashboard →</a>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
        <p className="text-gray-600 mb-4">Manage system-wide settings, users, and organizational data.</p>
        <a href="/admin/dashboard" className="text-blue-600 hover:underline font-medium">View Dashboard →</a>
      </div>
    </div>
  )
}

export default InteractiveDashboards 