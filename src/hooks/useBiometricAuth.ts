'use client'

import { useEffect, useState } from 'react'
import { biometricService } from '@/services/security/biometric-service'
import {
  BiometricAnalyticsSnapshot,
  BiometricAuthenticationResult,
  BiometricDeviceProfile,
  BiometricFallbackOption,
  BiometricModality,
  FallbackVerificationResult,
  TransactionConfirmationResult,
} from '@/types/biometric'

export function useBiometricAuth() {
  const [devices, setDevices] = useState<BiometricDeviceProfile[]>([])
  const [analytics, setAnalytics] = useState<BiometricAnalyticsSnapshot | null>(null)
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [selectedModality, setSelectedModality] = useState<BiometricModality>('fingerprint')
  const [selectedFactors, setSelectedFactors] = useState<BiometricModality[]>(['fingerprint'])
  const [lastAccessVerification, setLastAccessVerification] =
    useState<BiometricAuthenticationResult | null>(null)
  const [lastFallbackVerification, setLastFallbackVerification] =
    useState<FallbackVerificationResult | null>(null)
  const [lastTransactionApproval, setLastTransactionApproval] =
    useState<TransactionConfirmationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isConfirmingTransaction, setIsConfirmingTransaction] = useState(false)

  useEffect(() => {
    let isActive = true

    async function load() {
      try {
        const [deviceData, analyticsData] = await Promise.all([
          biometricService.listDevices(),
          biometricService.getAnalytics(),
        ])

        if (!isActive) {
          return
        }

        const firstDevice = deviceData[0] ?? null
        const defaultModality = firstDevice?.supportedModalities[0] ?? 'fingerprint'

        setDevices(deviceData)
        setAnalytics(analyticsData)
        setSelectedDeviceId(firstDevice?.id ?? '')
        setSelectedModality(defaultModality)
        setSelectedFactors([defaultModality])
      } catch {
        if (isActive) {
          setError('Unable to load biometric authentication profiles.')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isActive = false
    }
  }, [])

  const selectedDevice = devices.find((device) => device.id === selectedDeviceId) ?? null
  const supportedModalities = selectedDevice?.supportedModalities ?? []
  const fallbackOptions = selectedDevice?.fallbackOptions ?? []

  useEffect(() => {
    const deviceModalities = selectedDevice?.supportedModalities ?? []

    if (!deviceModalities.length) {
      return
    }

    if (!deviceModalities.includes(selectedModality)) {
      setSelectedModality(deviceModalities[0])
    }

    setSelectedFactors((currentFactors) => {
      const nextFactors = currentFactors.filter((factor) => deviceModalities.includes(factor))
      return nextFactors.length ? nextFactors : [deviceModalities[0]]
    })
  }, [selectedDevice, selectedModality])

  function toggleFactor(modality: BiometricModality) {
    if (!supportedModalities.includes(modality)) {
      return
    }

    setSelectedFactors((currentFactors) => {
      if (currentFactors.includes(modality)) {
        const nextFactors = currentFactors.filter((factor) => factor !== modality)
        return nextFactors.length ? nextFactors : [modality]
      }

      return [...currentFactors, modality]
    })
  }

  async function authenticateSelected() {
    if (!selectedDeviceId) {
      return null
    }

    setError(null)
    setIsAuthenticating(true)

    try {
      const result = await biometricService.authenticate({
        deviceId: selectedDeviceId,
        modality: selectedModality,
        useCase: 'app-access',
      })

      setLastAccessVerification(result)
      return result
    } catch {
      setError('Biometric app access verification failed.')
      return null
    } finally {
      setIsAuthenticating(false)
    }
  }

  async function confirmTransaction(amountUsd: number) {
    if (!selectedDeviceId) {
      setError('Select a biometric device before confirming a transaction.')
      return null
    }

    setError(null)
    setIsConfirmingTransaction(true)

    try {
      const result = await biometricService.confirmTransaction({
        deviceId: selectedDeviceId,
        amountUsd,
        factors: selectedFactors,
      })

      setLastTransactionApproval(result)
      return result
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : 'Biometric transaction confirmation failed.',
      )
      return null
    } finally {
      setIsConfirmingTransaction(false)
    }
  }

  async function verifyFallback(option: BiometricFallbackOption) {
    if (!selectedDeviceId) {
      return null
    }

    setError(null)

    try {
      const result = await biometricService.verifyFallback(selectedDeviceId, option)
      setLastFallbackVerification(result)
      return result
    } catch {
      setError('Fallback verification failed.')
      return null
    }
  }

  return {
    devices,
    analytics,
    selectedDevice,
    selectedDeviceId,
    selectedModality,
    selectedFactors,
    supportedModalities,
    fallbackOptions,
    lastAccessVerification,
    lastFallbackVerification,
    lastTransactionApproval,
    error,
    isLoading,
    isAuthenticating,
    isConfirmingTransaction,
    setSelectedDeviceId,
    setSelectedModality,
    toggleFactor,
    authenticateSelected,
    confirmTransaction,
    verifyFallback,
    fallbackCoveragePercent: analytics?.fallbackCoveragePercent ?? 0,
    fingerprintVerificationMs: analytics?.fingerprintVerificationMs ?? 0,
    faceRecognitionAccuracy: analytics?.faceRecognitionAccuracy ?? 0,
    voiceVerificationMs: analytics?.voiceVerificationMs ?? 0,
  }
}
