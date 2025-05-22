'use client'

import React from 'react'
import Link from 'next/link'
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { Building2, DollarSign, BarChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                Commission Rates
              </CardTitle>
              <CardDescription>
                Manage carrier commission rates and structures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Define commission rates by carrier, product type, and policy year. Track historical rates and create tiered commission structures.
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/carriers/commission-rates">
                  Manage Commission Rates
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-green-500" />
                Carrier Performance
              </CardTitle>
              <CardDescription>
                View carrier performance metrics and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Track application approval rates, conversion metrics, and policy performance by carrier.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="#">
                  View Performance
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedLayout>
  )
} 