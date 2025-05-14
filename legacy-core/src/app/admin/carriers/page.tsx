'use client'

import React from 'react'
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { Building2 } from 'lucide-react'

export default function AdminCarriers() {
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
            <Building2 className="h-8 w-8" />
            Carriers
          </h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Carriers List</h2>
          <p className="text-gray-600">
            This page will display a list of all insurance carriers and their performance metrics.
          </p>
        </div>
      </div>
    </RoleBasedLayout>
  )
} 