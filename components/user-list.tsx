'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataCard } from '@/components/ui/data-card'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Copy,
  Mail,
  Calendar,
  Wallet,
  ArrowUpDown
} from 'lucide-react'
import { toast } from 'sonner'

export function UserList() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>({})
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchUsers = async (pageNum: number, searchTerm: string = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        sort: sortField,
        order: sortOrder,
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(page, search)
  }, [page, sortField, sortOrder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers(1, search)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-phala-lime/20 to-phala-lime/10 backdrop-blur-sm flex items-center justify-center border border-phala-lime/30">
            <Users className="h-7 w-7 text-phala-lime" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-phala-g00">Registered Users</h2>
          <p className="text-phala-g02 max-w-xl mx-auto">
            Browse and manage all users with TEE-backed wallets
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-6"
      >
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-phala-g03" />
            <Input
              placeholder="Search by email, user ID, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-10 bg-phala-g09/10 border-phala-g08/30 focus:border-phala-lime"
            />
          </div>
          <Button
            type="submit"
            variant="phala"
            disabled={loading}
            className="h-12 px-6"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </form>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DataCard
            title="Total Users"
            icon={<Users className="h-5 w-5 text-phala-lime" />}
            badge={pagination.totalCount?.toString() || "0"}
            badgeVariant="success"
            delay={0.1}
          >
            <p className="text-sm text-phala-g02">Active wallet holders</p>
          </DataCard>
          <DataCard
            title="Current Page"
            icon={<Calendar className="h-5 w-5 text-phala-lime" />}
            badge={`${pagination.page || 1} / ${pagination.totalPages || 1}`}
            badgeVariant="secondary"
            delay={0.2}
          >
            <p className="text-sm text-phala-g02">Navigation position</p>
          </DataCard>
          <DataCard
            title="Per Page"
            icon={<Wallet className="h-5 w-5 text-phala-lime" />}
            badge="10"
            badgeVariant="outline"
            delay={0.3}
          >
            <p className="text-sm text-phala-g02">Results displayed</p>
          </DataCard>
        </div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-phala-g09/5 backdrop-blur-sm rounded-2xl border border-phala-g08/20 overflow-hidden"
        >
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-phala-g08/20 hover:bg-phala-g09/10">
                    <TableHead className="text-phala-g01">
                      <button
                        className="flex items-center gap-1 font-semibold hover:text-phala-lime transition-colors"
                        onClick={() => handleSort('userId')}
                      >
                        User
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead className="text-phala-g01">Email</TableHead>
                    <TableHead className="text-phala-g01">Ethereum Address</TableHead>
                    <TableHead className="text-phala-g01">
                      <button
                        className="flex items-center gap-1 font-semibold hover:text-phala-lime transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        Created
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead className="text-phala-g01 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-phala-g08/20 hover:bg-phala-g09/10"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-phala-lime/20 to-phala-lime/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-phala-lime">
                                {user.userId.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-phala-g00">{user.userId}</p>
                              <Badge variant="outline" className="text-xs">
                                ID: {user.id}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-phala-g03" />
                            <span className="text-phala-g01">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-phala-g02 bg-phala-g09/20 px-2 py-1 rounded">
                              {user.address.slice(0, 6)}...{user.address.slice(-4)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(user.address, 'Address')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-phala-g03" />
                            <span className="text-sm text-phala-g02">
                              {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.location.href = `/audit/${user.userId}`
                            }}
                          >
                            View Audit
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
                <TableCaption className="text-phala-g03 py-4">
                  Total of {pagination.totalCount} registered users
                </TableCaption>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-phala-g08/20">
                  <p className="text-sm text-phala-g02">
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.totalCount)} of {pagination.totalCount} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className="border-phala-g08/30 hover:border-phala-lime"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "phala" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={pageNum !== page ? "border-phala-g08/30 hover:border-phala-lime" : ""}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="border-phala-g08/30 hover:border-phala-lime"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-phala-g03 mx-auto mb-4" />
              <p className="text-phala-g02">No users found</p>
              <p className="text-sm text-phala-g03 mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}