'use client'

import React from 'react'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { 
  BarChart2, Users, Settings, Activity, Layers, 
  Bell, RefreshCw, Filter, Calendar, ArrowUpRight,
  ShieldAlert, FileText, Plus, Clock, CheckCircle,
  XCircle, AlertTriangle, ChevronDown, X
} from 'lucide-react'
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, 
  Pie, Cell, Legend 
} from 'recharts'

export default function AdminDashboard() {
  const { role, loading: roleLoading } = useRole()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeManagers: 0, 
    activeAgents: 0,
    totalApplications: 0
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('all')
  const [timeRangeDropdownOpen, setTimeRangeDropdownOpen] = useState(false)
  const [recentActivities, setRecentActivities] = useState([])
  const [userGrowthData, setUserGrowthData] = useState([])
  const [applicationData, setApplicationData] = useState([])
  const [userRoleData, setUserRoleData] = useState([])
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New user registration', read: false },
    { id: 2, message: 'System update scheduled', read: false },
    { id: 3, message: 'Application pending review', read: false }
  ])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  
  const timeRangeRef = useRef(null)
  const notificationsRef = useRef(null)
  const supabase = createClient()

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  // Function to format date to month name
  const getMonthName = (date) => {
    return new Date(date).toLocaleString('default', { month: 'short' })
  }

  // Calculate date range based on selected timeRange
  const getDateRangeFromTimeRange = () => {
    const now = new Date()
    let startDate = new Date(2000, 0, 1) // Default to a very old date (all-time)

    if (timeRange === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (timeRange === 'week') {
      const dayOfWeek = now.getDay()
      startDate = new Date(now)
      startDate.setDate(now.getDate() - dayOfWeek)
    } else if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (timeRange === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1)
    }

    return { startDate, endDate: now }
  }

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeRangeRef.current && !timeRangeRef.current.contains(event.target)) {
        setTimeRangeDropdownOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { startDate, endDate } = getDateRangeFromTimeRange()
        
        // Fetch total users and their roles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          
        if (profilesError) throw profilesError
        
        if (profilesData) {
          // Filter profiles based on time range
          const filteredProfiles = timeRange === 'all' 
            ? profilesData 
            : profilesData.filter(user => {
                const userDate = new Date(user.created_at)
                return userDate >= startDate && userDate <= endDate
              })
          
          const totalUsers = filteredProfiles.length
          const activeManagers = filteredProfiles.filter(user => user.role === 'manager').length
          const activeAgents = filteredProfiles.filter(user => user.role === 'agent').length
          const supportUsers = filteredProfiles.filter(user => user.role === 'support' || user.role === 'customer_support').length
          const adminUsers = filteredProfiles.filter(user => user.role === 'admin').length
          
          // Update stats
          setStats({
            totalUsers,
            activeManagers,
            activeAgents,
            totalApplications: 0 // Will be updated later
          })
          
          // Update user role data for pie chart
          setUserRoleData([
            { name: 'Agents', value: activeAgents || 0 },
            { name: 'Managers', value: activeManagers || 0 },
            { name: 'Admins', value: adminUsers || 0 },
            { name: 'Support', value: supportUsers || 0 }
          ].filter(item => item.value > 0))

          // Fetch user growth data (users grouped by month)
          const usersByMonth = {}
          
          profilesData.forEach(user => {
            if (user.created_at) {
              const userDate = new Date(user.created_at)
              if (userDate >= startDate && userDate <= endDate) {
                const monthYear = getMonthName(user.created_at)
                usersByMonth[monthYear] = (usersByMonth[monthYear] || 0) + 1
              }
            }
          })

          const growthData = Object.entries(usersByMonth)
            .map(([name, users]) => ({ name, users }))
            .sort((a, b) => {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              return months.indexOf(a.name) - months.indexOf(b.name)
            })
          
          setUserGrowthData(growthData.length > 0 ? growthData : [
            { name: 'Jan', users: 0 },
            { name: 'Feb', users: 0 },
            { name: 'Mar', users: 0 }
          ])
        }

        // Fetch applications data
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('*')
          
        if (applicationsError) throw applicationsError
        
        if (applicationsData) {
          // Filter applications based on time range
          const filteredApplications = timeRange === 'all' 
            ? applicationsData 
            : applicationsData.filter(app => {
                const appDate = new Date(app.created_at)
                return appDate >= startDate && appDate <= endDate
              })
          
          // Update total applications stat
          setStats(prevStats => ({
            ...prevStats,
            totalApplications: filteredApplications.length
          }))
          
          // Group applications by month for chart
          const appsByMonth = {}
          
          filteredApplications.forEach(application => {
            if (application.created_at) {
              const monthYear = getMonthName(application.created_at)
              appsByMonth[monthYear] = (appsByMonth[monthYear] || 0) + 1
            }
          })

          const applicationsChartData = Object.entries(appsByMonth)
            .map(([name, applications]) => ({ name, applications }))
            .sort((a, b) => {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              return months.indexOf(a.name) - months.indexOf(b.name)
            })
          
          setApplicationData(applicationsChartData.length > 0 ? applicationsChartData : [
            { name: 'Jan', applications: 0 },
            { name: 'Feb', applications: 0 },
            { name: 'Mar', applications: 0 }
          ])
        }

        // Fetch recent activities (combine multiple sources)
        const recentActivitiesArray = []
        let activityId = 1

        // 1. Recent user registrations
        const { data: recentUsers, error: recentUsersError } = await supabase
          .from('profiles')
          .select('id, full_name, role, created_at')
          .order('created_at', { ascending: false })
          .limit(3)
          
        if (!recentUsersError && recentUsers) {
          recentUsers.forEach(user => {
            const timeDiff = new Date() - new Date(user.created_at)
            let timeAgo = 'recently'
            
            if (timeDiff < 3600000) {
              timeAgo = `${Math.floor(timeDiff / 60000)} minutes ago`
            } else if (timeDiff < 86400000) {
              timeAgo = `${Math.floor(timeDiff / 3600000)} hours ago`
            } else {
              timeAgo = `${Math.floor(timeDiff / 86400000)} days ago`
            }
            
            recentActivitiesArray.push({
              id: activityId++,
              type: 'new_user',
              message: `New ${user.role || 'user'} joined the platform`,
              timestamp: timeAgo,
              user: user.full_name || `User ${user.id.substring(0, 8)}`,
              icon: <Users className="h-4 w-4 text-blue-500" />
            })
          })
        }

        // 2. Recent applications
        const { data: recentApplications, error: recentApplicationsError } = await supabase
          .from('applications')
          .select('id, agent_id, status, created_at, profiles:agent_id(full_name)')
          .order('created_at', { ascending: false })
          .limit(5)
          
        if (!recentApplicationsError && recentApplications) {
          recentApplications.forEach(app => {
            const timeDiff = new Date() - new Date(app.created_at)
            let timeAgo = 'recently'
            
            if (timeDiff < 3600000) {
              timeAgo = `${Math.floor(timeDiff / 60000)} minutes ago`
            } else if (timeDiff < 86400000) {
              timeAgo = `${Math.floor(timeDiff / 3600000)} hours ago`
            } else {
              timeAgo = `${Math.floor(timeDiff / 86400000)} days ago`
            }
            
            let icon = <FileText className="h-4 w-4 text-green-500" />
            let message = 'Application submitted'
            
            if (app.status === 'approved') {
              icon = <CheckCircle className="h-4 w-4 text-green-500" />
              message = 'Application approved'
            } else if (app.status === 'rejected') {
              icon = <XCircle className="h-4 w-4 text-red-500" />
              message = 'Application rejected'
            } else if (app.status === 'pending') {
              icon = <Clock className="h-4 w-4 text-amber-500" />
              message = 'Application pending'
            }
            
            recentActivitiesArray.push({
              id: activityId++,
              type: 'application',
              message: message,
              timestamp: timeAgo,
              user: app.profiles?.full_name || `Agent ${app.agent_id.substring(0, 8)}`,
              icon: icon
            })
          })
        }

        // Sort activities by recency
        recentActivitiesArray.sort((a, b) => {
          const timeA = a.timestamp.includes('minutes') ? 1 : 
                        a.timestamp.includes('hours') ? 2 : 
                        a.timestamp.includes('days') ? 3 : 4
          const timeB = b.timestamp.includes('minutes') ? 1 : 
                        b.timestamp.includes('hours') ? 2 : 
                        b.timestamp.includes('days') ? 3 : 4
          
          return timeA - timeB
        })
        
        setRecentActivities(recentActivitiesArray.slice(0, 5))

      } catch (error) {
        console.error('Error fetching admin dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (role === 'admin') {
      fetchDashboardData()
    }
  }, [supabase, role, timeRange])

  const handleRefresh = async () => {
    setLoading(true)
    if (role === 'admin') {
      try {
        const { startDate, endDate } = getDateRangeFromTimeRange()
        
        // Fetch total users and their roles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          
        if (profilesError) throw profilesError
        
        if (profilesData) {
          // Filter profiles based on time range
          const filteredProfiles = timeRange === 'all' 
            ? profilesData 
            : profilesData.filter(user => {
                const userDate = new Date(user.created_at)
                return userDate >= startDate && userDate <= endDate
              })
          
          const totalUsers = filteredProfiles.length
          const activeManagers = filteredProfiles.filter(user => user.role === 'manager').length
          const activeAgents = filteredProfiles.filter(user => user.role === 'agent').length
          const supportUsers = filteredProfiles.filter(user => user.role === 'support' || user.role === 'customer_support').length
          const adminUsers = filteredProfiles.filter(user => user.role === 'admin').length
          
          // Update stats
          setStats({
            totalUsers,
            activeManagers,
            activeAgents,
            totalApplications: 0 // Will be updated later
          })
          
          // Update user role data for pie chart
          setUserRoleData([
            { name: 'Agents', value: activeAgents || 0 },
            { name: 'Managers', value: activeManagers || 0 },
            { name: 'Admins', value: adminUsers || 0 },
            { name: 'Support', value: supportUsers || 0 }
          ].filter(item => item.value > 0))

          // Fetch user growth data (users grouped by month)
          const usersByMonth = {}
          
          profilesData.forEach(user => {
            if (user.created_at) {
              const userDate = new Date(user.created_at)
              if (userDate >= startDate && userDate <= endDate) {
                const monthYear = getMonthName(user.created_at)
                usersByMonth[monthYear] = (usersByMonth[monthYear] || 0) + 1
              }
            }
          })

          const growthData = Object.entries(usersByMonth)
            .map(([name, users]) => ({ name, users }))
            .sort((a, b) => {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              return months.indexOf(a.name) - months.indexOf(b.name)
            })
          
          setUserGrowthData(growthData.length > 0 ? growthData : [
            { name: 'Jan', users: 0 },
            { name: 'Feb', users: 0 },
            { name: 'Mar', users: 0 }
          ])
        }

        // Fetch applications data
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('*')
          
        if (applicationsError) throw applicationsError
        
        if (applicationsData) {
          // Filter applications based on time range
          const filteredApplications = timeRange === 'all' 
            ? applicationsData 
            : applicationsData.filter(app => {
                const appDate = new Date(app.created_at)
                return appDate >= startDate && appDate <= endDate
              })
          
          // Update total applications stat
          setStats(prevStats => ({
            ...prevStats,
            totalApplications: filteredApplications.length
          }))
          
          // Group applications by month for chart
          const appsByMonth = {}
          
          filteredApplications.forEach(application => {
            if (application.created_at) {
              const monthYear = getMonthName(application.created_at)
              appsByMonth[monthYear] = (appsByMonth[monthYear] || 0) + 1
            }
          })

          const applicationsChartData = Object.entries(appsByMonth)
            .map(([name, applications]) => ({ name, applications }))
            .sort((a, b) => {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              return months.indexOf(a.name) - months.indexOf(b.name)
            })
          
          setApplicationData(applicationsChartData.length > 0 ? applicationsChartData : [
            { name: 'Jan', applications: 0 },
            { name: 'Feb', applications: 0 },
            { name: 'Mar', applications: 0 }
          ])
        }

        // Fetch recent activities (combine multiple sources)
        const recentActivitiesArray = []
        let activityId = 1

        // 1. Recent user registrations
        const { data: recentUsers, error: recentUsersError } = await supabase
          .from('profiles')
          .select('id, full_name, role, created_at')
          .order('created_at', { ascending: false })
          .limit(3)
          
        if (!recentUsersError && recentUsers) {
          recentUsers.forEach(user => {
            const timeDiff = new Date() - new Date(user.created_at)
            let timeAgo = 'recently'
            
            if (timeDiff < 3600000) {
              timeAgo = `${Math.floor(timeDiff / 60000)} minutes ago`
            } else if (timeDiff < 86400000) {
              timeAgo = `${Math.floor(timeDiff / 3600000)} hours ago`
            } else {
              timeAgo = `${Math.floor(timeDiff / 86400000)} days ago`
            }
            
            recentActivitiesArray.push({
              id: activityId++,
              type: 'new_user',
              message: `New ${user.role || 'user'} joined the platform`,
              timestamp: timeAgo,
              user: user.full_name || `User ${user.id.substring(0, 8)}`,
              icon: <Users className="h-4 w-4 text-blue-500" />
            })
          })
        }

        // 2. Recent applications
        const { data: recentApplications, error: recentApplicationsError } = await supabase
          .from('applications')
          .select('id, agent_id, status, created_at, profiles:agent_id(full_name)')
          .order('created_at', { ascending: false })
          .limit(5)
          
        if (!recentApplicationsError && recentApplications) {
          recentApplications.forEach(app => {
            const timeDiff = new Date() - new Date(app.created_at)
            let timeAgo = 'recently'
            
            if (timeDiff < 3600000) {
              timeAgo = `${Math.floor(timeDiff / 60000)} minutes ago`
            } else if (timeDiff < 86400000) {
              timeAgo = `${Math.floor(timeDiff / 3600000)} hours ago`
            } else {
              timeAgo = `${Math.floor(timeDiff / 86400000)} days ago`
            }
            
            let icon = <FileText className="h-4 w-4 text-green-500" />
            let message = 'Application submitted'
            
            if (app.status === 'approved') {
              icon = <CheckCircle className="h-4 w-4 text-green-500" />
              message = 'Application approved'
            } else if (app.status === 'rejected') {
              icon = <XCircle className="h-4 w-4 text-red-500" />
              message = 'Application rejected'
            } else if (app.status === 'pending') {
              icon = <Clock className="h-4 w-4 text-amber-500" />
              message = 'Application pending'
            }
            
            recentActivitiesArray.push({
              id: activityId++,
              type: 'application',
              message: message,
              timestamp: timeAgo,
              user: app.profiles?.full_name || `Agent ${app.agent_id.substring(0, 8)}`,
              icon: icon
            })
          })
        }

        // Sort activities by recency
        recentActivitiesArray.sort((a, b) => {
          const timeA = a.timestamp.includes('minutes') ? 1 : 
                        a.timestamp.includes('hours') ? 2 : 
                        a.timestamp.includes('days') ? 3 : 4
          const timeB = b.timestamp.includes('minutes') ? 1 : 
                        b.timestamp.includes('hours') ? 2 : 
                        b.timestamp.includes('days') ? 3 : 4
          
          return timeA - timeB
        })
        
        setRecentActivities(recentActivitiesArray.slice(0, 5))
      } catch (error) {
        console.error('Error refreshing data:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
    setTimeRangeDropdownOpen(false)
  }

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  if (roleLoading || loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length

  return (
    <RoleBasedLayout userRole="admin">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <div className="relative" ref={timeRangeRef}>
            <button 
              className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm"
              onClick={() => setTimeRangeDropdownOpen(!timeRangeDropdownOpen)}
            >
              <Calendar className="h-4 w-4" />
              <span>
                {timeRange === 'today' ? 'Today' : 
                 timeRange === 'week' ? 'This Week' : 
                 timeRange === 'month' ? 'This Month' : 
                 timeRange === 'year' ? 'This Year' : 'All Time'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {timeRangeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                <ul className="py-1">
                  <li 
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${timeRange === 'today' ? 'bg-gray-100' : ''}`}
                    onClick={() => handleTimeRangeChange('today')}
                  >
                    Today
                  </li>
                  <li 
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${timeRange === 'week' ? 'bg-gray-100' : ''}`}
                    onClick={() => handleTimeRangeChange('week')}
                  >
                    This Week
                  </li>
                  <li 
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${timeRange === 'month' ? 'bg-gray-100' : ''}`}
                    onClick={() => handleTimeRangeChange('month')}
                  >
                    This Month
                  </li>
                  <li 
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${timeRange === 'year' ? 'bg-gray-100' : ''}`}
                    onClick={() => handleTimeRangeChange('year')}
                  >
                    This Year
                  </li>
                  <li 
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${timeRange === 'all' ? 'bg-gray-100' : ''}`}
                    onClick={() => handleTimeRangeChange('all')}
                  >
                    All Time
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          <button 
            className="p-2 bg-white border rounded-md hover:bg-gray-50"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative" ref={notificationsRef}>
            <button 
              className="p-2 bg-white border rounded-md hover:bg-gray-50 relative"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg z-10">
                <div className="flex justify-between items-center p-3 border-b">
                  <h3 className="font-medium">Notifications</h3>
                  {unreadNotificationsCount > 0 && (
                    <button 
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={markAllNotificationsAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <ul className="py-1">
                      {notifications.map(notification => (
                        <li 
                          key={notification.id} 
                          className={`px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 relative ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between">
                            <p className="text-sm">{notification.message}</p>
                            <button 
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => removeNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          {!notification.read && (
                            <span className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-4 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="p-2 border-t text-center">
                  <Link href="/admin/notifications" className="text-xs text-blue-600 hover:text-blue-800">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Link href="/admin/users/new" className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors">
          <Plus className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-700">Add New User</span>
        </Link>
        <Link href="/admin/applications" className="flex items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-100 transition-colors">
          <FileText className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-700">View Applications</span>
        </Link>
        <Link href="/admin/settings" className="flex items-center justify-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-100 transition-colors">
          <Settings className="h-4 w-4 text-purple-600" />
          <span className="font-medium text-purple-700">System Settings</span>
        </Link>
        <Link href="/admin/reports" className="flex items-center justify-center gap-2 p-3 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-100 transition-colors">
          <Activity className="h-4 w-4 text-amber-600" />
          <span className="font-medium text-amber-700">View Reports</span>
        </Link>
      </div>
      
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Users" 
          value={stats.totalUsers}
          subtitle="Active accounts"
          icon={<Users className="h-5 w-5 text-blue-600" />}
          trendValue={stats.totalUsers > 0 ? "+12%" : "0%"}
          trendUp={stats.totalUsers > 0}
          color="blue"
        />
        <StatsCard 
          title="Active Managers" 
          value={stats.activeManagers}
          subtitle="Current managers"
          icon={<Settings className="h-5 w-5 text-green-600" />}
          trendValue={stats.activeManagers > 0 ? "+4%" : "0%"}
          trendUp={stats.activeManagers > 0}
          color="green"
        />
        <StatsCard 
          title="Active Agents" 
          value={stats.activeAgents}
          subtitle="Sales agents"
          icon={<Activity className="h-5 w-5 text-purple-600" />}
          trendValue={stats.activeAgents > 0 ? "+7%" : "0%"}
          trendUp={stats.activeAgents > 0}
          color="purple"
        />
        <StatsCard 
          title="Total Applications" 
          value={stats.totalApplications}
          subtitle="Lifetime total"
          icon={<BarChart2 className="h-5 w-5 text-amber-600" />}
          trendValue={stats.totalApplications > 0 ? "+15%" : "0%"}
          trendUp={stats.totalApplications > 0}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Growth</CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Total Users</span>
              </div>
              <div className="relative">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Filter className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Applications by Month</CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Applications</span>
              </div>
              <div className="relative">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Filter className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicationData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 overflow-visible">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusItem 
                title="Database Connection" 
                subtitle="Connected to Supabase" 
                status="operational" 
              />
              <StatusItem 
                title="Authentication Service" 
                subtitle="Supabase Auth" 
                status="operational" 
              />
              <StatusItem 
                title="Webhook Integration" 
                subtitle="n8n" 
                status="operational" 
              />
              <StatusItem 
                title="System Updates" 
                subtitle="Up to date" 
                status="operational" 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/admin/activity-log" className="text-xs text-blue-600 hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-gray-100 rounded-full p-2">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{activity.message}</p>
                          <p className="text-sm text-gray-500">By {activity.user}</p>
                        </div>
                        <span className="text-xs text-gray-400">{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent activity found
                </div>
              )}
              <div className="text-center pt-2">
                <Link href="/admin/activity" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All Activity
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Link 
                href="/admin/users" 
                className="p-4 border rounded-lg hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">User Management</h3>
                  <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
                </div>
              </Link>
              
              <Link 
                href="/admin/settings" 
                className="p-4 border rounded-lg hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <div className="bg-green-100 p-2 rounded-full">
                  <Settings className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">System Settings</h3>
                  <p className="text-sm text-gray-500">Configure global settings</p>
                </div>
              </Link>
              
              <Link 
                href="/admin/views" 
                className="p-4 border rounded-lg hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <div className="bg-purple-100 p-2 rounded-full">
                  <Layers className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Role Views</h3>
                  <p className="text-sm text-gray-500">Preview the application from different user perspectives</p>
                </div>
              </Link>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="font-medium mb-2 text-gray-700">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link 
                  href="/admin/database" 
                  className="p-2 text-center text-sm font-medium text-blue-700 bg-white rounded border border-gray-200 hover:bg-blue-50"
                >
                  Database
                </Link>
                <Link 
                  href="/admin/logs" 
                  className="p-2 text-center text-sm font-medium text-blue-700 bg-white rounded border border-gray-200 hover:bg-blue-50"
                >
                  View Logs
                </Link>
                <Link 
                  href="/admin/backup" 
                  className="p-2 text-center text-sm font-medium text-blue-700 bg-white rounded border border-gray-200 hover:bg-blue-50"
                >
                  Backup Data
                </Link>
                <Link 
                  href="/admin/webhooks" 
                  className="p-2 text-center text-sm font-medium text-blue-700 bg-white rounded border border-gray-200 hover:bg-blue-50"
                >
                  Webhooks
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}

// UI Components
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
)

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
)

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
)

interface CardTitleProps {
  children: React.ReactNode;
}

const CardTitle: React.FC<CardTitleProps> = ({ children }) => (
  <h3 className="text-lg font-medium">{children}</h3>
)

interface StatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  trendValue: string;
  trendUp: boolean;
  color: 'blue' | 'green' | 'purple' | 'amber';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, value, subtitle, icon, trendValue, trendUp, color
}) => {
  const colorMap = {
    blue: {
      bgLight: 'bg-blue-50',
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      borderColor: 'border-blue-100',
      trendBg: trendUp ? 'bg-blue-50' : 'bg-red-50',
      trendText: trendUp ? 'text-blue-700' : 'text-red-700'
    },
    green: {
      bgLight: 'bg-green-50',
      bg: 'bg-green-100',
      text: 'text-green-600',
      borderColor: 'border-green-100',
      trendBg: trendUp ? 'bg-green-50' : 'bg-red-50',
      trendText: trendUp ? 'text-green-700' : 'text-red-700'
    },
    purple: {
      bgLight: 'bg-purple-50',
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      borderColor: 'border-purple-100',
      trendBg: trendUp ? 'bg-purple-50' : 'bg-red-50',
      trendText: trendUp ? 'text-purple-700' : 'text-red-700'
    },
    amber: {
      bgLight: 'bg-amber-50',
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      borderColor: 'border-amber-100',
      trendBg: trendUp ? 'bg-amber-50' : 'bg-red-50',
      trendText: trendUp ? 'text-amber-700' : 'text-red-700'
    }
  };
  
  const colors = colorMap[color];
  
  return (
    <div className={`p-6 rounded-lg border ${colors.borderColor} ${colors.bgLight}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-full ${colors.bg}`}>
          {icon}
        </div>
        <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${colors.trendBg} ${colors.trendText}`}>
          {trendValue} 
          <ArrowUpRight className="h-3 w-3 ml-0.5" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="flex justify-between items-end mt-1">
        <div className="text-3xl font-bold">{value.toLocaleString()}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
    </div>
  );
};

interface StatusItemProps {
  title: string;
  subtitle: string;
  status: 'operational' | 'degraded' | 'outage';
}

const StatusItem: React.FC<StatusItemProps> = ({ title, subtitle, status }) => {
  const statusConfig = {
    operational: {
      color: 'bg-green-500',
      animation: true
    },
    degraded: {
      color: 'bg-amber-500',
      animation: true
    },
    outage: {
      color: 'bg-red-500',
      animation: false
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="flex h-3 w-3 items-center">
        {config.animation && (
          <span className="animate-ping absolute h-3 w-3 rounded-full opacity-75" style={{backgroundColor: config.color}}></span>
        )}
        <span className={`relative rounded-full h-2.5 w-2.5 ${config.color}`}></span>
      </div>
    </div>
  );
};

const ChevronDown = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
); 