import { CopyButton } from './copy-button'
import { cn } from '@/lib/cn'

interface TruncatedAddressProps {
  address: string
  className?: string
  showCopy?: boolean
}

export function TruncatedAddress({
  address,
  className,
  showCopy = true,
}: TruncatedAddressProps) {
  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <div className={cn('flex items-center gap-2 font-mono', className)}>
      <span className="text-sm">{truncated}</span>
      {showCopy && <CopyButton text={address} />}
    </div>
  )
}
