'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, User, Mail, Briefcase } from 'lucide-react'

export default function TesterSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 bg-clip-text text-transparent mb-2">
            Tester Settings
          </h1>
          <p className="text-slate-600">Manage your profile and preferences</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="display-name">Display Name</Label>
              <Input id="display-name" defaultValue="Sarah Johnson" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="tester@demo.com" />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" defaultValue="28" />
            </div>
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" defaultValue="UX Designer" />
            </div>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              Testing Preferences
            </CardTitle>
            <CardDescription>Configure your testing availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tech-literacy">Tech Literacy</Label>
              <Input id="tech-literacy" defaultValue="High" />
            </div>
            <div>
              <Label htmlFor="primary-device">Primary Device</Label>
              <Input id="primary-device" defaultValue="Desktop" />
            </div>
            <div>
              <Label htmlFor="max-tests">Max Tests Per Week</Label>
              <Input id="max-tests" type="number" defaultValue="15" />
            </div>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              Account Settings
            </CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="America/New_York" />
            </div>
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Input id="payment-method" defaultValue="Stripe" />
            </div>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
