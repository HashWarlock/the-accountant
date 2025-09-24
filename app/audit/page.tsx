import { AuditLogSearch } from '@/components/audit-log-search'

export default function AuditSearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="py-8">
        <AuditLogSearch />
      </div>
    </div>
  )
}