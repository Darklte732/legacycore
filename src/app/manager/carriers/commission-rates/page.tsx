'use client'

import React, { useState, useEffect } from 'react'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, Search, Info, ArrowUpDown, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge' 
import { useToast } from '@/components/ui/use-toast'

export default function ManagerCommissionRates() {
  const { role, loading: roleLoading } = useRole()
  const supabase = createClient()
  const { toast } = useToast()
  const [rates, setRates] = useState([])
  const [carriers, setCarriers] = useState([])
  const [productTypes, setProductTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCarrier, setFilterCarrier] = useState('all')
  const [filterProductType, setFilterProductType] = useState('all')
  const [sortField, setSortField] = useState('carrier')
  const [sortDirection, setSortDirection] = useState('asc')

  // Load commission rates on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch commission rates - managers can only view, not edit
        const { data: ratesData, error: ratesError } = await supabase
          .from('carrier_commission_rates')
          .select('*')
          .order('carrier', { ascending: true })
          .order('product_type', { ascending: true })
          .order('policy_year', { ascending: true })
        
        if (ratesError) throw ratesError
        setRates(ratesData || [])
        
        // Extract unique carriers and product types
        const uniqueCarriers = Array.from(new Set(ratesData?.map(r => r.carrier) || []))
        const uniqueProductTypes = Array.from(new Set(ratesData?.map(r => r.product_type) || []))
        
        setCarriers(uniqueCarriers)
        setProductTypes(uniqueProductTypes)
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

  // Filter rates based on search and filter criteria
  const filteredRates = rates.filter(rate => {
    // Apply carrier filter
    if (filterCarrier && filterCarrier !== 'all' && rate.carrier !== filterCarrier) {
      return false
    }
    
    // Apply product type filter
    if (filterProductType && filterProductType !== 'all' && rate.product_type !== filterProductType) {
      return false
    }
    
    // Apply search term
    if (searchTerm && !rate.carrier.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !rate.product_type.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    return true
  })

  // Sort rates based on field and direction
  const sortedRates = [...filteredRates].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1
    
    if (sortField === 'carrier') {
      return dir * a.carrier.localeCompare(b.carrier)
    } else if (sortField === 'product_type') {
      return dir * a.product_type.localeCompare(b.product_type)
    } else if (sortField === 'policy_year') {
      return dir * (a.policy_year - b.policy_year)
    } else if (sortField === 'rate_percentage') {
      return dir * (a.rate_percentage - b.rate_percentage)
    }
    
    return 0
  })

  // Handle sort request
  const requestSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Format percentage display
  const formatPercentage = (value) => {
    return `${value}%`
  }

  // Format currency display
  const formatCurrency = (value) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (roleLoading || loading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-indigo-800">
            <DollarSign className="h-8 w-8 text-indigo-600" />
            Commission Rates
          </h1>
          <p className="text-gray-600 mt-1">
            View and compare commission rates across carriers
          </p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-200">
            Manager View
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-indigo-600 hover:bg-indigo-50">
                  <Info className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="max-w-xs">
                  Managers can view commission rates but cannot edit them. Contact admin for changes.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Commission Rate Finder */}
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
          <CardTitle className="text-xl">Find Commission Rates</CardTitle>
          <CardDescription className="text-indigo-100">
            Search for specific commission rates by carrier, product, or policy year
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search carriers or products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            
            <Select
              value={filterCarrier}
              onValueChange={setFilterCarrier}
            >
              <SelectTrigger className="w-full md:w-1/3 rounded-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <SelectValue placeholder="Filter by Carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Carriers</SelectItem>
                {carriers.map((carrier) => (
                  <SelectItem key={carrier} value={carrier}>
                    {carrier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filterProductType}
              onValueChange={setFilterProductType}
            >
              <SelectTrigger className="w-full md:w-1/3 rounded-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <SelectValue placeholder="Filter by Product Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Product Types</SelectItem>
                {productTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {filterCarrier !== 'all' || filterProductType !== 'all' || searchTerm ? (
            <div className="mt-4 flex items-center">
              <Filter className="h-4 w-4 mr-2 text-indigo-500" />
              <span className="text-sm text-gray-600">
                Showing filtered results
                {filterCarrier !== 'all' && ` for ${filterCarrier}`}
                {filterProductType !== 'all' && ` in ${filterProductType}`}
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-xs text-indigo-600 hover:text-indigo-800"
                onClick={() => {
                  setFilterCarrier('all')
                  setFilterProductType('all')
                  setSearchTerm('')
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
      
      {/* Commission Rate Table */}
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Commission Rates</CardTitle>
            <span className="text-sm text-gray-500">{sortedRates.length} rates found</span>
          </div>
          <Separator className="my-2" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('carrier')}
                  >
                    <div className="flex items-center">
                      Carrier
                      <ArrowUpDown className={`ml-2 h-4 w-4 text-gray-400 ${sortField === 'carrier' ? 'text-indigo-600' : ''}`} />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('product_type')}
                  >
                    <div className="flex items-center">
                      Product Type
                      <ArrowUpDown className={`ml-2 h-4 w-4 text-gray-400 ${sortField === 'product_type' ? 'text-indigo-600' : ''}`} />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 text-center"
                    onClick={() => requestSort('policy_year')}
                  >
                    <div className="flex items-center justify-center">
                      Year
                      <ArrowUpDown className={`ml-2 h-4 w-4 text-gray-400 ${sortField === 'policy_year' ? 'text-indigo-600' : ''}`} />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 text-center"
                    onClick={() => requestSort('rate_percentage')}
                  >
                    <div className="flex items-center justify-center">
                      Rate
                      <ArrowUpDown className={`ml-2 h-4 w-4 text-gray-400 ${sortField === 'rate_percentage' ? 'text-indigo-600' : ''}`} />
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Face Amount Range</TableHead>
                  <TableHead className="hidden md:table-cell">Effective Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center">
                        <Info className="h-10 w-10 text-gray-300 mb-2" />
                        <p>No commission rates found. Try adjusting your filters.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          onClick={() => {
                            setFilterCarrier('all')
                            setFilterProductType('all')
                            setSearchTerm('')
                          }}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRates.map((rate) => (
                    <TableRow key={rate.id} className="hover:bg-indigo-50/50">
                      <TableCell className="font-medium">{rate.carrier}</TableCell>
                      <TableCell>{rate.product_type}</TableCell>
                      <TableCell className="text-center">{rate.policy_year}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 font-semibold">
                          {formatPercentage(rate.rate_percentage)}
                        </Badge>
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="py-4 px-6 text-sm text-gray-500 flex items-center border-t">
            <Info className="h-4 w-4 mr-2 text-indigo-400" />
            <span>Contact your administrator if you need to update commission rates.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 