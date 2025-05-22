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
      'street',
      'state', 
      'city',
      'zip',
      'gender',
      'dateOfBirth',
      'beneficiaryName',
      'beneficiaryRelationship',
      'tobaccoUse',
      'heightFeet',
      'heightInches',
      'weight',
      'coverageAmount',
      'agency', // carrier
      'coverageType', // product type
      'monthlyPremium',
      'product', // specific product
      'policyNumber',
      'effectivePolicyDate',
      'policySubmitDate',
      'paidStatus'
    ]
    
    const newErrors: Record<string, boolean> = {}
    let hasErrors = false
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = true
        hasErrors = true
      }
    })
    
    // Validate medical conditions are answered
    const medicalFieldsRequired = [
      'lungDisease',
      'heartAttack',
      'chf',
      'bloodClots',
      'cancer',
      'diabetes',
      'highBP',
      'highCholesterol'
    ]
    
    // Make sure at least one medical condition checkbox has been checked (either Yes or No)
    let atLeastOneMedicalConditionAnswered = medicalFieldsRequired.some(field => 
      typeof formData.medicalConditions[field as keyof typeof formData.medicalConditions] === 'boolean'
    );
    
    if (!atLeastOneMedicalConditionAnswered) {
      newErrors['medicalConditions'] = true;
      hasErrors = true;
    }
    
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
        street_address: formData.street,
        client_address: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`.trim(),
        date_of_birth: formData.dateOfBirth,
        city: formData.city,
        zip: formData.zip,
        gender: formData.gender,
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
        primary_beneficiary: formData.beneficiaryName,
        beneficiary_relationship: formData.beneficiaryRelationship,
        relationship_to_insured: formData.beneficiaryRelationship,
        contingent_beneficiary: formData.contingentBeneficiary,
        
        // Health Info
        tobacco_use: formData.tobaccoUse,
        tobacco_nicotine_use: formData.tobaccoUse,
        tobacco_type: formData.tobaccoType,
        tobacco_frequency: formData.tobaccoFrequency,
        height: `${formData.heightFeet}'${formData.heightInches}"`,
        height_feet: parseInt(formData.heightFeet) || null,
        height_inches: parseInt(formData.heightInches) || null,
        weight: formData.weight,
        weight_lbs: parseInt(formData.weight) || null,
        medical_conditions: JSON.stringify(formData.medicalConditions),
        medical_lung_disease: formData.medicalConditions.lungDisease,
        medical_heart_attack: formData.medicalConditions.heartAttack,
        medical_heart_failure: formData.medicalConditions.chf,
        medical_blood_clots: formData.medicalConditions.bloodClots,
        medical_cancer: formData.medicalConditions.cancer,
        medical_diabetes: formData.medicalConditions.diabetes,
        medical_high_bp: formData.medicalConditions.highBP,
        medical_high_cholesterol: formData.medicalConditions.highCholesterol,
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
        created_by_manager: true, // Add flag to indicate this was created by a manager
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
      router.push('/manager/applications')
      
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
      <h1 className="text-3xl font-bold p-3 flex-shrink-0">Manager Script Assistant</h1>
      
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
                </div>
              </div>

              {/* Address Section */}
              <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4">ADDRESS</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street" className="font-medium">
                      Street Address <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="street" 
                      value={formData.street}
                      onChange={(e) => handleChange('street', e.target.value)}
                      className={`bg-white ${errors.street ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.street || undefined}
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
                  <div>
                    <Label htmlFor="coverageFor" className="font-medium">
                      Coverage For
                    </Label>
                    <Input 
                      id="coverageFor" 
                      value={formData.coverageFor}
                      onChange={(e) => handleChange('coverageFor', e.target.value)}
                      className={`${styles.input} ${errors.coverageFor ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.coverageFor || undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="existingCoverage" className="font-medium">
                      Existing Coverage
                    </Label>
                    <Select 
                      id="existingCoverage" 
                      value={formData.existingCoverage ? 'Yes' : 'No'}
                      onValueChange={(value) => handleChange('existingCoverage', value === 'Yes')}
                      className={`${styles.select} ${errors.existingCoverage ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.existingCoverage || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select existing coverage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="newPolicyReason" className="font-medium">
                      New Policy Reason
                    </Label>
                    <Input 
                      id="newPolicyReason" 
                      value={formData.newPolicyReason}
                      onChange={(e) => handleChange('newPolicyReason', e.target.value)}
                      className={`${styles.input} ${errors.newPolicyReason ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.newPolicyReason || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information Section */}
              <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4">PAYMENT INFORMATION</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paymentMethod" className="font-medium">
                      Payment Method <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      id="paymentMethod" 
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleChange('paymentMethod', value)}
                      className={`${styles.select} ${errors.paymentMethod ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.paymentMethod || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank">Bank</SelectItem>
                        <SelectItem value="Direct Express">Direct Express</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bankName" className="font-medium">
                      Bank Name
                    </Label>
                    <Input 
                      id="bankName" 
                      value={formData.bankName}
                      onChange={(e) => handleChange('bankName', e.target.value)}
                      className={`${styles.input} ${errors.bankName ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.bankName || undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountType" className="font-medium">
                      Account Type
                    </Label>
                    <Select 
                      id="accountType" 
                      value={formData.accountType}
                      onValueChange={(value) => handleChange('accountType', value)}
                      className={`${styles.select} ${errors.accountType ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.accountType || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Checking">Checking</SelectItem>
                        <SelectItem value="Savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="routingNumber" className="font-medium">
                      Routing Number
                    </Label>
                    <Input 
                      id="routingNumber" 
                      value={formData.routingNumber}
                      onChange={(e) => handleChange('routingNumber', e.target.value)}
                      className={`${styles.input} ${errors.routingNumber ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.routingNumber || undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber" className="font-medium">
                      Account Number
                    </Label>
                    <Input 
                      id="accountNumber" 
                      value={formData.accountNumber}
                      onChange={(e) => handleChange('accountNumber', e.target.value)}
                      className={`${styles.input} ${errors.accountNumber ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.accountNumber || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Purpose and Beneficiary Section */}
              <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4">PURPOSE AND BENEFICIARY</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primaryReason" className="font-medium">
                      Primary Reason <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="primaryReason" 
                      value={formData.primaryReason}
                      onChange={(e) => handleChange('primaryReason', e.target.value)}
                      className={`${styles.input} ${errors.primaryReason ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.primaryReason || undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="funeralType" className="font-medium">
                      Funeral Type
                    </Label>
                    <Input 
                      id="funeralType" 
                      value={formData.funeralType}
                      onChange={(e) => handleChange('funeralType', e.target.value)}
                      className={`${styles.input} ${errors.funeralType ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.funeralType || undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="funeralPlanner" className="font-medium">
                      Funeral Planner
                    </Label>
                    <Input 
                      id="funeralPlanner" 
                      value={formData.funeralPlanner}
                      onChange={(e) => handleChange('funeralPlanner', e.target.value)}
                      className={`${styles.input} ${errors.funeralPlanner ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.funeralPlanner || undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="beneficiaryName" className="font-medium">
                      Beneficiary Name
                    </Label>
                    <Input 
                      id="beneficiaryName" 
                      value={formData.beneficiaryName}
                      onChange={(e) => handleChange('beneficiaryName', e.target.value)}
                      className={`${styles.input} ${errors.beneficiaryName ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.beneficiaryName || undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="beneficiaryRelationship" className="font-medium">
                      Beneficiary Relationship
                    </Label>
                    <Input 
                      id="beneficiaryRelationship" 
                      value={formData.beneficiaryRelationship}
                      onChange={(e) => handleChange('beneficiaryRelationship', e.target.value)}
                      className={`${styles.input} ${errors.beneficiaryRelationship ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.beneficiaryRelationship || undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contingentBeneficiary" className="font-medium">
                      Contingent Beneficiary
                    </Label>
                    <Input 
                      id="contingentBeneficiary" 
                      value={formData.contingentBeneficiary}
                      onChange={(e) => handleChange('contingentBeneficiary', e.target.value)}
                      className={`${styles.input} ${errors.contingentBeneficiary ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.contingentBeneficiary || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Health Information Section */}
              <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4">HEALTH INFORMATION</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tobaccoUse" className="font-medium">
                      Tobacco Use
                    </Label>
                    <Select 
                      id="tobaccoUse" 
                      value={formData.tobaccoUse ? 'Yes' : 'No'}
                      onValueChange={(value) => handleChange('tobaccoUse', value === 'Yes')}
                      className={`${styles.select} ${errors.tobaccoUse ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.tobaccoUse || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tobacco use" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tobaccoType" className="font-medium">
                      Tobacco Type
                    </Label>
                    <Input 
                      id="tobaccoType" 
                      value={formData.tobaccoType}
                      onChange={(e) => handleChange('tobaccoType', e.target.value)}
                      className={`${styles.input} ${errors.tobaccoType ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.tobaccoType || undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tobaccoFrequency" className="font-medium">
                      Tobacco Frequency
                    </Label>
                    <Input 
                      id="tobaccoFrequency" 
                      value={formData.tobaccoFrequency}
                      onChange={(e) => handleChange('tobaccoFrequency', e.target.value)}
                      className={`${styles.input} ${errors.tobaccoFrequency ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.tobaccoFrequency || undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="heightFeet" className="font-medium">
                      Height (Feet)
                    </Label>
                    <Input 
                      id="heightFeet" 
                      value={formData.heightFeet}
                      onChange={(e) => handleChange('heightFeet', e.target.value)}
                      className={`${styles.input} ${errors.heightFeet ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.heightFeet || undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="heightInches" className="font-medium">
                      Height (Inches)
                    </Label>
                    <Input 
                      id="heightInches" 
                      value={formData.heightInches}
                      onChange={(e) => handleChange('heightInches', e.target.value)}
                      className={`${styles.input} ${errors.heightInches ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.heightInches || undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight" className="font-medium">
                      Weight
                    </Label>
                    <Input 
                      id="weight" 
                      value={formData.weight}
                      onChange={(e) => handleChange('weight', e.target.value)}
                      className={`${styles.input} ${errors.weight ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.weight || undefined}
                    />
                  </div>
                  
                  {/* Medical Conditions Section */}
                  <div className="bg-white rounded-md p-4">
                    <Label className="font-medium mb-3 block">Medical Conditions</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="lungDisease"
                          checked={formData.medicalConditions.lungDisease}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'lungDisease', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="lungDisease">Lung Disease/COPD</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="heartAttack"
                          checked={formData.medicalConditions.heartAttack}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'heartAttack', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="heartAttack">Heart Attack/Stroke</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="chf"
                          checked={formData.medicalConditions.chf}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'chf', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="chf">Congestive Heart Failure</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="bloodClots"
                          checked={formData.medicalConditions.bloodClots}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'bloodClots', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="bloodClots">Blood Clots</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="cancer"
                          checked={formData.medicalConditions.cancer}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'cancer', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="cancer">Cancer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="cancerType">Cancer Type</Label>
                        <Input 
                          id="cancerType" 
                          value={formData.medicalConditions.cancerType}
                          onChange={(e) => handleNestedChange('medicalConditions', 'cancerType', e.target.value)}
                          className={styles.input}
                          size={20}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="diabetes"
                          checked={formData.medicalConditions.diabetes}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'diabetes', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="diabetes">Diabetes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="diabetesTreatment">Diabetes Treatment</Label>
                        <Input 
                          id="diabetesTreatment" 
                          value={formData.medicalConditions.diabetesTreatment}
                          onChange={(e) => handleNestedChange('medicalConditions', 'diabetesTreatment', e.target.value)}
                          className={styles.input}
                          size={20}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="highBP"
                          checked={formData.medicalConditions.highBP}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'highBP', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="highBP">High Blood Pressure</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="highCholesterol"
                          checked={formData.medicalConditions.highCholesterol}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'highCholesterol', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="highCholesterol">High Cholesterol</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="kidneyProblems"
                          checked={formData.medicalConditions.kidneyProblems}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'kidneyProblems', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="kidneyProblems">Kidney Problems</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="liverProblems"
                          checked={formData.medicalConditions.liverProblems}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'liverProblems', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="liverProblems">Liver Problems</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="thyroidDisease"
                          checked={formData.medicalConditions.thyroidDisease}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'thyroidDisease', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="thyroidDisease">Thyroid Disease</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mentalHealth"
                          checked={formData.medicalConditions.mentalHealth}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'mentalHealth', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="mentalHealth">Mental Health Issues</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="substanceAbuse"
                          checked={formData.medicalConditions.substanceAbuse}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'substanceAbuse', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="substanceAbuse">Substance Abuse</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mobilityEquipment"
                          checked={formData.medicalConditions.mobilityEquipment}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'mobilityEquipment', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="mobilityEquipment">Mobility Equipment</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="cognitiveIssues"
                          checked={formData.medicalConditions.cognitiveIssues}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'cognitiveIssues', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="cognitiveIssues">Cognitive Issues</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="recentHospitalization"
                          checked={formData.medicalConditions.recentHospitalization}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'recentHospitalization', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="recentHospitalization">Recent Hospitalization</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="nursingFacility"
                          checked={formData.medicalConditions.nursingFacility}
                          onCheckedChange={(checked) => handleNestedChange('medicalConditions', 'nursingFacility', !!checked)}
                          className={styles.checkbox}
                        />
                        <Label htmlFor="nursingFacility">Nursing Facility</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="medications" className="font-medium">
                      Medications
                    </Label>
                    <Textarea 
                      id="medications" 
                      value={formData.medications}
                      onChange={(e) => handleChange('medications', e.target.value)}
                      className={`${styles.input} ${errors.medications ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      data-error={errors.medications || undefined}
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
                  </div>
                </div>
              </div>

              {/* Agency information */}
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">AGENT/AGENCY INFORMATION</h3>
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