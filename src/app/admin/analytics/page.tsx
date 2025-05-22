'use client'

import React from 'react'
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { BarChart2 } from 'lucide-react'

export default function AdminAnalytics() {
  const { role, loading: roleLoading } = useRole()
  const supabase = createClient()

  if (roleLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <RoleBasedLayout userRole="admin">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart2 className="h-8 w-8" />
            Analytics
          </h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Analytics</h2>
          <p className="text-gray-600">
            This page will display comprehensive analytics and performance metrics for the entire system.
          </p>
        </div>
      </div>
    </RoleBasedLayout>
  )
} 