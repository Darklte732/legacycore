'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useRole } from "@/hooks/useRole"
import { createClient } from "@/lib/supabase/client"
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { 
  Calendar, DollarSign, FileClock, Download, Filter, ChevronDown, Search, 
  ArrowUpDown, CheckCircle2, XCircle, AlertTriangle, Clock 
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface CommissionRecord {
  id: string
  carrier: string
  client_name: string
  policy_number: string
  product: string
  premium: number
  commission_amount: number
  commission_percentage: number
  commission_split_percentage: number
  payment_date: string
  status: string
  payout_date: string | null
  is_chargeback: boolean
  notes: string | null
}

const STATUSES = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  CHARGEBACK: "Chargeback",
}

export default function AgentCommissionsPage() {
  const { role, loading: roleLoading } = useRole()
  const [commissionData, setCommissionData] = useState<CommissionRecord[]>([])
  const [filteredData, setFilteredData] = useState<CommissionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month')
  const [carrierFilter, setCarrierFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({ 
    field: 'payment_date', 
    direction: 'desc' 
  })
  
  const supabase = createClient()

  // Stats summary
  const [stats, setStats] = useState({
    totalEarnings: 0,
    paidCommissions: 0,
    pendingCommissions: 0,
    chargebacks: 0,
    carrierBreakdown: [] as { name: string; value: number }[],
    monthlyTrend: [] as { month: string; amount: number }[],
  })
  
  // Calculate commission using the same logic as the dashboard for consistency
  const calculateCommission = (monthlyPremium: number, commissionSplitPercentage: number = 20) => {
    // Calculate annual premium
    const annualPremium = monthlyPremium * 12;
    
    // Calculate carrier's 9-month advance
    const nineMonthAdvance = monthlyPremium * 9;
    
    // Calculate agent's portion after upline split
    const agentCommission = nineMonthAdvance * (1 - (commissionSplitPercentage / 100));
    
    return agentCommission;
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Fetch commission data
  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to view your commission data');
        setLoading(false);
        return;
      }

      console.log('Fetching commission data for user:', session.user.id);
      
      // Get ALL applications data - this will be our primary source of truth
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('agent_applications')
        .select('*')
        .eq('agent_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (applicationsError) {
        console.error('Error fetching applications data:', applicationsError);
        setError('Failed to load applications data. Please try again later.');
        setLoading(false);
        return;
      }
      
      console.log(`Found ${applicationsData?.length || 0} applications`);
      
      // Get dedicated commissions data if available
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select('*, policy_id')
        .eq('agent_id', session.user.id)
        .order('payment_date', { ascending: false });
      
      if (commissionsError) {
        console.error('Error fetching commission data:', commissionsError);
      }
      
      console.log(`Found ${commissionsData?.length || 0} commission records`);
      
      let allCommissions: CommissionRecord[] = [];
      
      // Process applications to create commission records
      if (applicationsData && applicationsData.length > 0) {
        console.log('Processing applications to generate commission data');
        
        // Create a map of existing commission records by policy_id
        const existingCommissionsMap = new Map();
        if (commissionsData && commissionsData.length > 0) {
          commissionsData.forEach(comm => {
            if (comm.policy_id) {
              existingCommissionsMap.set(comm.policy_id, comm);
            }
          });
        }
        
        // Process each application
        applicationsData.forEach(app => {
          // Check if we should process this application based on status
          const isPaidOrIssued = app.status === 'Approved' || 
                               app.status === '1st Month Paid' || 
                               app.status === 'Live' || 
                               app.status === 'Paid';
          
          // Skip if not paid/issued
          if (!isPaidOrIssued && !app.is_chargeback) {
            return;
          }
          
          // If we have a dedicated commission record, use that
          const existingCommission = existingCommissionsMap.get(app.id);
          if (existingCommission) {
            allCommissions.push({
              id: existingCommission.id,
              carrier: app.carrier || existingCommission.carrier || 'Unknown Carrier',
              client_name: app.proposed_insured || existingCommission.client_name || 'Unknown Client',
              policy_number: app.policy_number || existingCommission.policy_number || '',
              product: app.product || existingCommission.product || 'Unknown Product',
              premium: Number(app.monthly_premium) || Number(existingCommission.premium) || 0,
              commission_amount: Math.abs(Number(existingCommission.amount)) || 0,
              commission_percentage: Number(app.commission_percentage) || 20,
              commission_split_percentage: Number(app.commission_split_percentage) || 20,
              payment_date: existingCommission.payment_date || app.effective_policy_date || app.created_at,
              status: existingCommission.status || (app.is_chargeback ? STATUSES.CHARGEBACK : (app.paid_status === 'Paid' ? STATUSES.PAID : STATUSES.PENDING)),
              payout_date: existingCommission.payout_date || app.effective_policy_date || null,
              is_chargeback: existingCommission.status === 'CLAWBACK' || app.is_chargeback || false,
              notes: existingCommission.notes || app.notes || null
            });
            return;
          }
          
          // Calculate commission amount based on monthly premium
          const monthlyPremium = Number(app.monthly_premium) || 0;
          const annualPremium = monthlyPremium * 12;
          
          // If no monthly premium, skip
          if (monthlyPremium <= 0) {
            return;
          }
          
          // Calculate commission amount using advanced formula
          // Typical commission is 9 month advance at around 100-110% of annual premium
          // Upline typically gets 20-30%
          const advanceMultiplier = 9; // 9 month advance
          const commissionRate = 1.05; // 105% of premium (typical for life insurance)
          const uplineSplitPercentage = Number(app.commission_split_percentage) || 20;
          
          // Calculate commission
          let commissionAmount = 0;
          
          // If we have explicit commission_amount, use that
          if (app.commission_amount && Number(app.commission_amount) > 0) {
            commissionAmount = Number(app.commission_amount);
          } else {
            // Otherwise calculate it
            const advanceAmount = monthlyPremium * advanceMultiplier;
            const grossCommission = advanceAmount * commissionRate;
            commissionAmount = grossCommission * (1 - (uplineSplitPercentage / 100));
          }
          
          // For chargebacks, use the same amount but mark as chargeback
          const isChargeback = app.is_chargeback || false;
          
          // Determine correct status
          let status = STATUSES.PENDING;
          if (isChargeback) {
            status = STATUSES.CHARGEBACK;
          } else if (app.paid_status === 'Paid' || app.status === 'Approved' || app.status === '1st Month Paid') {
            status = STATUSES.PAID;
          }
          
          // Create commission record
          allCommissions.push({
            id: `app-${app.id}`,
            carrier: app.carrier || 'Unknown Carrier',
            client_name: app.proposed_insured || 'Unknown Client',
            policy_number: app.policy_number || `POL-${app.id.substring(0, 6)}`,
            product: app.product || 'Unknown Product',
            premium: monthlyPremium,
            commission_amount: commissionAmount,
            commission_percentage: 100,
            commission_split_percentage: uplineSplitPercentage,
            payment_date: app.effective_policy_date || app.created_at,
            status: status,
            payout_date: status === STATUSES.PAID ? (app.effective_policy_date || app.created_at) : null,
            is_chargeback: isChargeback,
            notes: app.notes || (isChargeback ? 'Chargeback' : null)
          });
        });
      }
      
      // If we still have no commissions, add some sample data (only in development)
      if (allCommissions.length === 0 && process.env.NODE_ENV === 'development') {
        console.log('No commission data found, generating sample data for development');
        
        // Sample carriers
        const carriers = ['Americo', 'AIG', 'AMERICO'];
        
        // Sample products
        const products = ['Eagle Select', 'SWL Graded', 'Swl', 'Eagle 2', 'GWL'];
        
        // Generate 7 sample records
        for (let i = 0; i < 7; i++) {
          const carrier = carriers[Math.floor(Math.random() * carriers.length)];
          const product = products[Math.floor(Math.random() * products.length)];
          const premium = Math.floor(Math.random() * 100) + 30; // $30-$130
          const isChargeback = i === 4; // Make one chargeback record
          
          const today = new Date();
          const paymentDate = new Date(today);
          paymentDate.setDate(today.getDate() - (i * 10)); // Spread out over time
          
          allCommissions.push({
            id: `sample-${i}`,
            carrier,
            client_name: `Sample Client ${i + 1}`,
            policy_number: `POL-${100000 + i}`,
            product,
            premium,
            commission_amount: isChargeback ? 49 : Math.floor(premium * 9 * 0.8),
            commission_percentage: 100,
            commission_split_percentage: 20,
            payment_date: paymentDate.toISOString(),
            status: isChargeback ? STATUSES.CHARGEBACK : STATUSES.PAID,
            payout_date: isChargeback ? null : paymentDate.toISOString(),
            is_chargeback: isChargeback,
            notes: isChargeback ? 'Chargeback: Policy cancelled' : null
          });
        }
      }
      
      // Sort by payment date (most recent first)
      allCommissions.sort((a, b) => {
        return new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime();
      });
      
      setCommissionData(allCommissions);
      setFilteredData(allCommissions);
      
      // Calculate statistics
      const calculatedStats = calculateStats(allCommissions);
      setStats(calculatedStats);
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchCommissionData:', error);
      setError('Failed to load commission data. Please try again later.');
      setLoading(false);
    }
  };

  // Improved calculateStats function for more accurate metrics
  const calculateStats = (data: CommissionRecord[]) => {
    // Calculate summary statistics
    // Total earnings: Everything that isn't a chargeback
    const totalEarnings = data.reduce((sum, record) => 
      record.is_chargeback ? sum : sum + record.commission_amount, 0);
    
    // Paid commissions: Only records with PAID status
    const paidCommissions = data.reduce((sum, record) => 
      record.status === STATUSES.PAID ? sum + record.commission_amount : sum, 0);
    
    // Pending: Records with PENDING status
    const pendingCommissions = data.reduce((sum, record) => 
      record.status === STATUSES.PENDING ? sum + record.commission_amount : sum, 0);
    
    // Chargebacks: Only chargeback records
    const chargebacks = data.reduce((sum, record) => 
      record.is_chargeback ? sum + record.commission_amount : sum, 0);

    // Generate monthly trend data - last 12 months
    const monthlyTrend = [];
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate 12 months data starting from current month going backward
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthNames[monthDate.getMonth()];
      const monthYear = monthDate.getFullYear();
      const monthLabel = `${monthName} ${monthYear}`;
      
      // Calculate total for this month (exclude chargebacks)
      const monthTotal = data.reduce((sum, record) => {
        if (record.is_chargeback) return sum;
        
        const recordDate = new Date(record.payment_date);
        if (recordDate.getMonth() === monthDate.getMonth() && 
            recordDate.getFullYear() === monthDate.getFullYear()) {
          return sum + record.commission_amount;
        }
        return sum;
      }, 0);
      
      monthlyTrend.push({
        month: monthLabel,
        amount: Math.round(monthTotal)
      });
    }
    
    // Calculate carrier breakdown
    const carrierAmounts = new Map<string, number>();
    
    // Sum commission amounts by carrier (excluding chargebacks)
    data.forEach(record => {
      if (!record.is_chargeback) {
        const carrier = (record.carrier || 'Unknown').toUpperCase();
        const currentAmount = carrierAmounts.get(carrier) || 0;
        carrierAmounts.set(carrier, currentAmount + record.commission_amount);
      }
    });
    
    // Convert to array and calculate percentages
    const totalByCarrier = Array.from(carrierAmounts.entries()).map(([name, value]) => {
      // Convert uppercase carrier name to title case for display
      const displayName = name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      
      return {
        name: displayName,
        value: Math.round(value)
      };
    });
    
    // Sort by value (largest first)
    totalByCarrier.sort((a, b) => b.value - a.value);
    
    return {
      totalEarnings: Math.round(totalEarnings),
      paidCommissions: Math.round(paidCommissions),
      pendingCommissions: Math.round(pendingCommissions),
      chargebacks: Math.round(chargebacks),
      carrierBreakdown: totalByCarrier,
      monthlyTrend
    };
  };

  // Apply filters to the data
  const applyFilters = () => {
    let filtered = [...commissionData];
    
    // Apply time frame filter
    if (timeFrame !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (timeFrame) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }
      
      filtered = filtered.filter(record => {
        if (!record.payment_date) return false;
        const recordDate = new Date(record.payment_date);
        return recordDate >= startDate && recordDate <= now;
      });
    }
    
    // Apply carrier filter
    if (carrierFilter !== 'all') {
      filtered = filtered.filter(record => {
        const normalizedRecordCarrier = record.carrier.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        return normalizedRecordCarrier === carrierFilter;
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.client_name.toLowerCase().includes(query) ||
        record.policy_number.toLowerCase().includes(query) ||
        record.carrier.toLowerCase().includes(query) ||
        record.product.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any = a[sortBy.field as keyof CommissionRecord];
      let valueB: any = b[sortBy.field as keyof CommissionRecord];
      
      // Handle null values
      if (valueA === null) valueA = '';
      if (valueB === null) valueB = '';
      
      // For date fields, convert to Date objects
      if (sortBy.field.includes('date')) {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      }
      
      // For numeric fields, ensure they're numbers
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortBy.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // For string fields
      const comparison = String(valueA).localeCompare(String(valueB));
      return sortBy.direction === 'asc' ? comparison : -comparison;
    });
    
    setFilteredData(filtered);
  }

  // Toggle sort direction
  const toggleSort = (field: string) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }

  // Handle tab changes
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'all':
      case 'week':
      case 'month':
      case 'quarter':
      case 'year':
        setTimeFrame(value as any);
        break;
    }
  }

  // Run on component mount
  useEffect(() => {
    if (!roleLoading) {
      fetchCommissionData();
    }
  }, [roleLoading]);

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [timeFrame, carrierFilter, statusFilter, searchQuery, sortBy, commissionData]);

  // Get unique carriers for the filter dropdown
  const uniqueCarriers = Array.from(
    new Set(
      commissionData.map(record => {
        const carrier = record.carrier || 'Unknown';
        // Convert to title case for display consistency
        return carrier.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      })
    )
  ).sort();

  // Loading state
  if (loading || roleLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-600">Loading commission data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg font-medium mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  const CHART_MARGIN = { top: 20, right: 30, left: 20, bottom: 5 };

  return (
      <div className="space-y-8">
        {/* Commission Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <div className="text-blue-500 text-sm font-medium">Total Earnings</div>
              <div className="text-3xl font-bold">${Math.round(stats.totalEarnings).toLocaleString()}</div>
              <div className="text-gray-500 text-xs">After upline split</div>
              </div>
            </CardContent>
          </Card>
          
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <div className="text-green-600 text-sm font-medium">Paid Commissions</div>
              <div className="text-3xl font-bold">${Math.round(stats.paidCommissions).toLocaleString()}</div>
              <div className="text-gray-500 text-xs">Total paid amount</div>
              </div>
            </CardContent>
          </Card>
          
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <div className="text-amber-600 text-sm font-medium">Pending</div>
              <div className="text-3xl font-bold">${Math.round(stats.pendingCommissions).toLocaleString()}</div>
              <div className="text-gray-500 text-xs">Awaiting payment</div>
              </div>
            </CardContent>
          </Card>
          
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <div className="text-red-600 text-sm font-medium">Chargebacks</div>
              <div className="text-3xl font-bold">${Math.round(stats.chargebacks).toLocaleString()}</div>
              <div className="text-gray-500 text-xs">Total chargeback amount</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings Trend</CardTitle>
              <CardDescription>Your commission earnings over the last 12 months</CardDescription>
            </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.monthlyTrend}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Commission Amount']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#4f46e5" 
                    name="Commission Amount" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            </CardContent>
          </Card>
          
        <Card>
          <CardHeader>
            <CardTitle>Carrier Breakdown</CardTitle>
              <CardDescription>Commission distribution by carrier</CardDescription>
            </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.carrierBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stats.carrierBreakdown.map((entry, index) => {
                      // Custom color palette for carriers
                      const COLORS = ['#4f46e5', '#10b981', '#fbbf24', '#ef4444', '#06b6d4', '#8b5cf6'];
                      return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                    })}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom"
                    formatter={(value, entry, index) => {
                      // Format legend to show both carrier name and dollar amount
                      const record = stats.carrierBreakdown[index];
                      return `${value}: ${formatCurrency(record.value)}`;
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Commission Amount']}
                    itemStyle={{ color: '#374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Commission Records & Filters */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <CardTitle>Commission Records</CardTitle>
                <CardDescription className="mt-1">
                  {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'} found
                </CardDescription>
              </div>
              
              <div className="flex items-center mt-4 sm:mt-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search records..."
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="ml-2" onClick={() => setSearchQuery('')}>
                  <XCircle className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="ml-2" onClick={() => fetchCommissionData()}>
                  <FileClock className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {/* Filter Tabs & Dropdowns */}
          <div className="px-6 pt-6 pb-2 border-b">
            <div className="flex flex-col md:flex-row gap-4">
              <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="all">All Time</TabsTrigger>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="month">This Month</TabsTrigger>
                  <TabsTrigger value="quarter">This Quarter</TabsTrigger>
                  <TabsTrigger value="year">This Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="w-full sm:w-48">
                <Select value={carrierFilter} onValueChange={setCarrierFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Carriers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Carriers</SelectItem>
                    {uniqueCarriers.map(carrier => (
                      <SelectItem key={carrier} value={carrier}>{carrier}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value={STATUSES.PAID}>Paid</SelectItem>
                    <SelectItem value={STATUSES.PENDING}>Pending</SelectItem>
                    <SelectItem value={STATUSES.PROCESSING}>Processing</SelectItem>
                    <SelectItem value={STATUSES.CHARGEBACK}>Chargebacks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 flex justify-end">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
          
          {/* Commission Table */}
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">
                      <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => toggleSort('payment_date')}>
                        Date
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => toggleSort('client_name')}>
                        Client
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => toggleSort('carrier')}>
                        Carrier
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => toggleSort('product')}>
                        Product
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => toggleSort('premium')}>
                        Premium
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => toggleSort('commission_amount')}>
                        Commission
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => toggleSort('status')}>
                        Status
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => toggleSort('payout_date')}>
                        Payout Date
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map(record => (
                      <TableRow key={record.id} className={record.is_chargeback ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">{formatDate(record.payment_date)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{record.client_name}</div>
                          <div className="text-xs text-gray-500">#{record.policy_number}</div>
                        </TableCell>
                        <TableCell>{record.carrier}</TableCell>
                        <TableCell>{record.product}</TableCell>
                        <TableCell className="text-right">${record.premium}/mo</TableCell>
                        <TableCell className="text-right font-medium">
                          ${Math.round(record.commission_amount)}
                        </TableCell>
                        <TableCell>
                          <CommissionStatusBadge status={record.status} />
                        </TableCell>
                        <TableCell>{formatDate(record.payout_date)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No commission records found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t py-4 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {filteredData.length} of {commissionData.length} records
            </div>
            <div className="flex items-center">
              <Button variant="outline" size="sm" className="text-xs mr-2" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="text-xs" disabled>
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Commission Policies */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="text-slate-700">Commission Policies</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 prose prose-sm max-w-none">
            <p>
              Your commissions are calculated based on the following guidelines:
            </p>
            <ul>
              <li>
                <span className="font-medium">Final Expense Policies:</span> Carriers typically pay a 75-100% first-year commission on the annual premium, with renewal commissions ranging from 5-10% in subsequent years.
              </li>
              <li>
                <span className="font-medium">Term Life Insurance:</span> First-year commissions typically range from 50-90% of the first-year premium, with 2-5% renewals in subsequent years.
              </li>
              <li>
                <span className="font-medium">Whole Life Insurance:</span> First-year commissions generally range from 55-95% of the first-year premium, with renewals of 3-10% depending on the carrier and product.
              </li>
              <li>
                <span className="font-medium">Chargebacks:</span> If a client cancels their policy during the first 9-12 months, the carrier will typically request a full or pro-rated refund of the commission advanced.
              </li>
              <li>
                <span className="font-medium">Advance Commission:</span> Most carriers offer 9-month to 12-month advance commission options, subject to your contract terms and performance requirements.
              </li>
              <li>
                <span className="font-medium">Payment Timeline:</span> Commissions are typically processed within 7-14 days after policy issuance and receipt of the first premium payment.
              </li>
            </ul>
            <p>
              For specific questions about your commission structure or payment schedules for specific carriers, please contact your manager or review your carrier contract terms.
            </p>
          </CardContent>
        </Card>
      </div>
  )
}

// Commission Status Badge Component
interface CommissionStatusBadgeProps {
  status: string;
}

const CommissionStatusBadge: React.FC<CommissionStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case STATUSES.PAID:
      return <Badge className="bg-green-100 text-green-800 border border-green-200 hover:bg-green-100">Paid</Badge>;
    case STATUSES.PENDING:
      return <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-100">Pending</Badge>;
    case STATUSES.PROCESSING:
      return <Badge className="bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100">Processing</Badge>;
    case STATUSES.CHARGEBACK:
      return <Badge className="bg-red-100 text-red-800 border border-red-200 hover:bg-red-100">Chargeback</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-100">{status}</Badge>;
  }
}; 