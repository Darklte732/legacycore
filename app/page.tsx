'use client';

import React from 'react'
import InteractiveDashboards from '@/components/InteractiveDashboards'
import { CarrierLogoSlider } from '@/components/ui/carrier-logo-slider'

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold mb-6">LegacyCore Insurance Platform</h1>
      <p className="text-xl mb-8">
        The site is currently under maintenance. Please check back later.
      </p>
      <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Platform Features</h2>
        <ul className="text-left list-disc pl-5 space-y-2">
          <li>Insurance Application Management</li>
          <li>Agent Commission Tracking</li>
          <li>Client Policy Management</li>
          <li>Administrative Tools</li>
          <li>Reporting Dashboard</li>
        </ul>
      </div>
    </div>
  )
}
