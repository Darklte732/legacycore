export type UserRole = 'admin' | 'manager' | 'agent'

export interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  role: UserRole
  managerId: string | null
}

export interface User {
  id: string
  email: string
  profile: Profile
} 