import { AuditLogViewer } from '@/components/audit-log-viewer'
import { AuditLogSearch } from '@/components/audit-log-search'

export default async function AuditPage({
  params
}: {
  params: Promise<{ userId: string }>
}) {
  const resolvedParams = await params
  const userId = resolvedParams?.userId

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="py-8">
        {userId && userId !== 'search' ? (
          <AuditLogViewer userId={userId} />
        ) : (
          <AuditLogSearch />
        )}
      </div>
    </div>
  )
}