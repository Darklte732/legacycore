'use client'

import React, { useState } from 'react'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Edit, 
  Trash2, 
  Search, 
  ArrowUpDown,
  Filter
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CommissionRate {
  id: string
  carrier: string
  product_type: string
  policy_year: number
  rate_percentage: number
  min_face_amount: number | null
  max_face_amount: number | null
  effective_date: string
  expiration_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface CommissionRatesTableProps {
  data: CommissionRate[]
  onEdit: (rate: CommissionRate) => void
  onDelete: (id: string) => void
}

export function CommissionRatesTable({ 
  data, 
  onEdit, 
  onDelete 
}: CommissionRatesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCarrier, setFilterCarrier] = useState<string | null>(null)
  const [filterProductType, setFilterProductType] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CommissionRate,
    direction: 'ascending' | 'descending'
  }>({
    key: 'carrier',
    direction: 'ascending'
  })

  // Extract unique carriers and product types for filters
  const uniqueCarriers = Array.from(new Set(data.map(rate => rate.carrier)))
  const uniqueProductTypes = Array.from(new Set(data.map(rate => rate.product_type)))

  // Handler for sorting
  const requestSort = (key: keyof CommissionRate) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  // Sort and filter data
  const sortedAndFilteredData = [...data]
    .filter(rate => {
      // Apply carrier filter
      if (filterCarrier && rate.carrier !== filterCarrier) {
        return false
      }
      
      // Apply product type filter
      if (filterProductType && rate.product_type !== filterProductType) {
        return false
      }
      
      // Apply search term
      if (searchTerm && !rate.carrier.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !rate.product_type.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      const key = sortConfig.key
      
      // Handle string comparison
      if (typeof a[key] === 'string' && typeof b[key] === 'string') {
        return sortConfig.direction === 'ascending'
          ? (a[key] as string).localeCompare(b[key] as string)
          : (b[key] as string).localeCompare(a[key] as string)
      }
      
      // Handle number comparison
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return sortConfig.direction === 'ascending'
          ? (a[key] as number) - (b[key] as number)
          : (b[key] as number) - (a[key] as number)
      }
      
      // Handle dates
      if (key === 'effective_date' || key === 'expiration_date') {
        const dateA = a[key] ? new Date(a[key] as string).getTime() : 0
        const dateB = b[key] ? new Date(b[key] as string).getTime() : 0
        return sortConfig.direction === 'ascending'
          ? dateA - dateB
          : dateB - dateA
      }
      
      return 0
    })

  // Format percentage display
  const formatPercentage = (value: number) => {
    return `${value}%`
  }

  // Format currency display
  const formatCurrency = (value: number | null) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  // Format date display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search carriers or products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select
            value={filterCarrier || ''}
            onValueChange={(value) => setFilterCarrier(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Carrier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Carriers</SelectItem>
              {uniqueCarriers.map((carrier) => (
                <SelectItem key={carrier} value={carrier}>
                  {carrier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filterProductType || ''}
            onValueChange={(value) => setFilterProductType(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Products</SelectItem>
              {uniqueProductTypes.map((productType) => (
                <SelectItem key={productType} value={productType}>
                  {productType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => requestSort('carrier')}
                >
                  Carrier
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => requestSort('product_type')}
                >
                  Product Type
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div 
                  className="flex items-center cursor-pointer justify-center"
                  onClick={() => requestSort('policy_year')}
                >
                  Year
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div 
                  className="flex items-center cursor-pointer justify-center"
                  onClick={() => requestSort('rate_percentage')}
                >
                  Rate
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">Face Amount Range</TableHead>
              <TableHead className="hidden md:table-cell">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => requestSort('effective_date')}
                >
                  Effective Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No commission rates found.
                </TableCell>
              </TableRow>
            ) : (
              sortedAndFilteredData.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{rate.carrier}</TableCell>
                  <TableCell>{rate.product_type}</TableCell>
                  <TableCell className="text-center">{rate.policy_year}</TableCell>
                  <TableCell className="text-center font-semibold text-blue-600">
                    {formatPercentage(rate.rate_percentage)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {rate.min_face_amount && rate.max_face_amount ? (
                      `${formatCurrency(rate.min_face_amount)} - ${formatCurrency(rate.max_face_amount)}`
                    ) : rate.min_face_amount ? (
                      `Min: ${formatCurrency(rate.min_face_amount)}`
                    ) : rate.max_face_amount ? (
                      `Max: ${formatCurrency(rate.max_face_amount)}`
                    ) : (
                      'All amounts'
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(rate.effective_date)}
                    {rate.expiration_date && ` to ${formatDate(rate.expiration_date)}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onEdit(rate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDelete(rate.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 