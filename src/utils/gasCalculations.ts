import { 
  GasFeeEstimate, 
  FeeOptimization, 
  SpeedCostOption, 
  HistoricalFeeData,
  GasCalculatorInputs,
  GasCalculatorResult 
} from '@/types/gas'

export const calculateGasEstimate = (networkCongestion: 'low' | 'medium' | 'high'): GasFeeEstimate => {
  const baseFeeMap = {
    low: 100,
    medium: 250,
    high: 500
  }
  
  const priorityFeeMap = {
    low: 10,
    medium: 50,
    high: 200
  }
  
  const estimatedTimeMap = {
    low: 180, // 3 minutes
    medium: 60, // 1 minute
    high: 15 // 15 seconds
  }
  
  const baseFee = baseFeeMap[networkCongestion]
  const priorityFee = priorityFeeMap[networkCongestion]
  const maxFee = baseFee + priorityFee + 100 // buffer
  
  return {
    baseFee,
    priorityFee,
    maxFee,
    estimatedTime: estimatedTimeMap[networkCongestion],
    confidence: networkCongestion === 'low' ? 95 : networkCongestion === 'medium' ? 80 : 60,
    networkCongestion,
    timestamp: new Date()
  }
}

export const optimizeFee = (currentFee: number, targetTime: number, networkCongestion: 'low' | 'medium' | 'high'): FeeOptimization => {
  const estimate = calculateGasEstimate(networkCongestion)
  let optimizedFee = currentFee
  let strategy: FeeOptimization['strategy'] = 'standard'
  
  if (targetTime <= 30 && networkCongestion !== 'high') {
    // Need faster execution
    optimizedFee = currentFee * 1.5
    strategy = 'fast'
  } else if (targetTime > 120 && networkCongestion === 'high') {
    // Can wait longer
    optimizedFee = currentFee * 0.7
    strategy = 'slow'
  } else if (targetTime <= 10) {
    // Maximum speed
    optimizedFee = currentFee * 2
    strategy = 'max'
  }
  
  const savings = currentFee - optimizedFee
  const savingsPercentage = (savings / currentFee) * 100
  
  const recommendations: string[] = []
  if (savingsPercentage > 15) {
    recommendations.push('Consider waiting for lower network congestion')
  }
  if (strategy === 'fast') {
    recommendations.push('Higher priority fee for faster inclusion')
  }
  if (networkCongestion === 'high') {
    recommendations.push('Network is congested - expect delays')
  }
  
  return {
    originalFee: currentFee,
    optimizedFee,
    savings: Math.max(0, savings),
    savingsPercentage: Math.max(0, savingsPercentage),
    recommendations,
    strategy
  }
}

export const getSpeedCostOptions = (networkCongestion: 'low' | 'medium' | 'high'): SpeedCostOption[] => {
  const baseMultiplier = networkCongestion === 'low' ? 1 : networkCongestion === 'medium' ? 2.5 : 4
  
  return [
    {
      id: 'slow',
      name: 'Slow',
      description: 'Economical, may take longer',
      fee: 100 * baseMultiplier,
      estimatedTime: networkCongestion === 'low' ? 300 : networkCongestion === 'medium' ? 180 : 120,
      confidence: 95,
      color: 'green',
      icon: 'turtle'
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Balanced speed and cost',
      fee: 250 * baseMultiplier,
      estimatedTime: networkCongestion === 'low' ? 60 : networkCongestion === 'medium' ? 45 : 30,
      confidence: 85,
      color: 'blue',
      icon: 'rabbit'
    },
    {
      id: 'fast',
      name: 'Fast',
      description: 'Quick inclusion',
      fee: 500 * baseMultiplier,
      estimatedTime: networkCongestion === 'low' ? 30 : networkCongestion === 'medium' ? 20 : 15,
      confidence: 75,
      color: 'purple',
      icon: 'cheetah'
    },
    {
      id: 'max',
      name: 'Maximum',
      description: 'Fastest possible',
      fee: 1000 * baseMultiplier,
      estimatedTime: networkCongestion === 'low' ? 15 : networkCongestion === 'medium' ? 10 : 5,
      confidence: 95,
      color: 'red',
      icon: 'rocket'
    }
  ]
}

