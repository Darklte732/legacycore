'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useRole } from "@/hooks/useRole"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DollarSign, LineChart, Building2, ArrowLeft, ChevronRight, Star, Clock, Shield, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from '@/lib/supabase/client'
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export default function AgentCarriersPage() {
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

    if (!roleLoading && (role === 'agent' || role === 'admin' || role === 'manager')) {
      fetchCarriers()
    }
  }, [roleLoading, role, supabase, toast])
  
  // Redirect if not an agent (or admin/manager)
  if (!roleLoading && role !== 'agent' && role !== 'admin' && role !== 'manager') {
    redirect('/login')
  }
  
  // Show loading state
  if (roleLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }
  
  // Sample carrier data if none is available from Supabase
  const sampleCarriers = [
    {
      id: '1',
      name: 'Mutual of Omaha',
      products: ['Term Life', 'Whole Life', 'Universal Life'],
      processing_time: '10-14 days',
      commission_rate: '80-110%',
      status: 'active'
    },
    {
      id: '2',
      name: 'Americo',
      products: ['Term Life', 'Final Expense', 'Mortgage Protection'],
      processing_time: '7-10 days',
      commission_rate: '90-120%',
      status: 'active'
    },
    {
      id: '3',
      name: 'Aetna',
      products: ['Medicare Supplement', 'Medicare Advantage', 'Prescription Drug Plans'],
      processing_time: '3-5 days',
      commission_rate: '70-90%',
      status: 'active'
    },
    {
      id: '4',
      name: 'AIG',
      products: ['Term Life', 'Indexed Universal Life', 'Guaranteed Issue'],
      processing_time: '14-21 days',
      commission_rate: '85-115%',
      status: 'active'
    },
    {
      id: '5',
      name: 'Gerber',
      products: ['Juvenile Life', 'Guaranteed Issue', 'Whole Life'],
      processing_time: '1-3 days',
      commission_rate: '75-95%',
      status: 'active'
    }
  ]
  
  // Use sample data if no real data is available
  const displayCarriers = carriers.length > 0 ? carriers : sampleCarriers

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="rounded-full p-2 hover:bg-indigo-100">
              <Link href="/agent/dashboard">
                <ArrowLeft className="h-5 w-5 text-indigo-600" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-indigo-800">Available Carriers</h1>
          </div>
          <p className="text-gray-600 mt-1">
            View carrier information, products, and commission rates
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="px-3 py-1.5 bg-indigo-100 text-indigo-700">
            Agent Access
          </Badge>
        </div>
      </div>
      
      {/* Tools and Quick Links */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/agent/carriers/commission-rates" className="block h-full">
          <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader className="pb-2">
              <Badge className="w-fit bg-green-100 text-green-800 mb-2">Highest Commissions</Badge>
              <CardTitle className="flex items-center text-indigo-900">
                <DollarSign className="h-5 w-5 mr-2 text-indigo-600" /> 
                Commission Rates
              </CardTitle>
              <CardDescription>
                Maximize your earnings potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Find the highest commission rates across carriers and products to boost your income.
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between items-center">
              <div className="flex items-center">
                <Badge className="bg-indigo-100 text-indigo-800">
                  <TrendingUp className="h-3 w-3 mr-1" /> Updated
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100">
                View Rates <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href="#" className="block h-full">
          <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader className="pb-2">
              <Badge className="w-fit bg-purple-100 text-purple-800 mb-2">Analytics</Badge>
              <CardTitle className="flex items-center text-indigo-900">
                <LineChart className="h-5 w-5 mr-2 text-indigo-600" /> 
                Performance Data
              </CardTitle>
              <CardDescription>
                Make data-driven carrier selections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Access approval rates, processing times, and other metrics to guide your recommendations.
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
        
        <Link href="#" className="block h-full">
          <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader className="pb-2">
              <Badge className="w-fit bg-blue-100 text-blue-800 mb-2">New</Badge>
              <CardTitle className="flex items-center text-indigo-900">
                <Shield className="h-5 w-5 mr-2 text-indigo-600" /> 
                Quick Application
              </CardTitle>
              <CardDescription>
                Submit applications faster
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Use our streamlined application process with pre-filled templates for faster submissions.
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between items-center">
              <div className="flex items-center">
                <Badge className="bg-blue-100 text-blue-800">
                  Beta
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100">
                Try Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </div>
      
      {/* Carrier Cards */}
      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4 text-indigo-900">Carrier Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCarriers.map((carrier) => (
            <Card key={carrier.id} className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center text-lg">
                    <Building2 className="h-5 w-5 mr-2 text-indigo-600" />
                    {carrier.name}
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-800">
                    {carrier.status || 'active'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 text-sm min-w-24">Products:</span>
                    <span className="text-sm font-medium">
                      {carrier.products ? carrier.products.join(', ') : 'Term Life, Whole Life, Universal Life'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 text-sm min-w-24">Processing Time:</span>
                    <span className="text-sm font-medium">
                      {carrier.processing_time || '7-14 days'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 text-sm min-w-24">Commission Rate:</span>
                    <span className="text-sm font-medium text-green-700">
                      {carrier.commission_rate || '80-110%'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 