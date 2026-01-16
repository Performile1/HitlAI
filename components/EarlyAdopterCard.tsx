'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface EarlyAdopterCardProps {
  type?: 'company' | 'tester'
  className?: string
}

interface TierSpots {
  tier: string
  maxSpots: number
  filledSpots: number
  availableSpots: number
}

export default function EarlyAdopterCard({ type = 'company', className = '' }: EarlyAdopterCardProps) {
  const [spots, setSpots] = useState<TierSpots[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpots()
  }, [type])

  const fetchSpots = async () => {
    try {
      const endpoint = type === 'company' ? '/api/early-adopter/apply' : '/api/founding-tester/apply'
      const response = await fetch(endpoint)
      const data = await response.json()
      
      if (data.success) {
        setSpots(data.data)
      }
    } catch (error) {
      console.error('Error fetching spots:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierInfo = (tier: string) => {
    if (type === 'company') {
      const info: Record<string, { label: string; discount: string; benefits: string[] }> = {
        founding_partner: {
          label: 'Founding Partner',
          discount: '25% off forever',
          benefits: ['Lifetime 25% discount', 'Priority support', 'Product roadmap input', 'Case study feature']
        },
        early_adopter: {
          label: 'Early Adopter',
          discount: '20% off forever',
          benefits: ['Lifetime 20% discount', 'Priority support', 'Early feature access']
        },
        beta_user: {
          label: 'Beta User',
          discount: '10% off forever',
          benefits: ['Lifetime 10% discount', 'Beta feature access', 'Community access']
        }
      }
      return info[tier] || { label: tier, discount: '', benefits: [] }
    } else {
      const info: Record<string, { label: string; revenue: string; benefits: string[] }> = {
        founding_tester: {
          label: 'Founding Tester',
          revenue: '40% revenue + 0.05% equity',
          benefits: ['40% revenue share', '0.05% equity (vesting)', '$5/test training bonus', 'Optional $500/mo retainer']
        },
        early_tester: {
          label: 'Early Tester',
          revenue: '35% revenue + 0.02% equity',
          benefits: ['35% revenue share', '0.02% equity (vesting)', '$3/test training bonus', '$200/mo bonus (15+ tests)']
        },
        beta_tester: {
          label: 'Beta Tester',
          revenue: '32% revenue + 0.01% equity',
          benefits: ['32% revenue share', '0.01% equity (vesting)', '$2/test training bonus']
        }
      }
      return info[tier] || { label: tier, revenue: '', benefits: [] }
    }
  }

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-4 mb-6">
        <div className="text-4xl">🚀</div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">
            {type === 'company' ? 'Early Adopter Program' : 'Founding Tester Program'}
          </h3>
          <p className="text-gray-700">
            {type === 'company' 
              ? 'Lock in lifetime discounts as we build the AI together. Limited spots available.'
              : 'Join as a founding tester and earn equity + enhanced revenue share. Help train our AI.'}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {spots.map((spot) => {
          const tierInfo = getTierInfo(spot.tier)
          const isAvailable = spot.availableSpots > 0
          
          return (
            <div 
              key={spot.tier}
              className={`bg-white rounded-lg p-4 border-2 ${
                isAvailable ? 'border-purple-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-lg">{tierInfo.label}</div>
                  <div className="text-sm text-purple-600 font-semibold">
                    {type === 'company' ? tierInfo.discount : tierInfo.revenue}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {spot.availableSpots}
                  </div>
                  <div className="text-xs text-gray-600">spots left</div>
                </div>
              </div>
              
              <ul className="text-xs space-y-1 text-gray-600">
                {tierInfo.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <Link
        href={type === 'company' ? '/early-adopter' : '/founding-tester'}
        className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
      >
        Apply Now
      </Link>

      <p className="text-xs text-gray-600 text-center mt-4">
        {type === 'company' 
          ? 'First come, first served. Discounts locked in forever.'
          : 'Equity vests over 24 months. Revenue share starts immediately.'}
      </p>
    </div>
  )
}