export const generateHistoricalData = (days: number = 30): HistoricalFeeData[] => {
  const data: HistoricalFeeData[] = []
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
    const congestion = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    const estimate = calculateGasEstimate(congestion)
    
    data.push({
      timestamp,
      baseFee: estimate.baseFee,
      priorityFee: estimate.priorityFee,
      networkCongestion: congestion,
      blockNumber: 1000000 - (i * 7200) // Approximate blocks
    })
  }
  
  return data
}

export const calculateGasFee = (inputs: GasCalculatorInputs): GasCalculatorResult => {
  const { gasLimit, gasPrice, priorityFee = 0, complexity, network } = inputs;
    // Adjust gas limit based on complexity
    const adjustedGasLimit = gasLimit * (complexity === 'simple' ? 1 : complexity === 'medium' ? 1.2 : 1.5)
    
    // Network multiplier
    const networkMultiplier = network === 'mainnet' ? 1 : 0.1
    
    // Calculate fees
    const baseFee = adjustedGasLimit * gasPrice * networkMultiplier
    const priorityFeeAmount = adjustedGasLimit * priorityFee * networkMultiplier
    const l1Fee = network === 'mainnet' ? adjustedGasLimit * 0.001 * networkMultiplier : undefined
    
    const totalFee = baseFee + priorityFeeAmount + (l1Fee || 0)
    
    // Estimate time based on total fee
    let estimatedTime = 60 // default 1 minute
    if (totalFee > 1000) estimatedTime = 15
    else if (totalFee > 500) estimatedTime = 30
    else if (totalFee < 200) estimatedTime = 180
    
    // Generate recommendations
    const recommendations: string[] = []
    if (complexity === 'complex') {
      recommendations.push('Consider breaking down complex transactions')
    }
    if (priorityFee === 0 && totalFee < 500) {
      recommendations.push('Add priority fee for faster processing')
    }
    if (network === 'testnet') {
      recommendations.push('Using testnet - fees are significantly lower')
    }
    
    return {
      totalFee,
      breakdown: {
        baseFee,
        priorityFee: priorityFeeAmount,
        l1Fee
      },
      estimatedTime,
      recommendations
    }
}

export const formatFee = (fee: number, asset: string = 'XLM'): string => {
  if (fee >= 1000000) {
    return `${(fee / 1000000).toFixed(2)}M ${asset}`
  } else if (fee >= 1000) {
    return `${(fee / 1000).toFixed(2)}K ${asset}`
  }
  return `${fee.toFixed(7)} ${asset}`
}

export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}

export const getNetworkCongestionColor = (congestion: 'low' | 'medium' | 'high'): string => {
  switch (congestion) {
    case 'low':
      return 'text-green-600 bg-green-100'
    case 'medium':
      return 'text-yellow-600 bg-yellow-100'
    case 'high':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export const calculateOptimalFeeWindow = (historicalData: HistoricalFeeData[]): { start: Date; end: Date; avgFee: number }[] => {
  // Group data by hour and find optimal windows
  const hourlyData = new Map<number, HistoricalFeeData[]>()
  
  historicalData.forEach(data => {
    const hour = data.timestamp.getHours()
    if (!hourlyData.has(hour)) {
      hourlyData.set(hour, [])
    }
    hourlyData.get(hour)!.push(data)
  })
  
  const windows: { start: Date; end: Date; avgFee: number }[] = []
  
  hourlyData.forEach((data, hour) => {
    const avgFee = data.reduce((sum, d) => sum + d.baseFee, 0) / data.length
    const now = new Date()
    
    windows.push({
      start: new Date(now.setHours(hour, 0, 0, 0)),
      end: new Date(now.setHours(hour, 59, 59, 999)),
      avgFee
    })
  })
  
  return windows.sort((a, b) => a.avgFee - b.avgFee).slice(0, 3)
}
