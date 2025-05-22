import { User, UserRole } from '@/types/roles'

/**
 * Checks if a user has a specific role
 */
export const hasRole = (user: User | null, role: UserRole): boolean => {
  if (!user || !user.profile) return false
  return user.profile.role === role
}

/**
 * Checks if a user has any of the specified roles
 */
export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user || !user.profile) return false
  return roles.includes(user.profile.role)
}

/**
 * Check if the user is an admin
 */
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'admin')
}

/**
 * Check if the user is a manager
 */
export const isManager = (user: User | null): boolean => {
  return hasRole(user, 'manager')
}

/**
 * Check if the user is an agent
 */
export const isAgent = (user: User | null): boolean => {
  return hasRole(user, 'agent')
} 