'use client'

import React, { useState, useEffect } from 'react'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, Search, Info, ArrowUpDown, Filter, TrendingUp } from 'lucide-react'
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

export default function AgentCommissionRates() {
  const { role, loading: roleLoading } = useRole()
  const supabase = createClient()
  const { toast } = useToast()
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCarrier, setSelectedCarrier] = useState('all')
  const [selectedProductType, setSelectedProductType] = useState('all')
  const [carriers, setCarriers] = useState([])
  const [productTypes, setProductTypes] = useState([])
  
  // Handle sorting
  const [sortField, setSortField] = useState('rate_percentage')
  const [sortDirection, setSortDirection] = useState('desc') // Default to highest commission first

  // Load commission rates on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch active commission rates
        const { data: ratesData, error: ratesError } = await supabase
          .from('carrier_commission_rates')
          .select('*')
          .is('expiration_date', null) // Only show active rates
          .order('rate_percentage', { ascending: false }) // Default to highest commission first
        
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
          title: 'Error loading commission rates',
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
    if (selectedCarrier && selectedCarrier !== 'all' && rate.carrier !== selectedCarrier) {
      return false
    }
    
    // Apply product type filter
    if (selectedProductType && selectedProductType !== 'all' && rate.product_type !== selectedProductType) {
      return false
    }
    
    // Apply search term
    if (searchTerm && !rate.carrier.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !rate.product_type.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    return true
  });

  // Apply sorting
  const sortedRates = [...filteredRates].sort((a, b) => {
    if (sortField === 'rate_percentage') {
      return sortDirection === 'asc' 
        ? a.rate_percentage - b.rate_percentage
        : b.rate_percentage - a.rate_percentage;
    } else if (sortField === 'carrier') {
      return sortDirection === 'asc'
        ? a.carrier.localeCompare(b.carrier)
        : b.carrier.localeCompare(a.carrier);
    } else if (sortField === 'product_type') {
      return sortDirection === 'asc'
        ? a.product_type.localeCompare(b.product_type)
        : b.product_type.localeCompare(a.product_type);
    } else if (sortField === 'policy_year') {
      return sortDirection === 'asc'
        ? a.policy_year - b.policy_year
        : b.policy_year - a.policy_year;
    }
    return 0;
  });

  // Handle sort request
  const requestSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'rate_percentage' ? 'desc' : 'asc');
    }
  };

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

  if (roleLoading || loading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  }

  // Find the highest commission rate
  const highestRate = [...rates].sort((a, b) => b.rate_percentage - a.rate_percentage)[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-green-800">
            <DollarSign className="h-8 w-8 text-green-600" />
            Top Commission Rates
          </h1>
          <p className="text-gray-600 mt-1">
            Find the most profitable opportunities for your clients
          </p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-200">
            Agent View
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50">
                  <Info className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="max-w-xs">
                  These rates show first-year commissions. Results are sorted by highest rate by default.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Top Commission Rate Highlight */}
      {highestRate && (
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Highest Commission Opportunity
            </CardTitle>
            <CardDescription>
              Maximize your earnings with this top commission rate
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
              <div>
                <span className="text-sm text-gray-500">Carrier</span>
                <p className="font-semibold text-lg">{highestRate.carrier}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Product</span>
                <p className="font-semibold">{highestRate.product_type}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Policy Year</span>
                <p className="font-semibold text-center">{highestRate.policy_year}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Commission Rate</span>
                <p className="font-bold text-center text-2xl text-green-600">
                  {formatPercentage(highestRate.rate_percentage)}
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Commission Rate Finder */}
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardTitle className="text-xl">Find Commission Rates</CardTitle>
          <CardDescription className="text-green-100">
            Search for specific commission rates by carrier or product type
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
                className="pl-9 rounded-full border-gray-300 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
            </div>
            
            <Select
              value={selectedCarrier}
              onValueChange={setSelectedCarrier}
            >
              <SelectTrigger className="w-full md:w-1/3 rounded-full border-gray-300 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50">
                <SelectValue placeholder="All Carriers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Carriers</SelectItem>
                {carriers.map(carrier => (
                  <SelectItem key={carrier} value={carrier}>{carrier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedProductType}
              onValueChange={setSelectedProductType}
            >
              <SelectTrigger className="w-full md:w-1/3 rounded-full border-gray-300 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50">
                <SelectValue placeholder="All Product Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Product Types</SelectItem>
                {productTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedCarrier !== 'all' || selectedProductType !== 'all' || searchTerm ? (
            <div className="mt-4 flex items-center">
              <Filter className="h-4 w-4 mr-2 text-green-500" />
              <span className="text-sm text-gray-600">
                Showing filtered results
                {selectedCarrier !== 'all' && ` for ${selectedCarrier}`}
                {selectedProductType !== 'all' && ` in ${selectedProductType}`}
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-xs text-green-600 hover:text-green-800"
                onClick={() => {
                  setSelectedCarrier('all')
                  setSelectedProductType('all')
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
            <CardTitle className="text-xl">Available Commission Rates</CardTitle>
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
                      <ArrowUpDown className={`ml-2 h-4 w-4 text-gray-400 ${sortField === 'carrier' ? 'text-green-600' : ''}`} />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('product_type')}
                  >
                    <div className="flex items-center">
                      Product
                      <ArrowUpDown className={`ml-2 h-4 w-4 text-gray-400 ${sortField === 'product_type' ? 'text-green-600' : ''}`} />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 text-center"
                    onClick={() => requestSort('policy_year')}
                  >
                    <div className="flex items-center justify-center">
                      Year
                      <ArrowUpDown className={`ml-2 h-4 w-4 text-gray-400 ${sortField === 'policy_year' ? 'text-green-600' : ''}`} />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 text-center"
                    onClick={() => requestSort('rate_percentage')}
                  >
                    <div className="flex items-center justify-center">
                      Commission Rate
                      <ArrowUpDown className={`ml-2 h-4 w-4 text-gray-400 ${sortField === 'rate_percentage' ? 'text-green-600' : ''}`} />
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Min Face Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center">
                        <Info className="h-10 w-10 text-gray-300 mb-2" />
                        <p>No commission rates found. Try adjusting your filters.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4 text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => {
                            setSelectedCarrier('all')
                            setSelectedProductType('all')
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
                    <TableRow key={rate.id} className="hover:bg-green-50/50">
                      <TableCell className="font-medium">{rate.carrier}</TableCell>
                      <TableCell>{rate.product_type}</TableCell>
                      <TableCell className="text-center">{rate.policy_year}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${
                          rate.rate_percentage >= 90 ? 'bg-green-100 text-green-800' : 
                          rate.rate_percentage >= 70 ? 'bg-emerald-100 text-emerald-800' : 
                          'bg-gray-100 text-gray-800'
                        } hover:bg-opacity-80 font-semibold`}>
                          {formatPercentage(rate.rate_percentage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {rate.min_face_amount ? formatCurrency(rate.min_face_amount) : 'No minimum'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="py-4 px-6 text-sm text-gray-500 flex items-center border-t">
            <Info className="h-4 w-4 mr-2 text-green-400" />
            <span>Commission rates are subject to change and may vary based on qualifications and other factors.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 