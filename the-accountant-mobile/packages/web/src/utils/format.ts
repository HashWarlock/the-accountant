/**
 * Format a token amount from wei to human-readable format
 */
export function formatTokenAmount(amount: string | bigint, decimals: number = 18): string {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount
  const divisor = BigInt(10 ** decimals)
  const whole = amountBigInt / divisor
  const remainder = amountBigInt % divisor

  if (remainder === BigInt(0)) {
    return whole.toString()
  }

  const remainderStr = remainder.toString().padStart(decimals, '0')
  const trimmed = remainderStr.replace(/0+$/, '')

  return `${whole}.${trimmed}`
}

/**
 * Parse a human-readable token amount to wei
 */
export function parseTokenAmount(amount: string, decimals: number = 18): string {
  const [whole = '0', fraction = '0'] = amount.split('.')
  const fractionPadded = fraction.padEnd(decimals, '0').slice(0, decimals)
  const amountWei = BigInt(whole) * BigInt(10 ** decimals) + BigInt(fractionPadded)
  return amountWei.toString()
}

/**
 * Shorten an Ethereum address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Format a transaction hash for display
 */
export function shortenHash(hash: string, chars: number = 6): string {
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`
}
