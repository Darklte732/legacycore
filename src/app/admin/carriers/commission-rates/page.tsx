'use client'

import React, { useState, useEffect } from 'react'
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { Building2, PlusCircle, DollarSign, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { CommissionRatesTable } from './components/commission-rates-table'
import { CommissionRateForm } from './components/commission-rate-form'
import { useToast } from '@/components/ui/use-toast'

export default function CarrierCommissionRates() {
  const { role, loading: roleLoading } = useRole()
  const supabase = createClient()
  const { toast } = useToast()
  const [rates, setRates] = useState([])
  const [carriers, setCarriers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRate, setSelectedRate] = useState(null)
  const [activeTab, setActiveTab] = useState('view')

  // Load commission rates and carriers on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch commission rates
        const { data: ratesData, error: ratesError } = await supabase
          .from('carrier_commission_rates')
          .select('*')
          .order('carrier', { ascending: true })
          .order('product_type', { ascending: true })
          .order('policy_year', { ascending: true })
        
        if (ratesError) throw ratesError
        setRates(ratesData || [])
        
        // Fetch unique carriers
        const { data: carriersData, error: carriersError } = await supabase
          .from('carrier_commission_rates')
          .select('carrier')
          .distinct()
          
        if (carriersError) throw carriersError
        setCarriers(carriersData?.map(c => c.carrier) || [])
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: 'Error loading data',
          description: error.message || 'Could not load commission rates',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [supabase, toast])

  // Handle rate selection for editing
  const handleEditRate = (rate) => {
    setSelectedRate(rate)
    setActiveTab('edit')
  }

  // Handle rate creation or update
  const handleSaveRate = async (formData) => {
    try {
      if (selectedRate?.id) {
        // Update existing rate
        const { error } = await supabase
          .from('carrier_commission_rates')
          .update(formData)
          .eq('id', selectedRate.id)
          
        if (error) throw error
        
        toast({
          title: 'Rate updated',
          description: `Commission rate for ${formData.carrier} ${formData.product_type} updated successfully.`
        })
      } else {
        // Create new rate
        const { error } = await supabase
          .from('carrier_commission_rates')
          .insert(formData)
          
        if (error) throw error
        
        toast({
          title: 'Rate created',
          description: `New commission rate for ${formData.carrier} ${formData.product_type} created successfully.`
        })
      }
      
      // Refresh data and reset form
      const { data: refreshedData } = await supabase
        .from('carrier_commission_rates')
        .select('*')
        .order('carrier', { ascending: true })
        .order('product_type', { ascending: true })
        .order('policy_year', { ascending: true })
      
      setRates(refreshedData || [])
      setSelectedRate(null)
      setActiveTab('view')
    } catch (error) {
      console.error('Error saving rate:', error)
      toast({
        title: 'Error saving rate',
        description: error.message || 'Could not save commission rate',
        variant: 'destructive'
      })
    }
  }

  // Handle rate deletion
  const handleDeleteRate = async (id) => {
    if (confirm('Are you sure you want to delete this commission rate? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('carrier_commission_rates')
          .delete()
          .eq('id', id)
          
        if (error) throw error
        
        // Refresh data
        const { data: refreshedData } = await supabase
          .from('carrier_commission_rates')
          .select('*')
          .order('carrier', { ascending: true })
          .order('product_type', { ascending: true })
          .order('policy_year', { ascending: true })
        
        setRates(refreshedData || [])
        toast({
          title: 'Rate deleted',
          description: 'Commission rate deleted successfully.'
        })
      } catch (error) {
        console.error('Error deleting rate:', error)
        toast({
          title: 'Error deleting rate',
          description: error.message || 'Could not delete commission rate',
          variant: 'destructive'
        })
      }
    }
  }

  if (roleLoading || loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <RoleBasedLayout userRole="admin">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Carrier Commission Rates
          </h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedRate(null)
                setActiveTab('add')
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Rate
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="view">View Rates</TabsTrigger>
            <TabsTrigger value="add">Add Rate</TabsTrigger>
            <TabsTrigger value="edit" disabled={!selectedRate}>Edit Rate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Commission Rates</h2>
              <Separator className="my-4" />
              
              <CommissionRatesTable 
                data={rates} 
                onEdit={handleEditRate}
                onDelete={handleDeleteRate}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="add" className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Commission Rate</h2>
              <Separator className="my-4" />
              
              <CommissionRateForm 
                existingCarriers={carriers}
                onSave={handleSaveRate}
                onCancel={() => setActiveTab('view')}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Commission Rate</h2>
              <Separator className="my-4" />
              
              {selectedRate && (
                <CommissionRateForm 
                  existingCarriers={carriers}
                  rateData={selectedRate}
                  onSave={handleSaveRate}
                  onCancel={() => {
                    setSelectedRate(null)
                    setActiveTab('view')
                  }}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleBasedLayout>
  )
} 