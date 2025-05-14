'use client'

import React from 'react'
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout'
import RoleViewsPreview from '@/components/RoleViewsPreview'

export default function AdminRoleViews() {
  return (
    <RoleBasedLayout userRole="admin">
      <h1 className="text-3xl font-bold mb-8">Role Views Preview</h1>
      <p className="text-gray-600 mb-6">This interactive preview allows you to see the application from different user role perspectives.</p>
      
      <div className="bg-white rounded-lg p-4 shadow">
        <RoleViewsPreview />
      </div>
    </RoleBasedLayout>
  )
} 