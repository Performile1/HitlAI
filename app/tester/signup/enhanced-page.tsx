'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function EnhancedTesterSignup() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    
    // Demographics
    age: '',
    gender: '',
    location: '',
    nativeLanguage: '',
    educationLevel: '',
    occupation: '',
    techExperience: 'intermediate',
    
    // Disabilities & Accessibility
    visualImpairment: 'none',
    hearingImpairment: 'none',
    motorImpairment: 'none',
    cognitiveImpairment: 'none',
    usesScreenReader: false,
    usesMagnification: false,
    usesVoiceControl: false,
    usesKeyboardOnly: false,
    colorBlindness: 'none',
    
    // Device & Environment
    primaryDevice: 'desktop',
    screenSize: 'medium',
    internetSpeed: 'fast',
    browserPreference: 'chrome',
    
    // Testing Preferences
    preferredTestTypes: [] as string[],
    availableHours: 'flexible',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Consent
    consentScreenRecording: false,
    consentCursorTracking: false,
    consentEyeTracking: false,
    consentCameraAccess: false,
    consentDataTraining: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      })

      if (authError) throw authError

      // Create tester profile
      const { error: profileError } = await supabase
        .from('human_testers')
        .insert({
          id: authData.user!.id,
          email: formData.email,
          full_name: formData.fullName,
          
          // Demographics
          age: parseInt(formData.age),
          gender: formData.gender,
          location: formData.location,
          native_language: formData.nativeLanguage,
          education_level: formData.educationLevel,
          occupation: formData.occupation,
          tech_experience: formData.techExperience,
          
          // Disabilities
          visual_impairment: formData.visualImpairment,
          hearing_impairment: formData.hearingImpairment,
          motor_impairment: formData.motorImpairment,
          cognitive_impairment: formData.cognitiveImpairment,
          uses_screen_reader: formData.usesScreenReader,
          uses_magnification: formData.usesMagnification,
          uses_voice_control: formData.usesVoiceControl,
          uses_keyboard_only: formData.usesKeyboardOnly,
          color_blindness: formData.colorBlindness,
          
          // Device
          primary_device: formData.primaryDevice,
          screen_size: formData.screenSize,
          internet_speed: formData.internetSpeed,
          browser_preference: formData.browserPreference,
          
          // Preferences
          preferred_test_types: formData.preferredTestTypes,
          available_hours: formData.availableHours,
          timezone: formData.timezone,
          
          // Consent
          consent_screen_recording: formData.consentScreenRecording,
          consent_cursor_tracking: formData.consentCursorTracking,
          consent_eye_tracking: formData.consentEyeTracking,
          consent_camera_access: formData.consentCameraAccess,
          consent_data_training: formData.consentDataTraining,
          
          verification_status: 'pending'
        })

      if (profileError) throw profileError

      router.push('/tester/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleTestType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      preferredTestTypes: prev.preferredTestTypes.includes(type)
        ? prev.preferredTestTypes.filter(t => t !== type)
        : [...prev.preferredTestTypes, type]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Become a Human Tester</h1>
          <p className="text-gray-600 mb-8">
            Help companies improve their UX while earning money. Your unique perspective matters!
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Account Information */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </section>

            {/* Demographics */}
            <section>
              <h2 className="text-xl font-semibold mb-4">About You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Age *</label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Native Language</label>
                  <input
                    type="text"
                    placeholder="e.g., English"
                    value={formData.nativeLanguage}
                    onChange={(e) => setFormData({...formData, nativeLanguage: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Education Level</label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({...formData, educationLevel: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select...</option>
                    <option value="high_school">High School</option>
                    <option value="some_college">Some College</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="doctorate">Doctorate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tech Experience *</label>
                  <select
                    required
                    value={formData.techExperience}
                    onChange={(e) => setFormData({...formData, techExperience: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Accessibility & Disabilities */}
            <section className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Accessibility Profile</h2>
              <p className="text-sm text-gray-600 mb-4">
                This helps us match you with tests that need your unique perspective. All information is confidential.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Visual Impairment</label>
                  <select
                    value={formData.visualImpairment}
                    onChange={(e) => setFormData({...formData, visualImpairment: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                  >
                    <option value="none">None</option>
                    <option value="mild">Mild (glasses/contacts)</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="blind">Blind</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color Blindness</label>
                  <select
                    value={formData.colorBlindness}
                    onChange={(e) => setFormData({...formData, colorBlindness: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                  >
                    <option value="none">None</option>
                    <option value="protanopia">Protanopia (Red-blind)</option>
                    <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                    <option value="tritanopia">Tritanopia (Blue-blind)</option>
                    <option value="monochromacy">Monochromacy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Motor Impairment</label>
                  <select
                    value={formData.motorImpairment}
                    onChange={(e) => setFormData({...formData, motorImpairment: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                  >
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cognitive Impairment</label>
                  <select
                    value={formData.cognitiveImpairment}
                    onChange={(e) => setFormData({...formData, cognitiveImpairment: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                  >
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.usesScreenReader}
                    onChange={(e) => setFormData({...formData, usesScreenReader: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">I use a screen reader</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.usesMagnification}
                    onChange={(e) => setFormData({...formData, usesMagnification: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">I use screen magnification</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.usesVoiceControl}
                    onChange={(e) => setFormData({...formData, usesVoiceControl: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">I use voice control</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.usesKeyboardOnly}
                    onChange={(e) => setFormData({...formData, usesKeyboardOnly: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">I navigate using keyboard only</span>
                </label>
              </div>
            </section>

            {/* Recording Consent */}
            <section className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Recording & Privacy Consent</h2>
              <p className="text-sm text-gray-600 mb-4">
                To provide the best insights, we can record your testing sessions. You control what we record.
              </p>
              
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.consentScreenRecording}
                    onChange={(e) => setFormData({...formData, consentScreenRecording: e.target.checked})}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">Screen Recording</span>
                    <p className="text-xs text-gray-600">Record your screen during tests (recommended)</p>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.consentCursorTracking}
                    onChange={(e) => setFormData({...formData, consentCursorTracking: e.target.checked})}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">Cursor Tracking</span>
                    <p className="text-xs text-gray-600">Track mouse movements and clicks</p>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.consentEyeTracking}
                    onChange={(e) => setFormData({...formData, consentEyeTracking: e.target.checked})}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">Eye Tracking (Webcam)</span>
                    <p className="text-xs text-gray-600">Track where you look using your webcam (optional, provides valuable insights)</p>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.consentCameraAccess}
                    onChange={(e) => setFormData({...formData, consentCameraAccess: e.target.checked})}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">Camera Access</span>
                    <p className="text-xs text-gray-600">Allow camera access for eye tracking</p>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.consentDataTraining}
                    onChange={(e) => setFormData({...formData, consentDataTraining: e.target.checked})}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">AI Training</span>
                    <p className="text-xs text-gray-600">Use my anonymized data to train AI testers (helps improve the platform)</p>
                  </div>
                </label>
              </div>

              <div className="mt-4 p-3 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-600">
                  🔒 <strong>Privacy Guarantee:</strong> All recordings are encrypted, PII is automatically removed, 
                  and data is only shared with companies whose tests you participate in. You can revoke consent anytime.
                </p>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Tester Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
