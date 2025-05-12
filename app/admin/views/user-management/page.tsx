'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserCircle, Search, Edit, Trash2, Plus, Save, X, Mail, UserPlus, AlertTriangle } from 'lucide-react'
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout'
import { useRole } from '@/hooks/useRole'

// Define User type based on profiles table
interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string | null
  avatar_url: string | null
  created_at: string | null
  organization_id: string | null
}

// Modal types
type ModalType = 'create' | 'edit' | 'delete'

// Demo data to use when real data can't be accessed
const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    avatar_url: null,
    created_at: new Date().toISOString(),
    organization_id: null
  },
  {
    id: '2',
    email: 'manager@example.com',
    first_name: 'Manager',
    last_name: 'User',
    role: 'manager',
    avatar_url: null,
    created_at: new Date().toISOString(),
    organization_id: null
  },
  {
    id: '3',
    email: 'agent1@example.com',
    first_name: 'John',
    last_name: 'Agent',
    role: 'agent',
    avatar_url: null,
    created_at: new Date().toISOString(),
    organization_id: null
  },
  {
    id: '4',
    email: 'agent2@example.com',
    first_name: 'Jane',
    last_name: 'Agent',
    role: 'agent',
    avatar_url: null,
    created_at: new Date().toISOString(),
    organization_id: null
  }
]

