'use client'

import React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

// Add CSS styles to fix transparency
const styles = {
  input: "bg-white",
  select: "bg-white",
  selectContent: "bg-white !important", // Use !important to override any other styles
  checkbox: "border-gray-400 bg-white",
  sectionCard: "rounded-md border p-4 mb-6",
  sectionHeader: "text-lg font-semibold border-b pb-2 mb-4",
  optionCard: "bg-white rounded-md p-3 mb-3",
}

// Add global styles to prevent page scrolling
const globalStyles = `
  body {
    overflow: hidden !important;
  }
`;

export default function ScriptAssistantPage() {
  // Add global style to prevent scrolling
  React.useEffect(() => {
    // Create style element
    const styleEl = document.createElement('style');
    styleEl.innerHTML = globalStyles;
    document.head.appendChild(styleEl);
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const supabase = createClientComponentClient()
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    gender: '',
    ssn: '',
    textPermission: false,
    policyType: '',
    coverageFor: '',
    existingCoverage: false,
    newPolicyReason: '',
    paymentMethod: '',
    bankName: '',
    accountType: '',
    routingNumber: '',
    accountNumber: '',
    primaryReason: '',
    funeralType: '',
    funeralPlanner: '',
    beneficiaryName: '',
    beneficiaryRelationship: '',
    contingentBeneficiary: '',
    tobaccoUse: false,
    tobaccoType: '',
    tobaccoFrequency: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    medicalConditions: {
      lungDisease: false,
      heartAttack: false,
      chf: false,
      bloodClots: false,
      cancer: false,
      cancerType: '',
      diabetes: false,
      diabetesTreatment: '',
      highBP: false,
      highCholesterol: false,
      kidneyProblems: false,
      liverProblems: false,
      thyroidDisease: false,
      mentalHealth: false,
      substanceAbuse: false,
      mobilityEquipment: false,
      cognitiveIssues: false,
      recentHospitalization: false,
      nursingFacility: false,
    },
    medications: '',
    licenseIssues: false,
    dui: false,
    felony: false,
    coverageType: '',
    coverageAmount: '',
    monthlyPremium: '',
    policyOption: '',
    coverageBegins: '',
    agentName: '',
    agentId: '',
    agency: '',
    applicationDate: format(new Date(), 'yyyy-MM-dd'),
    policyNumber: '',
    effectivePolicyDate: '',
    policySubmitDate: format(new Date(), 'yyyy-MM-dd'),
    paidStatus: 'unpaid',
    status: 'Pending',
    annualPremium: '',
    product: ''
  })

  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const handleChange = (field: string, value: any) => {
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }))
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev] as Record<string, any>,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const requiredFields = [
      'firstName', 
      'lastName', 
      'phoneNumber', 
      'state', 
      'agency', // carrier
      'coverageType', // product type
      'monthlyPremium',
      'product' // specific product
    ]
    
    const newErrors: Record<string, boolean> = {}
    let hasErrors = false
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = true
        hasErrors = true
      }
    })
    
    if (hasErrors) {
      setErrors(newErrors)
      
      // Show error toast
      toast({
        title: "Please fill required fields",
        description: "Please fill in all required fields before saving.",
        variant: "destructive",
        duration: 5000,
      })
      
      // Scroll to first error
      const firstErrorField = document.querySelector(`[data-error="true"]`)
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      
      return
    }
    
    try {
      // Prepare application data for database
      const applicationData = {
        // Client Info
        proposed_insured: `${formData.firstName} ${formData.lastName}`.trim(),
        client_phone_number: formData.phoneNumber,
        client_state: formData.state,
        client_email: formData.email,
        client_address: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`.trim(),
        date_of_birth: formData.dateOfBirth,
        ssn: formData.ssn,
        
        // Policy Info
        policy_type: formData.policyType,
        coverage_for: formData.coverageFor,
        existing_coverage: formData.existingCoverage,
        new_policy_reason: formData.newPolicyReason,
        
        // Payment Info
        payment_method: formData.paymentMethod,
        bank_name: formData.bankName,
        account_type: formData.accountType,
        routing_number: formData.routingNumber,
        account_number: formData.accountNumber,
        
        // Purpose & Beneficiary
        primary_reason: formData.primaryReason,
        funeral_type: formData.funeralType,
        funeral_planner: formData.funeralPlanner,
        beneficiary_name: formData.beneficiaryName,
        beneficiary_relationship: formData.beneficiaryRelationship,
        contingent_beneficiary: formData.contingentBeneficiary,
        
        // Health Info
        tobacco_use: formData.tobaccoUse,
        tobacco_type: formData.tobaccoType,
        tobacco_frequency: formData.tobaccoFrequency,
        height: `${formData.heightFeet}'${formData.heightInches}"`,
        weight: formData.weight,
        medical_conditions: JSON.stringify(formData.medicalConditions),
        medications: formData.medications,
        
        // Policy Selection
        coverage_type: formData.coverageType,
        coverage_amount: formData.coverageAmount,
        monthly_premium: formData.monthlyPremium,
        policy_option: formData.policyOption,
        coverage_begins: formData.coverageBegins,
        
        // Agent Info & Metadata
        agent_name: formData.agentName,
        agent_id: formData.agentId,
        agency: formData.agency,
        application_date: formData.applicationDate,
        text_permission: formData.textPermission,
        
        // New fields
        policy_number: formData.policyNumber,
        effective_policy_date: formData.effectivePolicyDate,
        policy_submit_date: formData.policySubmitDate,
        paid_status: formData.paidStatus,
        status: formData.status,
        annual_premium: formData.annualPremium,
        product: formData.product,
        
        // System fields
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      console.log('Application ready for database:', applicationData)
      
      // Insert data into Supabase
      const { data, error } = await supabase
        .from('agent_applications')
        .insert([applicationData])
        .select()
      
      if (error) {
        throw error
      }
      
      // Show success message using toast component
      toast({
        title: "Application saved",
        description: "The application has been successfully saved to the database.",
        duration: 3000,
      })
      
      // Redirect to applications list after successful save
      router.push('/agent/applications')
      
    } catch (error) {
      console.error('Error saving application:', error)
      toast({
        title: "Error saving application",
        description: "There was a problem saving your application. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      <h1 className="text-3xl font-bold p-3 flex-shrink-0">Script Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow overflow-hidden">
        {/* Script Side */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="sticky top-0 z-10 bg-white border-b flex-shrink-0 py-2">
            <CardTitle>Call Script</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto flex-1 p-4">
            <div className="prose max-w-none space-y-6">
              {/* Introduction Section */}
              <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <h3 className="font-bold text-blue-800 border-b border-blue-200 pb-2 mb-3">Introduction:</h3>
                <p className="mb-3">Thank you for calling the life insurance department on a recorded line, this is ________. Are you calling to set up a new life insurance policy or a final expense policy?</p>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3 italic text-sm">
                  <p>((if getting free vibes)) The plans aren't free but they're made to be affordable for seniors on a fixed income. Is information on affordable life insurance/final expense coverage something you're looking for?</p>
                </div>
                
                <div className="space-y-2 mt-3">
                  <p>(IF YES) Now, were you looking for anything specific or just wanting to see all your options?</p>
                  <p>And will this insurance policy be for yourself or a loved one as well?</p>
                  <p>And it looks like you're calling in from the state of ____, is that correct?</p>
                  <p>And who do I have the pleasure of speaking with, your first name and last name?</p>
                  <p>And what is your date of birth?</p>
                  <p>Do you have an active life insurance policy in place or is this your first time shopping for coverage?</p>
                  <p>(IF YES) Are you looking to leave a little more behind for the family or get a better rate on your current coverage?</p>
                </div>
              </div>
              
              {/* Text Permission Section */}
              <div className="rounded-md border border-green-100 bg-green-50 p-4">
                <h3 className="font-bold text-green-800 border-b border-green-200 pb-2 mb-3">SEND TEXT</h3>
                <p>Now, Do you accept texts at this number? Okay That's the number I'll be calling you back from incase we get disconnected and you can call me directly on that number as well. That way you don't have to keep calling the toll-free number and getting random agents, you can deal with me directly, okay?</p>
                
                <p className="mt-3">Let me go ahead and get started. In case you missed it, my name is agent name, the process here is pretty simple and easy, I'm a field underwriter for ALL 40 carriers in (STATE). So basically my job is just to go over your medical situation, see what you would be eligible for and then I'll be able to actually shop the rates across ALL the top carriers in (STATE) for you to see which one would give you the most affordable rate on coverage, does that make sense?</p>
              </div>
              
              {/* Health Questions Section */}
              <div className="rounded-md border border-red-100 bg-red-50 p-4">
                <h3 className="font-bold text-red-800 border-b border-red-200 pb-2 mb-3">Health Questions:</h3>
                <p className="mb-3">Now I'm going to ask you the standard medical questions for all 40 carriers in the state. Have you ever been diagnosed or treated for any of the following medical conditions?</p>
                
                <ul className="list-disc pl-6 space-y-1 mt-3">
                  <li>Any nicotine or tobacco usage?</li>
                  <li>Any lung disease, asthma, or COPD?</li>
                  <li>Heart attack, stroke, TIA, or stents?</li>
                  <li>Have you ever been diagnosed with congestive heart failure?</li>
                  <li>Blood clots?</li>
                  <li>Any cancers?</li>
                  <li>Diabetes or neuropathy or Amputation? (Pills and/or insulin?)</li>
                  <li>High blood pressure or high cholesterol?</li>
                  <li>Kidney or liver problems?</li>
                  <li>Thyroid disease?</li>
                  <li>Any treatment for anxiety, depression or bipolar?</li>
                  <li>Treatment needed for alcohol or drug abuse?</li>
                  <li>Walking or oxygen equipment?</li>
                  <li>Alzheimer's or dementia?</li>
                  <li>Any hospitalizations that resulted in a stay for over 24 hours within the past year?</li>
                  <li>Are you currently confined to a nursing home or skilled nursing facility?</li>
                  <li>Any other medications?</li>
                  <li>(If Applicable) Within the last 5 years have you had your license suspended or Revoked? DUI, DWI etc. or have had any felonies?</li>
                  <li>Current height & weight?</li>
                </ul>
                
                <div className="bg-orange-50 border-l-4 border-orange-300 p-3 mt-4">
                  <p className="font-medium">Confirm Bank or Direct Express</p>
                  <p>I want to double check and see if there may be any discounts available for you. For payment methods… Do you have a valid US bank account or just a direct express card?</p>
                </div>
              </div>
              
              {/* The WHY Section */}
              <div className="rounded-md border border-purple-100 bg-purple-50 p-4">
                <h3 className="font-bold text-purple-800 border-b border-purple-200 pb-2 mb-3">The WHY (Negative Situation, Situation/Problem Awareness)</h3>
                <p className="mb-3">What has you looking around for life insurance… were you looking to cover funeral expenses or maybe leave some money behind for the family? <span className="text-gray-600 italic">(Say this slow, and kind of confused, like you're trying to think of the words to use)</span></p>
                
                <div className="space-y-2 mt-3">
                  <p>(QUOTES/SHOPPING) Ok… most people when requesting this are usually looking to take care of the funeral expenses. Is it the same for you?</p>
                  <p>(IF FUNERAL) Burial or cremation?</p>
                  <p>Have you ever had to plan a funeral before?</p>
                  <p>Burial typically 10k-15k (Information from national funeral directors association)</p>
                  <p>Cremation 4k-8k (Information from national funeral directors association)</p>
                  <p>Who would be taking care of the funeral proceedings when you pass away?</p>
                </div>
              </div>
              
              {/* Reiterate Section */}
              <div className="rounded-md border border-indigo-100 bg-indigo-50 p-4">
                <h3 className="font-bold text-indigo-800 border-b border-indigo-200 pb-2 mb-3">Reiterate Their Why</h3>
                <p>Got it. Alright, just to make sure i'm understanding you correctly, you're wanting to take a look into a policy today that is going to protect (BENEFICIARY) so that when the time comes, he/she isn't financially burdened with any of your burial/cremation expenses, is that correct?</p>
              </div>
              
              {/* Presentation Section */}
              <div className="rounded-md border border-amber-100 bg-amber-50 p-4">
                <h3 className="font-bold text-amber-800 border-b border-amber-200 pb-2 mb-3">Presentation</h3>
                <p className="font-bold bg-amber-100 p-2 inline-block rounded">Term VS Whole Life (**ONLY EXPLAIN IF PITCHING WHOLE)</p>
                
                <div className="space-y-3 mt-3">
                  <p>When it comes to life insurance there's 2 different types of coverage: Term Life & Whole Life.</p>
                  
                  <div className="rounded bg-white p-3 border-l-4 border-amber-300">
                    <p className="font-semibold">Term Life Insurance:</p>
                    <p>That's the one you see in those ads. Usually, you'll see things like $50K, $75K, or $100K of coverage for a cheaper monthly premium. But what they don't tell you in the ads is that it only lasts for a certain amount of time—sometimes 5 years, sometimes 10 years—and once that time is up, your coverage expires, and it doesn't refund the premiums or pay out the death benefit. That's why we don't recommend it.</p>
                  </div>
                  
                  <div className="rounded bg-white p-3 border-l-4 border-amber-600">
                    <p className="font-semibold">Whole Life Insurance:</p>
                    <p>Lasts your whole entire life. All that means is it's 100% guaranteed to pay out to (BENEFICIARY) because it NEVER expires on you. On top of that, the coverage remains level for your entire life, meaning they can never make you pay more for the policy or reduce the coverage amount.</p>
                  </div>
                  
                  <p className="font-medium mt-4">Based on your situation we recommend Whole Life coverage. Do you agree?</p>
                </div>
              </div>
              
              {/* Policy Options Section */}
              <div className="rounded-md border border-cyan-100 bg-cyan-50 p-4">
                <h3 className="font-bold text-cyan-800 border-b border-cyan-200 pb-2 mb-3">Policy Options:</h3>
                <p className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3 font-medium">GIVE 3 OPTIONS. IF THEY'VE TOLD YOU AN AMOUNT OF COVERAGE THEY WERE INTERESTED IN, MAKE THAT ONE OF THE OPTIONS</p>
                
                <div className="space-y-2">
                  <p>Okay, so I've found the carrier that is coming in with the highest chance of approval at the lowest monthly premiums. Can you grab a pen and paper please?</p>
                  <p>Alright, so I have 3 options for you here</p>
                  
                  <div className="ml-4 space-y-1 font-medium mt-2">
                    <p>Option 1 (highest price)</p>
                    <p>Option 2 (middle price)</p>
                    <p>Option 3 (lowest price)</p>
                  </div>
                </div>
                
                <div className="space-y-3 mt-5">
                  <div className="bg-green-50 border-l-4 border-green-400 p-3">
                    <p className="text-gray-700 italic font-medium">(If Level)</p>
                    <p>All those options are immediate Day 1 coverage meaning when we get you qualified the coverage would pay out if you were to even pass the next day… god forbid!</p>
                  </div>
                  
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-3">
                    <p className="text-gray-700 italic font-medium">(If Graded or Modified or GI)</p>
                    <p>This coverage would increase in value over the first two years. Reaching its full potential at the end of year two. God forbid you passed away in the first two years your family would receive a refund of the premiums paid plus 10%. This is better than any savings account you could set up. Also if you were to pass due to an accident in the first 2 years the full payout would be sent to your family.</p>
                  </div>
                </div>
              </div>
              
              {/* Close Question Section */}
              <div className="rounded-md border border-teal-100 bg-teal-50 p-4">
                <h3 className="font-bold text-teal-800 border-b border-teal-200 pb-2 mb-3">Close Question</h3>
                <p>Now, I'm just the initial underwriter, I don't give the final decision. Ultimately that's up to (CARRIER). But if we can get you approved, which option would make the most sense for you?</p>
              </div>
              
              {/* Transition Section */}
              <div className="rounded-md border border-pink-100 bg-pink-50 p-4">
                <h3 className="font-bold text-pink-800 border-b border-pink-200 pb-2 mb-3">Transition Into Application</h3>
                <p className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3 font-medium">MOVE INTO THE APPLICATION WITHOUT PAUSING ONCE THEY PICK AN OPTION THEY ARE COMFORTABLE WITH.</p>
                <p>I'm going to try my best to get you approved. The application only takes a few minutes. What address should we mail your policy packet out to? (CONTINUE WITH APPLICATION)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Form Side */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="sticky top-0 z-10 bg-slate-50 border-b flex-shrink-0 py-2">
            <CardTitle>Application Form</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto flex-1 p-4">
            <form onSubmit={handleSubmit} className="space-y-8 py-2">
              {/* Client Information Section */}
              <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4">CLIENT INFORMATION</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="font-medium">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="firstName" 
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className={`${styles.input} ${errors.firstName ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        data-error={errors.firstName || undefined}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="font-medium">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="lastName" 
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        className={`${styles.input} ${errors.lastName ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        data-error={errors.lastName || undefined}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth" className="font-medium">Date of Birth</Label>
                      <Input 
                        id="dateOfBirth" 
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber" className="font-medium">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="phoneNumber" 
                        placeholder="(555) 555-5555"
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        className={`${styles.input} ${errors.phoneNumber ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        data-error={errors.phoneNumber || undefined}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="street" className="font-medium">Street</Label>
                    <Input 
                      id="street" 
                      value={formData.street}
                      onChange={(e) => handleChange('street', e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="font-medium">City</Label>
                      <Input 
                        id="city" 
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="font-medium">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => handleChange('state', value)}
                      >
                        <SelectTrigger 
                          id="state" 
                          className={`${styles.select} ${errors.state ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          data-error={errors.state || undefined}
                        >
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className={styles.selectContent}>
                          {states.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="zip" className="font-medium">ZIP</Label>
                      <Input 
                        id="zip" 
                        value={formData.zip}
                        onChange={(e) => handleChange('zip', e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="font-medium">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender" className="font-medium">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleChange('gender', value)}
                      >
                        <SelectTrigger id="gender" className={styles.select}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className={styles.selectContent}>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ssn" className="font-medium">Social Security Number</Label>
                      <Input 
                        id="ssn" 
                        placeholder="XXX-XX-XXXX"
                        value={formData.ssn}
                        onChange={(e) => handleChange('ssn', e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox 
                        id="textPermission"
                        checked={formData.textPermission}
                        onCheckedChange={(checked) => handleChange('textPermission', checked)}
                        className={styles.checkbox}
                      />
                      <Label htmlFor="textPermission" className="font-medium">Text Permission</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Policy Information Section */}
              <div className="rounded-md border border-green-100 bg-green-50 p-4">
                <h3 className="text-lg font-semibold text-green-800 border-b border-green-200 pb-2 mb-4">POLICY INFORMATION</h3>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-md">
                    <Label className="font-medium">Policy Type</Label>
                    <div className="flex space-x-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="policyTypeNew"
                          checked={formData.policyType === 'new'}
                          onCheckedChange={(checked) => {
                            if (checked) handleChange('policyType', 'new')
                          }}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="policyTypeNew">New Life Insurance Policy</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="policyTypeFinal"
                          checked={formData.policyType === 'final'}
                          onCheckedChange={(checked) => {
                            if (checked) handleChange('policyType', 'final')
                          }}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="policyTypeFinal">Final Expense Policy</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md">
                    <Label className="font-medium">Coverage For</Label>
                    <div className="flex space-x-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="coverageSelf"
                          checked={formData.coverageFor === 'self'}
                          onCheckedChange={(checked) => {
                            if (checked) handleChange('coverageFor', 'self')
                          }}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="coverageSelf">Self</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="coverageLoved"
                          checked={formData.coverageFor === 'loved'}
                          onCheckedChange={(checked) => {
                            if (checked) handleChange('coverageFor', 'loved')
                          }}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="coverageLoved">Loved One</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-md">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="existingCoverage"
                          checked={formData.existingCoverage}
                          onCheckedChange={(checked) => handleChange('existingCoverage', checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="existingCoverage" className="font-medium">Existing Coverage</Label>
                      </div>
                    </div>
                    
                    {formData.existingCoverage && (
                      <div className="bg-white p-3 rounded-md">
                        <Label className="font-medium">Reason for New Policy</Label>
                        <div className="flex space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="reasonAdditional"
                              checked={formData.newPolicyReason === 'additional'}
                              onCheckedChange={(checked) => {
                                if (checked) handleChange('newPolicyReason', 'additional')
                              }}
                              className={styles.checkbox}
                            />
                            <Label htmlFor="reasonAdditional">Additional Coverage</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="reasonBetter"
                              checked={formData.newPolicyReason === 'better'}
                              onCheckedChange={(checked) => {
                                if (checked) handleChange('newPolicyReason', 'better')
                              }}
                              className={styles.checkbox}
                            />
                            <Label htmlFor="reasonBetter">Better Rate</Label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="font-medium">Payment Method</Label>
                    <div className="flex space-x-6 mt-2 bg-white p-3 rounded-md">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="paymentBank"
                          checked={formData.paymentMethod === 'bank'}
                          onCheckedChange={(checked) => {
                            if (checked) handleChange('paymentMethod', 'bank')
                          }}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="paymentBank">Bank Account</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="paymentExpress"
                          checked={formData.paymentMethod === 'express'}
                          onCheckedChange={(checked) => {
                            if (checked) handleChange('paymentMethod', 'express')
                          }}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="paymentExpress">Direct Express Card</Label>
                      </div>
                    </div>
                  </div>
                  
                  {formData.paymentMethod === 'bank' && (
                    <div className="space-y-4 mt-2 bg-white p-3 rounded-md border border-green-200">
                      <div>
                        <Label htmlFor="bankName" className="font-medium">Bank Name</Label>
                        <Input 
                          id="bankName" 
                          value={formData.bankName}
                          onChange={(e) => handleChange('bankName', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="font-medium">Account Type</Label>
                        <div className="flex space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="accountChecking"
                              checked={formData.accountType === 'checking'}
                              onCheckedChange={(checked) => {
                                if (checked) handleChange('accountType', 'checking')
                              }}
                              className={styles.checkbox}
                            />
                            <Label htmlFor="accountChecking">Checking</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="accountSavings"
                              checked={formData.accountType === 'savings'}
                              onCheckedChange={(checked) => {
                                if (checked) handleChange('accountType', 'savings')
                              }}
                              className={styles.checkbox}
                            />
                            <Label htmlFor="accountSavings">Savings</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="routingNumber" className="font-medium">Routing Number</Label>
                          <Input 
                            id="routingNumber" 
                            value={formData.routingNumber}
                            onChange={(e) => handleChange('routingNumber', e.target.value)}
                            className="bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber" className="font-medium">Account Number</Label>
                          <Input 
                            id="accountNumber" 
                            value={formData.accountNumber}
                            onChange={(e) => handleChange('accountNumber', e.target.value)}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Purpose of Insurance Section */}
              <div className="rounded-md border border-purple-100 bg-purple-50 p-4">
                <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2 mb-4">PURPOSE OF INSURANCE</h3>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-md mb-4">
                    <Label className="font-medium">Primary Reason for Coverage</Label>
                    <div className="flex flex-col space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="reasonFuneral"
                          checked={formData.primaryReason === 'funeral'}
                          onCheckedChange={(checked) => {
                            if (checked) handleChange('primaryReason', 'funeral')
                          }}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="reasonFuneral">Funeral/Burial Expenses</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="reasonFamily"
                          checked={formData.primaryReason === 'family'}
                          onCheckedChange={(checked) => {
                            if (checked) handleChange('primaryReason', 'family')
                          }}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="reasonFamily">Leave Money to Family</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="reasonOther"
                          checked={formData.primaryReason === 'other'}
                          onCheckedChange={(checked) => {
                            if (checked) handleChange('primaryReason', 'other')
                          }}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="reasonOther">Other</Label>
                      </div>
                    </div>
                  </div>
                  
                  {formData.primaryReason === 'funeral' && (
                    <div className="space-y-4 mt-2 bg-white p-3 rounded-md border border-purple-200">
                      <div>
                        <Label className="font-medium">Funeral Type</Label>
                        <div className="flex space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="funeralBurial"
                              checked={formData.funeralType === 'burial'}
                              onCheckedChange={(checked) => {
                                if (checked) handleChange('funeralType', 'burial')
                              }}
                              className={styles.checkbox}
                            />
                            <Label htmlFor="funeralBurial">Burial</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="funeralCremation"
                              checked={formData.funeralType === 'cremation'}
                              onCheckedChange={(checked) => {
                                if (checked) handleChange('funeralType', 'cremation')
                              }}
                              className={styles.checkbox}
                            />
                            <Label htmlFor="funeralCremation">Cremation</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="funeralPlanner" className="font-medium">Designated Funeral Planner</Label>
                        <Input 
                          id="funeralPlanner" 
                          value={formData.funeralPlanner}
                          onChange={(e) => handleChange('funeralPlanner', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="beneficiaryName" className="font-medium">Primary Beneficiary</Label>
                      <Input 
                        id="beneficiaryName" 
                        value={formData.beneficiaryName}
                        onChange={(e) => handleChange('beneficiaryName', e.target.value)}
                        className="bg-white mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="beneficiaryRelationship" className="font-medium">Relationship</Label>
                      <Input 
                        id="beneficiaryRelationship" 
                        value={formData.beneficiaryRelationship}
                        onChange={(e) => handleChange('beneficiaryRelationship', e.target.value)}
                        className="bg-white mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="contingentBeneficiary" className="font-medium">Contingent Beneficiary</Label>
                    <Input 
                      id="contingentBeneficiary" 
                      value={formData.contingentBeneficiary}
                      onChange={(e) => handleChange('contingentBeneficiary', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
              
              {/* Health Questions Section */}
              <div className="rounded-md border border-red-100 bg-red-50 p-4">
                <h3 className="text-lg font-semibold text-red-800 border-b border-red-200 pb-2 mb-4">HEALTH QUESTIONNAIRE</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-md">
                      <Label className="font-medium">Tobacco/Nicotine Use</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox 
                          id="tobaccoUse"
                          checked={formData.tobaccoUse}
                          onCheckedChange={(checked) => handleChange('tobaccoUse', checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="tobaccoUse">Yes</Label>
                      </div>
                      
                      {formData.tobaccoUse && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <Label htmlFor="tobaccoType" className="text-sm">Type</Label>
                            <Input 
                              id="tobaccoType" 
                              value={formData.tobaccoType}
                              onChange={(e) => handleChange('tobaccoType', e.target.value)}
                              className="bg-white text-sm h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="tobaccoFrequency" className="text-sm">Frequency</Label>
                            <Input 
                              id="tobaccoFrequency" 
                              value={formData.tobaccoFrequency}
                              onChange={(e) => handleChange('tobaccoFrequency', e.target.value)}
                              className="bg-white text-sm h-8"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-white p-3 rounded-md">
                      <Label className="font-medium">Height & Weight</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <Label htmlFor="heightFeet" className="text-sm">Feet</Label>
                          <Input 
                            id="heightFeet" 
                            value={formData.heightFeet}
                            onChange={(e) => handleChange('heightFeet', e.target.value)}
                            className="bg-white text-sm h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="heightInches" className="text-sm">Inches</Label>
                          <Input 
                            id="heightInches" 
                            value={formData.heightInches}
                            onChange={(e) => handleChange('heightInches', e.target.value)}
                            className="bg-white text-sm h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="weight" className="text-sm">Weight (lbs)</Label>
                          <Input 
                            id="weight" 
                            value={formData.weight}
                            onChange={(e) => handleChange('weight', e.target.value)}
                            className="bg-white text-sm h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md">
                    <Label className="font-medium">Medical Conditions</Label>
                    <div className="grid grid-cols-2 mt-2 gap-y-2 gap-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="lungDisease"
                          checked={formData.medicalConditions.lungDisease}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'lungDisease', checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="lungDisease">Lung disease/Asthma/COPD</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="heartAttack"
                          checked={formData.medicalConditions.heartAttack}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'heartAttack', checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="heartAttack">Heart attack/Stroke/TIA/Stents</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="chf"
                          checked={formData.medicalConditions.chf}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'chf', checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="chf">Congestive heart failure</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="bloodClots"
                          checked={formData.medicalConditions.bloodClots}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'bloodClots', checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="bloodClots">Blood clots</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="cancer"
                          checked={formData.medicalConditions.cancer}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'cancer', checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="cancer">Cancer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="diabetes"
                          checked={formData.medicalConditions.diabetes}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'diabetes', checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="diabetes">Diabetes/Neuropathy/Amputation</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="highBP"
                          checked={formData.medicalConditions.highBP}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'highBP', checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="highBP">High blood pressure</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="highCholesterol"
                          checked={formData.medicalConditions.highCholesterol}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'highCholesterol', checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="highCholesterol">High cholesterol</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="medications" className="font-medium">Current Medications</Label>
                    <Textarea 
                      id="medications" 
                      value={formData.medications}
                      onChange={(e) => handleChange('medications', e.target.value)}
                      className="bg-white h-20 mt-1"
                    />
                  </div>
                </div>
              </div>
              
              {/* Policy Selection Section */}
              <div className="rounded-md border border-amber-100 bg-amber-50 p-4">
                <h3 className="text-lg font-semibold text-amber-800 border-b border-amber-200 pb-2 mb-4">POLICY SELECTION</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-md">
                      <Label className="font-medium">Coverage Type</Label>
                      <div className="flex space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="coverageTypeTerm"
                            checked={formData.coverageType === 'term'}
                            onCheckedChange={(checked) => {
                              if (checked) handleChange('coverageType', 'term')
                            }}
                            className={styles.checkbox}
                          />
                          <Label htmlFor="coverageTypeTerm">Term Life</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="coverageTypeWhole"
                            checked={formData.coverageType === 'whole'}
                            onCheckedChange={(checked) => {
                              if (checked) handleChange('coverageType', 'whole')
                            }}
                            className={styles.checkbox}
                          />
                          <Label htmlFor="coverageTypeWhole">Whole Life</Label>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <Label className="font-medium">Coverage Begins</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="coverageBeginsImmediate"
                            checked={formData.coverageBegins === 'immediate'}
                            onCheckedChange={(checked) => {
                              if (checked) handleChange('coverageBegins', 'immediate')
                            }}
                            className={styles.checkbox}
                          />
                          <Label htmlFor="coverageBeginsImmediate">Immediate</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="coverageBeginsGraded"
                            checked={formData.coverageBegins === 'graded'}
                            onCheckedChange={(checked) => {
                              if (checked) handleChange('coverageBegins', 'graded')
                            }}
                            className={styles.checkbox}
                          />
                          <Label htmlFor="coverageBeginsGraded">Graded</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="coverageBeginsModified"
                            checked={formData.coverageBegins === 'modified'}
                            onCheckedChange={(checked) => {
                              if (checked) handleChange('coverageBegins', 'modified')
                            }}
                            className={styles.checkbox}
                          />
                          <Label htmlFor="coverageBeginsModified">Modified</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="coverageBeginsGI"
                            checked={formData.coverageBegins === 'gi'}
                            onCheckedChange={(checked) => {
                              if (checked) handleChange('coverageBegins', 'gi')
                            }}
                            className={styles.checkbox}
                          />
                          <Label htmlFor="coverageBeginsGI">Guaranteed Issue</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="coverageAmount" className="font-medium">Coverage Amount</Label>
                      <Input 
                        id="coverageAmount" 
                        placeholder="$10,000"
                        value={formData.coverageAmount}
                        onChange={(e) => handleChange('coverageAmount', e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthlyPremium" className="font-medium">
                        Monthly Premium <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="monthlyPremium" 
                        placeholder="$45.00"
                        value={formData.monthlyPremium}
                        onChange={(e) => handleChange('monthlyPremium', e.target.value)}
                        className={`bg-white ${errors.monthlyPremium ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        data-error={errors.monthlyPremium || undefined}
                      />
                    </div>
                    <div>
                      <Label htmlFor="annualPremium" className="font-medium">
                        Annual Premium (AP)
                      </Label>
                      <Input 
                        id="annualPremium" 
                        placeholder="$540.00"
                        value={formData.annualPremium}
                        onChange={(e) => handleChange('annualPremium', e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product" className="font-medium">
                        Product <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="product" 
                        placeholder="e.g. Guaranteed Acceptance"
                        value={formData.product}
                        onChange={(e) => handleChange('product', e.target.value)}
                        className={`bg-white ${errors.product ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        data-error={errors.product || undefined}
                      />
                    </div>
                    <div>
                      <Label htmlFor="policyNumber" className="font-medium">
                        Policy #
                      </Label>
                      <Input 
                        id="policyNumber" 
                        placeholder="e.g. POL-12345678"
                        value={formData.policyNumber}
                        onChange={(e) => handleChange('policyNumber', e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="policyOption1"
                          checked={formData.policyOption === 'option1'}
                          onCheckedChange={(checked) => {
                            if (checked) handleChange('policyOption', 'option1')
                          }}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="policyOption1">Option 1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="policyOption2"
                          checked={formData.policyOption === 'option2'}
                          onCheckedChange={(checked) => {
                            if (checked) handleChange('policyOption', 'option2')
                          }}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="policyOption2">Option 2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="policyOption3"
                          checked={formData.policyOption === 'option3'}
                          onCheckedChange={(checked) => {
                            if (checked) handleChange('policyOption', 'option3')
                          }}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="policyOption3">Option 3</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Policy Dates & Status Section */}
              <div className="rounded-md border border-cyan-100 bg-cyan-50 p-4">
                <h3 className="text-lg font-semibold text-cyan-800 border-b border-cyan-200 pb-2 mb-4">POLICY DATES & STATUS</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="policySubmitDate" className="font-medium">
                        Policy Submit Date
                      </Label>
                      <Input 
                        id="policySubmitDate" 
                        type="date"
                        value={formData.policySubmitDate}
                        onChange={(e) => handleChange('policySubmitDate', e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="effectivePolicyDate" className="font-medium">
                        Effective Policy Date
                      </Label>
                      <Input 
                        id="effectivePolicyDate" 
                        type="date"
                        value={formData.effectivePolicyDate}
                        onChange={(e) => handleChange('effectivePolicyDate', e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange('status', value)}
                      >
                        <SelectTrigger className={styles.select}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className={styles.selectContent}>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Declined">Declined</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                          <SelectItem value="In Review">In Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-medium">Paid Status</Label>
                      <Select
                        value={formData.paidStatus}
                        onValueChange={(value) => handleChange('paidStatus', value)}
                      >
                        <SelectTrigger className={styles.select}>
                          <SelectValue placeholder="Select paid status" />
                        </SelectTrigger>
                        <SelectContent className={styles.selectContent}>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                          <SelectItem value="pending">Payment Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="partial">Partially Paid</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Agent Information */}
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">AGENT INFORMATION</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="agentName" className="font-medium">Agent Name</Label>
                    <Input 
                      id="agentName" 
                      value={formData.agentName}
                      onChange={(e) => handleChange('agentName', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agentId" className="font-medium">Agent ID/Number</Label>
                    <Input 
                      id="agentId" 
                      value={formData.agentId}
                      onChange={(e) => handleChange('agentId', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agency" className="font-medium">
                      Agency/Carrier <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="agency" 
                      value={formData.agency}
                      onChange={(e) => handleChange('agency', e.target.value)}
                      className={`bg-white ${errors.agency ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.agency || undefined}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center space-x-3 pt-2 pb-4">
                <p className="text-sm text-gray-500">Fields marked with <span className="text-red-500">*</span> are required</p>
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="bg-white"
                  >
                    Reset Form
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Application
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 