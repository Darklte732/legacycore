'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { Settings, Shield, Wrench, Layers, Bell, AlertCircle, ArrowLeft, Info, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'

export default function AgentCarrierSettingsPage() {
  const { role, loading: roleLoading } = useRole()
  const supabase = createClient()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [carriers, setCarriers] = useState([])
  const [selectedCarrierId, setSelectedCarrierId] = useState('')
  
  // Settings for each carrier (read-only view for agents)
  const [carrierSettings, setCarrierSettings] = useState({})

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // Fetch carriers
      const { data: carriersData, error: carriersError } = await supabase
        .from('carriers')
        .select('*')
        .order('name', { ascending: true })
      
      if (carriersError) {
        console.error('Error fetching carriers:', carriersError)
        toast({
          title: 'Error loading carriers',
          description: 'Please try again later',
          variant: 'destructive'
        })
        setLoading(false)
        return
      }
      
      setCarriers(carriersData || [])
      
      // If there are carriers, set the first one as selected
      if (carriersData && carriersData.length > 0) {
        setSelectedCarrierId(carriersData[0].id)
        
        // Initialize default settings for each carrier
        const settingsMap = {}
        
        carriersData.forEach(carrier => {
          settingsMap[carrier.id] = {
            status: carrier.status || 'active',
            approval_notifications: true,
            application_notifications: true,
            commission_notifications: true,
            auto_assign: false,
            default_split_percentage: 80,
            verification_level: 'standard'
          }
        })
        
        // Fetch actual settings if they exist - for agents, this is just for viewing
        try {
          // In a real implementation, fetch carrier settings from your database
          // For now, we'll just use the defaults
          setCarrierSettings(settingsMap)
        } catch (error) {
          console.error('Error fetching carrier settings:', error)
        }
      }
      
      setLoading(false)
    }
    
    if (!roleLoading) {
      fetchData()
    }
  }, [roleLoading, supabase, toast])

  if (roleLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  const selectedCarrier = carriers.find(c => c.id === selectedCarrierId) || { name: 'No carrier selected' }
  const settings = carrierSettings[selectedCarrierId] || {
    status: 'inactive',
    approval_notifications: false,
    application_notifications: false,
    commission_notifications: false,
    auto_assign: false,
    default_split_percentage: 50,
    verification_level: 'basic'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="rounded-full p-2 hover:bg-indigo-100">
              <Link href="/agent/carriers">
                <ArrowLeft className="h-5 w-5 text-indigo-600" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-indigo-800">
              <Settings className="h-8 w-8 text-indigo-600" />
              Carrier Settings
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            View carrier configuration and settings (read-only)
          </p>
        </div>
        
        <Badge className="px-3 py-1.5 bg-indigo-100 text-indigo-700">
          Agent View
        </Badge>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-700">Agent Info</AlertTitle>
        <AlertDescription className="text-blue-600">
          This is a read-only view of carrier settings. Contact your manager if you need changes made to these settings.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar for carrier selection */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <Card className="border-none shadow-xl bg-white sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-indigo-900">Select Carrier</CardTitle>
              <Separator className="my-2" />
            </CardHeader>
            <CardContent className="space-y-2 px-4 py-0">
              {carriers.map((carrier) => (
                <Button
                  key={carrier.id}
                  variant={selectedCarrierId === carrier.id ? "default" : "ghost"}
                  className={`w-full justify-start pl-3 ${
                    selectedCarrierId === carrier.id 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" 
                      : "hover:bg-indigo-50"
                  }`}
                  onClick={() => setSelectedCarrierId(carrier.id)}
                >
                  <Shield className={`h-4 w-4 mr-2 ${selectedCarrierId === carrier.id ? "text-white" : "text-indigo-500"}`} />
                  <span className="truncate">{carrier.name}</span>
                  <Badge className={`ml-auto ${
                    carrier.status === 'active' ? 'bg-green-100 text-green-800' :
                    carrier.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    carrier.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {carrier.status || 'N/A'}
                  </Badge>
                </Button>
              ))}
              
              {carriers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>No carriers available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          {carriers.length > 0 ? (
            <Card className="border-none shadow-xl bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-indigo-900">
                    {selectedCarrier.name} Settings
                  </CardTitle>
                  <Badge className={`${
                    settings.status === 'active' ? 'bg-green-100 text-green-800' :
                    settings.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    settings.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {settings.status}
                  </Badge>
                </div>
                <CardDescription>
                  Carrier settings and configuration for {selectedCarrier.name}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs defaultValue="general" className="w-full">
                  <div className="px-6 pt-2">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="general" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                        General
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                        Notifications
                      </TabsTrigger>
                      <TabsTrigger value="integrations" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                        Integrations
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="general" className="p-6 space-y-6">
                    <div className="grid gap-6">
                      <div className="space-y-2 p-4 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-medium">Carrier Status</h3>
                          <Badge className={`${
                            settings.status === 'active' ? 'bg-green-100 text-green-800' :
                            settings.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            settings.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {settings.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          This carrier is currently {settings.status} for new applications
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2 p-4 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-medium">Auto-Assign Applications</h3>
                          <Badge className={settings.auto_assign ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {settings.auto_assign ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {settings.auto_assign 
                            ? 'New applications will be automatically assigned to available agents'
                            : 'New applications require manual assignment by a manager'}
                        </p>
                      </div>
                      
                      <div className="space-y-2 p-4 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-medium">Default Commission Split</h3>
                          <Badge className="bg-indigo-100 text-indigo-800">
                            {settings.default_split_percentage}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Default commission split percentage for this carrier when submitting applications
                        </p>
                      </div>
                      
                      <div className="space-y-2 p-4 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-medium">Verification Level</h3>
                          <Badge className="bg-purple-100 text-purple-800">
                            {settings.verification_level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Level of verification required for this carrier's applications
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notifications" className="p-6 space-y-6">
                    <Alert className="mb-6 bg-blue-50 border-blue-200">
                      <Bell className="h-5 w-5 text-blue-500" />
                      <AlertTitle className="text-blue-700">Notification Settings</AlertTitle>
                      <AlertDescription className="text-blue-600">
                        These notification settings have been configured by your manager
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-medium">Application Submissions</h3>
                          <p className="text-sm text-gray-500">
                            Receive notifications when new applications are submitted
                          </p>
                        </div>
                        <Badge className={settings.application_notifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {settings.application_notifications ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-medium">Approval Status Changes</h3>
                          <p className="text-sm text-gray-500">
                            Receive notifications when applications are approved or declined
                          </p>
                        </div>
                        <Badge className={settings.approval_notifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {settings.approval_notifications ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-medium">Commission Payments</h3>
                          <p className="text-sm text-gray-500">
                            Receive notifications when commission payments are processed
                          </p>
                        </div>
                        <Badge className={settings.commission_notifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {settings.commission_notifications ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="integrations" className="p-6 space-y-6">
                    <Alert className="mb-6 bg-amber-50 border-amber-200">
                      <Wrench className="h-5 w-5 text-amber-500" />
                      <AlertTitle className="text-amber-700">Integration Information</AlertTitle>
                      <AlertDescription className="text-amber-600">
                        These integration settings are maintained by your manager. Contact them for any questions.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <Layers className="h-5 w-5 text-indigo-500 mt-0.5" />
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-900">API Connection</h3>
                          <p className="text-sm text-gray-500">
                            Status of carrier API connection for real-time updates and submissions
                          </p>
                          <Badge className="bg-green-100 text-green-800 mt-2">
                            Connected
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <Bell className="h-5 w-5 text-indigo-500 mt-0.5" />
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-900">Single Sign-On</h3>
                          <p className="text-sm text-gray-500">
                            Access to carrier portal via single sign-on
                          </p>
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <Link href="#" target="_blank">
                              <Eye className="h-4 w-4 mr-2" />
                              Visit Carrier Portal
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="bg-gray-50 px-6 py-4 flex justify-end">
                <Button asChild>
                  <Link href="/agent/carriers">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Carriers
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-none shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-indigo-900">No Carriers Available</CardTitle>
                <CardDescription>
                  There are no carriers configured at this time
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Shield className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="mb-6 text-gray-600">
                  Contact your manager to set up carriers for your account.
                </p>
                <Button 
                  asChild
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                >
                  <Link href="/agent/carriers">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Carriers
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 