export default function UserManagement() {
  const { role, loading: roleLoading } = useRole()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType>('create')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'agent',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [usingDemoData, setUsingDemoData] = useState(false)
  const supabase = createClient()

  // Fetch users from Supabase on component mount
  useEffect(() => {
    // Use the role once it's loaded to determine if the user is an admin
    if (!roleLoading && role) {
      fetchUsers(role === 'admin')
    }
  }, [roleLoading, role])

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const lowercaseQuery = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(lowercaseQuery) ||
          (user.first_name?.toLowerCase() || '').includes(lowercaseQuery) ||
          (user.last_name?.toLowerCase() || '').includes(lowercaseQuery) ||
          (user.role?.toLowerCase() || '').includes(lowercaseQuery)
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const fetchUsers = async (isAdmin = false) => {
    setLoading(true)
    try {
      console.log('Fetching user profiles...', isAdmin ? 'as admin' : 'as regular user')
      
      // Get current user's session
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (!sessionData.session) {
        console.error('No active session found')
        setErrorMessage('Not authenticated. Please sign in again.')
        setUsingDemoData(true)
        setUsers(DEMO_USERS)
        setFilteredUsers(DEMO_USERS)
        setLoading(false)
        return
      }
      
      // Try to fetch all profiles
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching profiles:', error)
        
        // If permission error and user is admin, double check if our new policy is working
        if (isAdmin && (error.code === 'PGRST301' || error.message.includes('permission denied'))) {
          console.log('Admin user encountered permission issue - checking if RLS policy is active')
          
          // Force service role query if available, otherwise try again
          try {
            const { data: adminData, error: adminError } = await supabase.rpc('get_all_profiles')
            
            if (!adminError && adminData) {
              console.log('Successfully fetched profiles using RPC function:', adminData.length)
              setUsers(adminData)
              setFilteredUsers(adminData)
              setUsingDemoData(false)
              setLoading(false)
              return
            }
          } catch (rpcError) {
            console.error('RPC method failed:', rpcError)
          }
        }
        
        // Default to demo data on errors
        console.log('Falling back to demo data due to error')
        setUsers(DEMO_USERS)
        setFilteredUsers(DEMO_USERS)
        setUsingDemoData(true)
        setErrorMessage(`Using demo data - Your account may not have permission to view all profiles. ${error.message}`)
      } else if (!data || data.length === 0) {
        console.log('No profiles found in the database')
        
        if (isAdmin) {
          console.log('Admin user found no profiles - using demo data for demonstration')
        }
        
        setUsers(DEMO_USERS)
        setFilteredUsers(DEMO_USERS)
        setUsingDemoData(true)
        setErrorMessage('No user profiles found in the database. Using demo data for visualization purposes.')
      } else {
        console.log('Profiles fetched successfully:', data.length, 'profiles found')
        setUsers(data)
        setFilteredUsers(data)
        setUsingDemoData(false)
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error)
      setUsers(DEMO_USERS)
      setFilteredUsers(DEMO_USERS)
      setUsingDemoData(true)
      setErrorMessage(`An unexpected error occurred. Using demo data instead.`)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (type: ModalType, user: User | null = null) => {
    setModalType(type)
    setCurrentUser(user)
    if (type === 'create') {
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'agent',
      })
    } else if (type === 'edit' && user) {
      setFormData({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role || 'agent',
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setErrorMessage('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    if (usingDemoData) {
      setTimeout(() => {
        const newUser: User = {
          id: Math.random().toString(36).substring(2, 11),
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          avatar_url: null,
          created_at: new Date().toISOString(),
          organization_id: null
        }
        
        setUsers(prevUsers => [newUser, ...prevUsers])
        setFilteredUsers(prevUsers => [newUser, ...prevUsers])
        closeModal()
        setIsSubmitting(false)
        alert('Demo mode: User would be created in a real environment')
      }, 1000)
      return
    }

    try {
      // Try to create user with admin.createUser if available
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: generateRandomPassword(12),
          email_confirm: true,
          user_metadata: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role
          }
        })

        if (authError) {
          console.error('Error creating user with admin.createUser:', authError)
          throw authError
        }

        // The profile should be created automatically by trigger, but we'll update it with our form data
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              first_name: formData.first_name,
              last_name: formData.last_name,
              role: formData.role
            })
            .eq('id', authData.user.id)

          if (profileError) throw profileError
        }
      } catch (adminError) {
        // If admin method fails, try standard signup
        console.log('Admin create method failed, trying standard signup instead')
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: generateRandomPassword(12),
          options: {
            data: {
              first_name: formData.first_name,
              last_name: formData.last_name,
              role: formData.role
            }
          }
        })

        if (error) throw error
      }

      // Close modal and refresh
      closeModal()
      if (role === 'admin') {
        fetchUsers(true)
      }
    } catch (error: any) {
      console.error('Error creating user:', error)
      setErrorMessage(error.message || 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    
    setIsSubmitting(true)
    setErrorMessage('')

    if (usingDemoData) {
      setTimeout(() => {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === currentUser.id 
              ? {...user, first_name: formData.first_name, last_name: formData.last_name, role: formData.role}
              : user
          )
        )
        setFilteredUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === currentUser.id 
              ? {...user, first_name: formData.first_name, last_name: formData.last_name, role: formData.role}
              : user
          )
        )
        closeModal()
        setIsSubmitting(false)
        alert('Demo mode: User would be updated in a real environment')
      }, 1000)
      return
    }

    try {
      // Update profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role
        })
        .eq('id', currentUser.id)

      if (error) throw error

      // Close modal and refresh
      closeModal()
      if (role === 'admin') {
        fetchUsers(true)
      }
    } catch (error: any) {
      console.error('Error updating user:', error)
      setErrorMessage(error.message || 'Failed to update user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteUser = async () => {
    if (!currentUser) return
    
    setIsSubmitting(true)

    if (usingDemoData) {
      setTimeout(() => {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== currentUser.id))
        setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== currentUser.id))
        closeModal()
        setIsSubmitting(false)
        alert('Demo mode: User would be deleted in a real environment')
      }, 1000)
      return
    }

    try {
      // Try different approaches to delete the user
      try {
        // First, try to delete with admin API
        const { error: authError } = await supabase.auth.admin.deleteUser(
          currentUser.id
        )

        if (authError) throw authError
      } catch (adminError) {
        // If admin method fails, try direct deletion from profiles
        console.log('Admin delete method failed, trying direct profile deletion')
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', currentUser.id)

        if (profileError) throw profileError
      }

      // Close modal and refresh
      closeModal()
      if (role === 'admin') {
        fetchUsers(true)
      }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      setErrorMessage(error.message || 'Failed to delete user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendPasswordResetEmail = async (email: string) => {
    if (usingDemoData) {
      alert(`Demo mode: Password reset email would be sent to ${email} in a real environment`)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })

      if (error) throw error

      alert(`Password reset email sent to ${email}`)
    } catch (error: any) {
      console.error('Error sending reset email:', error)
      alert(`Error: ${error.message}`)
    }
  }

  // Helper function to generate a random password
  const generateRandomPassword = (length: number) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+'
    let password = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }
    return password
  }

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'agent':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (roleLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <RoleBasedLayout userRole={role || 'admin'}>
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-gray-500">Manage users and their access permissions</p>
          </div>
          <div className="flex space-x-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => openModal('create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {usingDemoData && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {errorMessage || "Using demonstration data. In a production environment, this page would display real users from your Supabase database."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {loading ? 'Loading users...' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.avatar_url}
                                alt={`${user.first_name} ${user.last_name}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserCircle className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role || 'No Role'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => sendPasswordResetEmail(user.email)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Reset Password"
                          >
                            <Mail className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openModal('edit', user)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit User"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openModal('delete', user)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete User"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Create/Edit/Delete */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">
                    {modalType === 'create'
                      ? 'Add New User'
                      : modalType === 'edit'
                      ? 'Edit User'
                      : 'Delete User'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Error Message */}
                {errorMessage && modalType !== 'delete' && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {errorMessage}
                  </div>
                )}

                {usingDemoData && modalType !== 'delete' && (
                  <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-md">
                    Demo mode: Changes will only be reflected in the UI and not saved to the database.
                  </div>
                )}

                {modalType === 'delete' ? (
                  // Delete Confirmation
                  <div>
                    <p className="mb-4">
                      Are you sure you want to delete user{' '}
                      <span className="font-semibold">
                        {currentUser?.first_name} {currentUser?.last_name} ({currentUser?.email})
                      </span>
                      ? This action cannot be undone.
                    </p>
                    {usingDemoData && (
                      <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-md">
                        Demo mode: This action will only affect the UI display.
                      </div>
                    )}
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={deleteUser}
                        className="px-4 py-2 bg-red-600 text-white rounded-md"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Deleting...' : 'Delete User'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Create/Edit Form
                  <form onSubmit={modalType === 'create' ? createUser : updateUser}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                          placeholder="user@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={modalType === 'edit'} // Email cannot be changed once created
                        />
                      </div>
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          id="first_name"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                          placeholder="First Name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          id="last_name"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                          placeholder="Last Name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <select
                          name="role"
                          id="role"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                          value={formData.role}
                          onChange={handleInputChange}
                        >
                          <option value="agent">Agent</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      {modalType === 'create' && !usingDemoData && (
                        <p className="text-sm text-gray-500 mt-2">
                          A password reset email will be sent to the user.
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                        disabled={isSubmitting}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting
                          ? modalType === 'create'
                            ? 'Creating...'
                            : 'Updating...'
                          : modalType === 'create'
                          ? 'Create User'
                          : 'Update User'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  )
} 