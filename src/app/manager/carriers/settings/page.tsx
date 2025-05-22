'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { Settings, Shield, Wrench, Layers, Bell, AlertCircle, CheckCircle, ArrowLeft, Save, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'

interface CarrierSetting {
  id: string
  carrier_id: string
  setting_type: string
  setting_value: string | boolean | number
  is_enabled: boolean
}

type CarrierSettingsMap = {
  [key: string]: {
    status: string
    approval_notifications: boolean
    application_notifications: boolean
    commission_notifications: boolean
    auto_assign: boolean
    default_split_percentage: number
    verification_level: string
  }
}

export default function CarrierSettingsPage() {
  const { role, loading: roleLoading } = useRole()
  const supabase = createClient()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [carriers, setCarriers] = useState([])
  const [selectedCarrierId, setSelectedCarrierId] = useState('')
  
  // Settings for each carrier
  const [carrierSettings, setCarrierSettings] = useState<CarrierSettingsMap>({})

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
        const settingsMap: CarrierSettingsMap = {}
        
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
        
        // Fetch actual settings if they exist
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

  const handleSettingChange = (carrierId: string, settingKey: string, value: any) => {
    setCarrierSettings(prev => ({
      ...prev,
      [carrierId]: {
        ...prev[carrierId],
        [settingKey]: value
      }
    }))
  }

  const saveSettings = async () => {
    setSaving(true)
    
    try {
      // In a real implementation, you would save the settings to your database
      // For this demo, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast({
        title: 'Settings saved',
        description: 'Your carrier settings have been updated',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error saving settings',
        description: 'Please try again later',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

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
              <Link href="/manager/carriers">
                <ArrowLeft className="h-5 w-5 text-indigo-600" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-indigo-800">
              <Settings className="h-8 w-8 text-indigo-600" />
              Carrier Settings
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            Configure notification preferences, automation, and integration settings
          </p>
        </div>
        
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
      
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
                  Configure settings for {selectedCarrier.name}
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
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="status" className="text-base">Carrier Status</Label>
                        </div>
                        <Select 
                          value={settings.status} 
                          onValueChange={(value) => handleSettingChange(selectedCarrierId, 'status', value)}
                        >
                          <SelectTrigger id="status" className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500">
                          Determines whether this carrier is available for new applications
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="auto_assign" className="text-base">Auto-Assign Applications</Label>
                          <Switch 
                            id="auto_assign" 
                            checked={settings.auto_assign}
                            onCheckedChange={(checked) => handleSettingChange(selectedCarrierId, 'auto_assign', checked)}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          Automatically assign new applications to available agents based on workload
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="default_split_percentage" className="text-base">Default Commission Split</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            id="default_split_percentage"
                            type="number"
                            min={0}
                            max={100}
                            value={settings.default_split_percentage}
                            onChange={(e) => handleSettingChange(
                              selectedCarrierId, 
                              'default_split_percentage', 
                              parseInt(e.target.value, 10) || 0
                            )}
                            className="w-20"
                          />
                          <span className="text-gray-500">%</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Default commission split percentage for this carrier
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="verification_level" className="text-base">Verification Level</Label>
                        </div>
                        <Select 
                          value={settings.verification_level} 
                          onValueChange={(value) => handleSettingChange(selectedCarrierId, 'verification_level', value)}
                        >
                          <SelectTrigger id="verification_level" className="w-full">
                            <SelectValue placeholder="Select verification level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="enhanced">Enhanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500">
                          Level of verification required for this carrier's applications
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notifications" className="p-6 space-y-6">
                    <Alert className="mb-6 bg-blue-50 border-blue-200">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                      <AlertTitle className="text-blue-700">Notification Settings</AlertTitle>
                      <AlertDescription className="text-blue-600">
                        Configure which notifications you receive for this carrier.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Application Submissions</Label>
                          <p className="text-sm text-gray-500">
                            Receive notifications when new applications are submitted
                          </p>
                        </div>
                        <Switch 
                          checked={settings.application_notifications}
                          onCheckedChange={(checked) => handleSettingChange(
                            selectedCarrierId, 
                            'application_notifications', 
                            checked
                          )}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Approval Status Changes</Label>
                          <p className="text-sm text-gray-500">
                            Receive notifications when applications are approved or declined
                          </p>
                        </div>
                        <Switch 
                          checked={settings.approval_notifications}
                          onCheckedChange={(checked) => handleSettingChange(
                            selectedCarrierId, 
                            'approval_notifications', 
                            checked
                          )}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Commission Payments</Label>
                          <p className="text-sm text-gray-500">
                            Receive notifications when commission payments are processed
                          </p>
                        </div>
                        <Switch 
                          checked={settings.commission_notifications}
                          onCheckedChange={(checked) => handleSettingChange(
                            selectedCarrierId, 
                            'commission_notifications', 
                            checked
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="integrations" className="p-6 space-y-6">
                    <Alert className="mb-6 bg-amber-50 border-amber-200">
                      <Wrench className="h-5 w-5 text-amber-500" />
                      <AlertTitle className="text-amber-700">Integration Settings</AlertTitle>
                      <AlertDescription className="text-amber-600">
                        Connect with third-party services or configure API access.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <Layers className="h-5 w-5 text-indigo-500 mt-0.5" />
                        <div className="space-y-1">
                          <label className="font-medium text-gray-900">API Integration</label>
                          <p className="text-sm text-gray-500">
                            Connect to carrier's API for real-time application status updates
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Configure API
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <Bell className="h-5 w-5 text-indigo-500 mt-0.5" />
                        <div className="space-y-1">
                          <label className="font-medium text-gray-900">Webhook Notifications</label>
                          <p className="text-sm text-gray-500">
                            Send notifications to external systems when status changes
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Configure Webhooks
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <CheckCircle className="h-5 w-5 text-indigo-500 mt-0.5" />
                        <div className="space-y-1">
                          <label className="font-medium text-gray-900">Single Sign-On</label>
                          <p className="text-sm text-gray-500">
                            Enable SSO with carrier's agent portal
                          </p>
                          <div className="flex items-center mt-2">
                            <Checkbox id="sso" className="mr-2" />
                            <label htmlFor="sso" className="text-sm font-medium">
                              Enable SSO
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="bg-gray-50 px-6 py-4 flex justify-end">
                <Button 
                  onClick={saveSettings} 
                  disabled={saving}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-none shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-indigo-900">No Carriers Available</CardTitle>
                <CardDescription>
                  Add carriers to begin configuring settings
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Shield className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="mb-6 text-gray-600">
                  You haven't added any carriers yet. Add carriers to configure their settings.
                </p>
                <Button 
                  asChild
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                >
                  <Link href="/manager/carriers">
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