import { AuditLogViewer } from '@/components/audit-log-viewer'

export default async function AuditPage({ 
  params 
}: { 
  params: Promise<{ userId: string }> 
}) {
  const { userId } = await params
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <AuditLogViewer userId={userId} />
      </div>
    </div>
  )
}