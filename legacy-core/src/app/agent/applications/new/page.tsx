"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { AgentApplicationFormValues } from "@/types/application"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { format } from "date-fns"

export default function NewApplicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<Partial<AgentApplicationFormValues>>({
    month: format(new Date(), 'MMMM'),
    policy_submit_date: format(new Date(), 'yyyy-MM-dd'),
    closed_by_agent: 'Agent Name',
    proposed_insured: '',
    client_phone_number: '',
    client_state: '',
    policy_number: '',
    carrier_id: '',
    product: '',
    monthly_premium: '',
    ap: '',
    status: 'Pending',
    paid_status: 'Unpaid',
    point_of_sale: '',
    pms_form_filled_out: false,
    split_with: '',
    effective_policy_date: '',
    effective_policy_status: 'Active',
    notes: '',
    notes_for_pay: '',
    paid_split: '',
    split_percentage: '40',
  })
  
  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-calculate annual premium when monthly premium changes
    if (field === 'monthly_premium') {
      const monthlyValue = parseFloat(value as string) || 0
      const apValue = monthlyValue * 12
      
      // Update AP
      setFormData(prev => ({
        ...prev,
        ap: apValue
      }))
      
      // Calculate commission based on monthly premium and split percentage
      updateCommissionAmount(monthlyValue)
    }
    
    // Update commission if split percentage changes
    if (field === 'split_percentage') {
      const monthlyValue = parseFloat(formData.monthly_premium as string) || 0
      updateCommissionAmount(monthlyValue)
    }
  }
  
  // Helper function to calculate and update commission amount
  const updateCommissionAmount = (monthlyPremium: number) => {
    // Get the current split percentage or default to 40%
    const splitPercentage = parseInt(formData.split_percentage as string) || 40
    // Calculate agent's portion (100% - split%)
    const agentSplitRatio = (100 - splitPercentage) / 100
    // Calculate 9-month advance commission
    const commission = monthlyPremium * 9 * agentSplitRatio
    
    // Update commission amount
    setFormData(prev => ({
      ...prev,
      commission_amount: commission
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session && process.env.NODE_ENV !== 'development') {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create an application",
          variant: "destructive"
        })
        return
      }
      
      // Process numeric values
      const numericPremium = typeof formData.monthly_premium === 'string' 
        ? parseFloat(formData.monthly_premium) 
        : formData.monthly_premium
        
      const numericAP = typeof formData.ap === 'string' 
        ? parseFloat(formData.ap) 
        : formData.ap
      
      // Prepare data
      const applicationData = {
        ...formData,
        agent_id: session?.user?.id || 'development-user',
        monthly_premium: numericPremium,
        ap: numericAP,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      // Insert to database in dev or prod
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode - would save:', applicationData)
        
        // Show success message
        toast({
          title: "Application Created",
          description: "The new application has been created successfully!",
          variant: "default"
        })
        
        // Redirect back to applications list
        setTimeout(() => {
          router.push('/agent/applications')
        }, 1500)
      } else {
        // Real database insert
        const { data, error } = await supabase
          .from('agent_applications')
          .insert(applicationData)
          
        if (error) throw error
        
        toast({
          title: "Application Created",
          description: "The new application has been created successfully!",
          variant: "default"
        })
        
        router.push('/agent/applications')
      }
    } catch (error) {
      console.error('Error creating application:', error)
      toast({
        title: "Error",
        description: "Failed to create application. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const carriers = [
    { id: 'americo', name: 'Americo' },
    { id: 'mutual-of-omaha', name: 'Mutual of Omaha' },
    { id: 'corebridge', name: 'Corebridge' },
    { id: 'aetna', name: 'Aetna' }
  ]
  
  const products = [
    'Term Life',
    'Whole Life',
    'Universal Life',
    'Final Expense',
    'Medicare Supplement'
  ]
  
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]
  
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="mr-2"
            onClick={() => router.push('/agent/applications')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">New Application</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>
            Enter the details for the new application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Client Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="proposed_insured">Proposed Insured*</Label>
                  <Input 
                    id="proposed_insured" 
                    placeholder="Full Name"
                    value={formData.proposed_insured}
                    onChange={(e) => handleChange('proposed_insured', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="client_phone_number">Phone Number</Label>
                  <Input 
                    id="client_phone_number" 
                    placeholder="(555) 555-5555"
                    value={formData.client_phone_number}
                    onChange={(e) => handleChange('client_phone_number', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="client_state">State</Label>
                  <Select
                    value={formData.client_state}
                    onValueChange={(value) => handleChange('client_state', value)}
                  >
                    <SelectTrigger id="client_state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Policy Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="carrier_id">Carrier*</Label>
                  <Select
                    value={formData.carrier_id}
                    onValueChange={(value) => handleChange('carrier_id', value)}
                    required
                  >
                    <SelectTrigger id="carrier_id">
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map(carrier => (
                        <SelectItem key={carrier.id} value={carrier.id}>{carrier.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="product">Product*</Label>
                  <Select
                    value={formData.product}
                    onValueChange={(value) => handleChange('product', value)}
                    required
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product} value={product}>{product}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="policy_number">Policy Number</Label>
                  <Input 
                    id="policy_number" 
                    placeholder="Policy #"
                    value={formData.policy_number}
                    onChange={(e) => handleChange('policy_number', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Financial Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="monthly_premium">Monthly Premium*</Label>
                  <Input 
                    id="monthly_premium" 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.monthly_premium}
                    onChange={(e) => handleChange('monthly_premium', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="ap">AP (Annual Premium)*</Label>
                  <Input 
                    id="ap" 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.ap}
                    onChange={(e) => handleChange('ap', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="split_with">Split With</Label>
                  <Input 
                    id="split_with" 
                    placeholder="Agent Name"
                    value={formData.split_with}
                    onChange={(e) => handleChange('split_with', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="split_percentage">Split Percentage</Label>
                  <Select
                    value={formData.split_percentage?.toString() || "20"}
                    onValueChange={(value) => handleChange('split_percentage', value)}
                  >
                    <SelectTrigger id="split_percentage">
                      <SelectValue placeholder="Select split percentage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5% (You keep 95%)</SelectItem>
                      <SelectItem value="10">10% (You keep 90%)</SelectItem>
                      <SelectItem value="15">15% (You keep 85%)</SelectItem>
                      <SelectItem value="20">20% (You keep 80%)</SelectItem>
                      <SelectItem value="25">25% (You keep 75%)</SelectItem>
                      <SelectItem value="30">30% (You keep 70%)</SelectItem>
                      <SelectItem value="35">35% (You keep 65%)</SelectItem>
                      <SelectItem value="40">40% (You keep 60%)</SelectItem>
                      <SelectItem value="45">45% (You keep 55%)</SelectItem>
                      <SelectItem value="50">50% (You keep 50%)</SelectItem>
                      <SelectItem value="55">55% (You keep 45%)</SelectItem>
                      <SelectItem value="60">60% (You keep 40%)</SelectItem>
                      <SelectItem value="65">65% (You keep 35%)</SelectItem>
                      <SelectItem value="70">70% (You keep 30%)</SelectItem>
                      <SelectItem value="75">75% (You keep 25%)</SelectItem>
                      <SelectItem value="80">80% (You keep 20%)</SelectItem>
                      <SelectItem value="85">85% (You keep 15%)</SelectItem>
                      <SelectItem value="90">90% (You keep 10%)</SelectItem>
                      <SelectItem value="95">95% (You keep 5%)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground mt-1">
                    Percentage that goes to the split agent. The rest goes to you.
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="paid_status">Paid Status</Label>
                <Select
                  value={formData.paid_status}
                  onValueChange={(value) => handleChange('paid_status', value)}
                >
                  <SelectTrigger id="paid_status">
                    <SelectValue placeholder="Select paid status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="effective_policy_date">Effective Policy Date</Label>
                <Input 
                  id="effective_policy_date" 
                  type="date"
                  value={formData.effective_policy_date}
                  onChange={(e) => handleChange('effective_policy_date', e.target.value)}
                />
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Additional notes about this application"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="notes_for_pay">Notes for Payment</Label>
                <Textarea 
                  id="notes_for_pay" 
                  placeholder="Notes related to payment"
                  value={formData.notes_for_pay}
                  onChange={(e) => handleChange('notes_for_pay', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="pms_form_filled_out"
                checked={formData.pms_form_filled_out as boolean}
                onCheckedChange={(checked) => 
                  handleChange('pms_form_filled_out', checked === true)}
              />
              <Label htmlFor="pms_form_filled_out">PMS Form Filled Out</Label>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/agent/applications')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
} 