'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Building, Mail, Globe } from 'lucide-react'

export default function CompanySettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-2">
            Company Settings
          </h1>
          <p className="text-slate-600">Manage your company profile and preferences</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Company Information
            </CardTitle>
            <CardDescription>Update your company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" defaultValue="Demo Tech Inc." />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" defaultValue="Technology" />
            </div>
            <div>
              <Label htmlFor="company-size">Company Size</Label>
              <Input id="company-size" defaultValue="Medium (50-200)" />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" defaultValue="https://demotech.example.com" />
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Contact Information
            </CardTitle>
            <CardDescription>Update contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="demo@company.com" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Testing Preferences
            </CardTitle>
            <CardDescription>Configure default test settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ai-ratio">Default AI Test Ratio (%)</Label>
              <Input id="ai-ratio" type="number" defaultValue="75" min="0" max="100" />
            </div>
            <div>
              <Label htmlFor="human-ratio">Default Human Test Ratio (%)</Label>
              <Input id="human-ratio" type="number" defaultValue="25" min="0" max="100" />
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
