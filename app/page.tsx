'use client';

import React from 'react'
import InteractiveDashboards from '@/components/InteractiveDashboards'
import { CarrierLogoSlider } from '@/components/ui/carrier-logo-slider'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to Legacy Core</h1>
        <p className="text-xl text-center text-gray-600 mb-12">
          Your comprehensive platform for insurance agents, managers, and administrators
        </p>
        
        <InteractiveDashboards />
        
        <section className="mt-16">
          <CarrierLogoSlider />
        </section>
      </main>
    </div>
  )
}
