'use client'

import React from 'react'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { FileText } from 'lucide-react'

export default function AdminApplications() {
  const { role, loading: roleLoading } = useRole()
  const supabase = createClient()

  if (roleLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          All Applications
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Applications List</h2>
        <p className="text-gray-600">
          This page will display a list of all insurance applications submitted by agents.
        </p>
      </div>
    </div>
  )
} 