'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useGetCurrentUserQuery } from '@/features/auth/authApi'

interface User {
  id: string
  name: string
  email: string
  profilePicture?: string
  avatar?: string
}

interface SessionContextType {
  user: User | null
  loading: boolean
  error: string | null
  refetch: () => void
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  loading: true,
  error: null,
  refetch: () => {}
})

export const useSession = () => {
  return useContext(SessionContext)
}

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data, isLoading, error, refetch } = useGetCurrentUserQuery()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (data?.success && data.user) {
      setUser(data.user)
    } else if (data?.success === false || error) {
      // If we get an explicit failure or error, clear the user
      setUser(null)
    }
  }, [data, error])

  const value = {
    user,
    loading: isLoading,
    error: error ? 'Failed to load session' : null,
    refetch
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}
