'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function TestHardcodedPage() {
  const params = useParams()
  
  // Hardcoded application data for testing
  const hardcodedApplication = {
    id: params.id || 'unknown-id',
    proposed_insured: 'Goria Vaca',
    carrier: 'AIG',
    product: 'SiwL',
    monthly_premium: '64.71',
    status: 'Approved',
    client_phone_number: '8322124859',
    client_state: 'TX',
    client_email: 'test@example.com'
  }
  
  return (
    <div className="p-8">
      <Link href="/manager/applications" className="text-blue-600 hover:underline mb-4 block">
        &larr; Back to Applications
      </Link>
      
      <h1 className="text-2xl font-bold mb-6">
        Hardcoded Test View - ID: {params.id}
      </h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Application Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Client:</strong> {hardcodedApplication.proposed_insured}</p>
            <p><strong>Carrier:</strong> {hardcodedApplication.carrier}</p>
            <p><strong>Product:</strong> {hardcodedApplication.product}</p>
          </div>
          <div>
            <p><strong>Monthly Premium:</strong> ${hardcodedApplication.monthly_premium}</p>
            <p><strong>Status:</strong> {hardcodedApplication.status}</p>
            <p><strong>Phone:</strong> {hardcodedApplication.client_phone_number}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold mb-2">URL Parameter Information</h2>
        <p><strong>Raw params:</strong> {JSON.stringify(params)}</p>
        <p className="mt-2"><strong>ID parameter:</strong> {Array.isArray(params.id) ? params.id[0] : params.id}</p>
      </div>
    </div>
  )
} 