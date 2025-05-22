'use client'

import { useParams } from 'next/navigation'

export default function TestParamPage() {
  const params = useParams()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">URL Parameter Test</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p>Raw params: {JSON.stringify(params)}</p>
        <p className="mt-4">ID parameter: {Array.isArray(params.id) ? params.id[0] : params.id}</p>
      </div>
    </div>
  )
} 