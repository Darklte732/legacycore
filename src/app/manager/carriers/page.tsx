'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { Building2, DollarSign, Settings, PlusCircle, Clock, ShieldCheck, ArrowLeft, ChevronRight, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

export default function ManagerCarriersPage() {
  const { role, loading: roleLoading } = useRole()
  const supabase = createClient()
  const { toast } = useToast()
  const [carriers, setCarriers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCarriers() {
      setLoading(true)
      try {
      const { data, error } = await supabase
        .from('carriers')
        .select('*')
          .order('name')
      
      if (error) {
        console.error('Error fetching carriers:', error)
          toast({
            title: 'Error loading carriers',
            description: 'Please try again later',
            variant: 'destructive'
          })
        } else {
      setCarriers(data || [])
        }
      } catch (err) {
        console.error('Error in carriers fetch:', err)
      } finally {
      setLoading(false)
      }
    }
    
    if (!roleLoading) {
      fetchCarriers()
    }
  }, [roleLoading, supabase, toast])

  if (roleLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="rounded-full p-2 hover:bg-indigo-100">
              <Link href="/manager/dashboard">
                <ArrowLeft className="h-5 w-5 text-indigo-600" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-indigo-800">Carrier Management</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Manage carrier settings, applications, and commission tracking
          </p>
        </div>
        
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Carrier
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/manager/carriers/commission-rates" className="block h-full">
          <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader className="pb-2">
              <Badge className="w-fit bg-indigo-100 text-indigo-800 mb-2">Popular</Badge>
              <CardTitle className="flex items-center text-indigo-900">
                <DollarSign className="h-5 w-5 mr-2 text-indigo-600" />
                Commission Rates
              </CardTitle>
              <CardDescription>
                View and track commission rates across carriers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Browse current commission rates and structures to maximize your team's earnings potential.
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between items-center">
              <div className="flex items-center">
                <Badge className="bg-green-100 text-green-800 mr-2">
                  <TrendingUp className="h-3 w-3 mr-1" /> Updated
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100">
                View Rates <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/manager/carriers/settings" className="block h-full">
          <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader className="pb-2">
              <Badge className="w-fit bg-purple-100 text-purple-800 mb-2">Settings</Badge>
              <CardTitle className="flex items-center text-indigo-900">
                <Settings className="h-5 w-5 mr-2 text-indigo-600" />
                Carrier Settings
              </CardTitle>
              <CardDescription>
                Configure notifications and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Manage your notification preferences, application defaults, and integration settings.
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between items-center">
              <div className="flex items-center">
                <Badge className="bg-blue-100 text-blue-800">
                  New
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100">
                Configure <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href="#" className="block h-full">
          <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader className="pb-2">
              <Badge className="w-fit bg-amber-100 text-amber-800 mb-2">Analytics</Badge>
              <CardTitle className="flex items-center text-indigo-900">
                <ShieldCheck className="h-5 w-5 mr-2 text-indigo-600" />
                Carrier Performance
              </CardTitle>
              <CardDescription>
                Track approval rates and processing times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Analyze carrier performance metrics including approval rates, processing times, and commission payouts.
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between items-center">
              <div className="flex items-center">
                <Badge className="bg-gray-100 text-gray-800">
                  <Clock className="h-3 w-3 mr-1" /> Coming Soon
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100">
                View Stats <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </div>
      
      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4 text-indigo-900">Active Carriers</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {carriers.length > 0 ? (
            carriers.map((carrier) => (
              <Card key={carrier.id} className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Building2 className="h-5 w-5 mr-2 text-indigo-600" />
                    {carrier.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {carrier.status && (
                      <Badge className={`${
                        carrier.status === 'active' ? 'bg-green-100 text-green-800' :
                        carrier.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {carrier.status}
                      </Badge>
                    )}
                    {carrier.product_types && carrier.product_types.map((type, idx) => (
                      <Badge key={idx} variant="outline" className="bg-gray-100 text-gray-800">
                        {type}
                      </Badge>
                ))}
          </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {carrier.description || "No description available."}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" size="sm" className="w-full text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg">
              <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Carriers Found</h3>
              <p className="text-gray-500 mb-4">
                You haven't added any carriers yet. Add your first carrier to get started.
          </p>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Carrier
              </Button>
            </div>
        )}
        </div>
      </div>
    </div>
  )
} 