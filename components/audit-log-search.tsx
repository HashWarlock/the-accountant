'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Search, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AuditLogSearch() {
  const router = useRouter()
  const [userId, setUserId] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (userId.trim()) {
      router.push(`/audit/${userId.trim()}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center space-y-6 mb-8">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/20">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Audit Log Search
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Enter a user ID to view their complete audit trail with TEE attestations
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userId" className="text-sm font-medium text-gray-700">
              User ID
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="userId"
                type="text"
                placeholder="Enter user ID (e.g., alice, bob, john.doe)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="h-12 pl-11 text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                autoFocus
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Search for audit logs by user ID, not email or address
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!userId.trim()}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Audit Logs
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
              className="h-12 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/audit/alice')}
              className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 group-hover:text-blue-700">Alice</span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </div>
            </button>
            <button
              onClick={() => router.push('/audit/bob')}
              className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 group-hover:text-blue-700">Bob</span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </div>
            </button>
            <button
              onClick={() => router.push('/audit/hashwarlock')}
              className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 group-hover:text-blue-700">Hashwarlock</span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </div>
            </button>
            <button
              onClick={() => router.push('/audit/test')}
              className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 group-hover:text-blue-700">Test</span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          View comprehensive audit trails including TEE attestations, signatures, and operation history
        </p>
      </div>
    </div>
  )
}