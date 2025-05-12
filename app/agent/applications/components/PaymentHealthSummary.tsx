'use client'

import { useState, useEffect } from 'react'
import { AgentApplication } from '@/types/application'
import { getPaymentHealth } from '../utils'
import { PaymentLegend } from './PaymentComponents'

interface PaymentHealthSummaryProps {
  applications: AgentApplication[]
}

export const PaymentHealthSummary = ({ applications }: PaymentHealthSummaryProps) => {
  const [stats, setStats] = useState({
    critical: 0,
    warning: 0,
    good: 0,
    neutral: 0
  })

  useEffect(() => {
    // Calculate payment health statistics
    const newStats = {
      critical: 0,
      warning: 0,
      good: 0,
      neutral: 0
    }

    applications.forEach(app => {
      const health = getPaymentHealth(app)
      newStats[health as keyof typeof newStats]++
    })

    setStats(newStats)
  }, [applications])

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-3">Payment Health Overview</h3>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-sm text-red-600">Critical</div>
          <div className="text-xs text-gray-500">Multiple missed payments</div>
        </div>
        
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
          <div className="text-sm text-yellow-600">Warning</div>
          <div className="text-xs text-gray-500">One missed payment</div>
        </div>
        
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="text-2xl font-bold text-green-600">{stats.good}</div>
          <div className="text-sm text-green-600">Good</div>
          <div className="text-xs text-gray-500">On-time payments</div>
        </div>
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-2xl font-bold text-blue-600">{stats.neutral}</div>
          <div className="text-sm text-blue-600">Neutral</div>
          <div className="text-xs text-gray-500">No payment history</div>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-2">Payment Legend:</div>
      <PaymentLegend />
    </div>
  )
} 