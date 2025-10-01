import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Loader2, FileCode, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import type { NetworkConfig } from './network-switcher'
import { formatTokenAmount } from '../utils/format'

interface ContractFunction {
  name: string
  type: 'read' | 'write'
  inputs: Array<{ name: string; type: string }>
  outputs?: Array<{ name: string; type: string }>
  stateMutability?: string
}

interface ContractInteractionProps {
  walletAddress: string
  network: NetworkConfig
  onExecute: (contractAddress: string, functionName: string, args: any[]) => Promise<{ hash?: string; result?: any }>
}

// Common ERC20 ABI functions
const ERC20_FUNCTIONS: ContractFunction[] = [
  {
    name: 'balanceOf',
    type: 'read',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'write',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    name: 'approve',
    type: 'write',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    name: 'allowance',
    type: 'read',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: 'remaining', type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'read',
    inputs: [],
    outputs: [{ name: 'supply', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'read',
    inputs: [],
    outputs: [{ name: 'decimals', type: 'uint8' }],
  },
  {
    name: 'symbol',
    type: 'read',
    inputs: [],
    outputs: [{ name: 'symbol', type: 'string' }],
  },
  {
    name: 'name',
    type: 'read',
    inputs: [],
    outputs: [{ name: 'name', type: 'string' }],
  },
]

// Uniswap V2 Router functions
const UNISWAP_FUNCTIONS: ContractFunction[] = [
  {
    name: 'swapExactTokensForTokens',
    type: 'write',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    name: 'swapExactETHForTokens',
    type: 'write',
    inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    name: 'getAmountsOut',
    type: 'read',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' },
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
  },
]

const PRESET_CONTRACTS = {
  'ERC20 Token': ERC20_FUNCTIONS,
  'Uniswap V2 Router': UNISWAP_FUNCTIONS,
}

export function ContractInteraction({ walletAddress, network, onExecute }: ContractInteractionProps) {
  const [contractAddress, setContractAddress] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESET_CONTRACTS>('ERC20 Token')
  const [functions, setFunctions] = useState<ContractFunction[]>(ERC20_FUNCTIONS)
  const [expandedFunction, setExpandedFunction] = useState<string | null>(null)
  const [functionInputs, setFunctionInputs] = useState<Record<string, Record<string, string>>>({})
  const [functionResults, setFunctionResults] = useState<Record<string, any>>({})
  const [loadingFunctions, setLoadingFunctions] = useState<Record<string, boolean>>({})

  const handlePresetChange = (preset: keyof typeof PRESET_CONTRACTS) => {
    setSelectedPreset(preset)
    setFunctions(PRESET_CONTRACTS[preset])
    setExpandedFunction(null)
    setFunctionInputs({})
    setFunctionResults({})
  }

  const handleInputChange = (functionName: string, inputName: string, value: string) => {
    setFunctionInputs((prev) => ({
      ...prev,
      [functionName]: {
        ...prev[functionName],
        [inputName]: value,
      },
    }))
  }

  const handleExecuteFunction = async (func: ContractFunction) => {
    if (!contractAddress) {
      alert('Please enter a contract address')
      return
    }

    setLoadingFunctions((prev) => ({ ...prev, [func.name]: true }))
    setFunctionResults((prev) => ({ ...prev, [func.name]: null }))

    try {
      // Build arguments array
      const args = func.inputs.map((input) => {
        const value = functionInputs[func.name]?.[input.name] || ''

        // Handle array inputs (e.g., address[])
        if (input.type.endsWith('[]')) {
          return value.split(',').map((v) => v.trim())
        }

        return value
      })

      const result = await onExecute(contractAddress, func.name, args)
      setFunctionResults((prev) => ({ ...prev, [func.name]: result }))
    } catch (error) {
      console.error('Function execution failed:', error)
      setFunctionResults((prev) => ({
        ...prev,
        [func.name]: { error: error instanceof Error ? error.message : 'Execution failed' },
      }))
    } finally {
      setLoadingFunctions((prev) => ({ ...prev, [func.name]: false }))
    }
  }

  const renderFunctionInputs = (func: ContractFunction) => {
    if (func.inputs.length === 0) {
      return (
        <p className="text-xs text-muted-foreground italic">No inputs required</p>
      )
    }

    return (
      <div className="space-y-3">
        {func.inputs.map((input) => (
          <div key={input.name}>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              {input.name} <span className="text-primary">({input.type})</span>
            </label>
            <Input
              type="text"
              placeholder={
                input.type === 'address'
                  ? '0x...'
                  : input.type.includes('uint')
                  ? '0'
                  : input.type.endsWith('[]')
                  ? 'Comma-separated values'
                  : `Enter ${input.name}`
              }
              value={functionInputs[func.name]?.[input.name] || ''}
              onChange={(e) => handleInputChange(func.name, input.name, e.target.value)}
              className="text-xs font-mono"
            />
          </div>
        ))}
      </div>
    )
  }

  const renderFunctionResult = (func: ContractFunction) => {
    const result = functionResults[func.name]
    if (!result) return null

    if (result.error) {
      return (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-xs text-destructive font-mono">{result.error}</p>
        </div>
      )
    }

    if (result.hash) {
      return (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
          <p className="text-xs font-medium text-green-600 dark:text-green-400">
            ✓ Transaction submitted!
          </p>
          <a
            href={`${network.explorer}/tx/${result.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            View on explorer <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )
    }

    if (result.result !== undefined) {
      // Format result based on function type
      let displayValue = String(result.result)

      // Format token amounts for common functions
      if (['balanceOf', 'totalSupply', 'allowance'].includes(func.name)) {
        try {
          displayValue = formatTokenAmount(result.result, 18)
        } catch {
          displayValue = String(result.result)
        }
      }

      return (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1">Result:</p>
          <code className="text-xs break-all block">
            {typeof result.result === 'object'
              ? JSON.stringify(result.result, null, 2)
              : displayValue}
          </code>
        </div>
      )
    }

    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-primary" />
          Contract Interaction
        </CardTitle>
        <CardDescription>
          Read from and write to smart contracts on {network.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contract Address Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">Contract Address</label>
          <Input
            type="text"
            placeholder="0x..."
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="font-mono text-sm"
          />
        </div>

        {/* Preset Contract Types */}
        <div>
          <label className="text-sm font-medium mb-2 block">Contract Type</label>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(PRESET_CONTRACTS).map((preset) => (
              <Button
                key={preset}
                variant={selectedPreset === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetChange(preset as keyof typeof PRESET_CONTRACTS)}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        {/* Function List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Available Functions</h3>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {functions.filter((f) => f.type === 'read').length} Read
              </Badge>
              <Badge variant="outline" className="text-xs">
                {functions.filter((f) => f.type === 'write').length} Write
              </Badge>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {functions.map((func) => (
              <div
                key={func.name}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFunction(expandedFunction === func.name ? null : func.name)
                  }
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={func.type === 'read' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {func.type}
                    </Badge>
                    <span className="text-sm font-mono">{func.name}</span>
                  </div>
                  {expandedFunction === func.name ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {expandedFunction === func.name && (
                  <div className="px-3 py-3 border-t border-border space-y-3 bg-muted/30">
                    {renderFunctionInputs(func)}

                    <Button
                      onClick={() => handleExecuteFunction(func)}
                      disabled={loadingFunctions[func.name]}
                      className="w-full"
                      size="sm"
                      variant={func.type === 'write' ? 'default' : 'secondary'}
                    >
                      {loadingFunctions[func.name] ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        `${func.type === 'write' ? 'Execute' : 'Query'} ${func.name}`
                      )}
                    </Button>

                    {renderFunctionResult(func)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
