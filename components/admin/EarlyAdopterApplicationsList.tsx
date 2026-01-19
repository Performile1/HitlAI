'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CheckCircle2, XCircle, Clock, Users, Search, Filter, TrendingUp } from 'lucide-react'

interface Application {
  id: string
  full_name: string
  email: string
  company: string
  role: string | null
  company_size: string
  industry: string | null
  testing_needs: string | null
  monthly_test_volume: string
  current_tools: string | null
  pain_points: string | null
  interested_features: string[]
  referral_source: string | null
  status: string
  priority_score: number
  submitted_at: string
  reviewed_at: string | null
  review_notes: string | null
}

interface EarlyAdopterApplicationsListProps {
  initialApplications: Application[]
}

export default function EarlyAdopterApplicationsList({ initialApplications }: EarlyAdopterApplicationsListProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const matchesSearch = searchQuery === '' || 
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    avgScore: Math.round(applications.reduce((sum, a) => sum + a.priority_score, 0) / applications.length)
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch('/api/early-adopters/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          reviewNotes
        })
      })

      if (response.ok) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, reviewed_at: new Date().toISOString(), review_notes: reviewNotes }
            : app
        ))
        setSelectedApp(null)
        setReviewNotes('')
      }
    } catch (error) {
      console.error('Error updating application:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      approved: { variant: 'default', icon: CheckCircle2, label: 'Approved' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
      waitlisted: { variant: 'outline', icon: Users, label: 'Waitlisted' }
    }
    const config = variants[status] || variants.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-blue-600 bg-blue-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Priority Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Review and manage early access applications</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full sm:w-[200px]"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="waitlisted">Waitlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <Dialog key={app.id}>
                <DialogTrigger asChild>
                  <div 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{app.full_name}</h3>
                        {getStatusBadge(app.status)}
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(app.priority_score)}`}>
                          <TrendingUp className="h-3 w-3 inline mr-1" />
                          {app.priority_score}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{app.email}</span>
                        <span>•</span>
                        <span>{app.company}</span>
                        <span>•</span>
                        <span>{app.company_size}</span>
                        <span>•</span>
                        <span>{app.monthly_test_volume}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground ml-4">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      {app.full_name}
                      {getStatusBadge(app.status)}
                    </DialogTitle>
                    <DialogDescription>
                      Application submitted on {new Date(app.submitted_at).toLocaleDateString()}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-semibold mb-1">Email</h4>
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Company</h4>
                        <p className="text-sm text-muted-foreground">{app.company}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Role</h4>
                        <p className="text-sm text-muted-foreground">{app.role || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Company Size</h4>
                        <p className="text-sm text-muted-foreground">{app.company_size}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Industry</h4>
                        <p className="text-sm text-muted-foreground">{app.industry || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Monthly Volume</h4>
                        <p className="text-sm text-muted-foreground">{app.monthly_test_volume}</p>
                      </div>
                    </div>

                    {app.testing_needs && (
                      <div>
                        <h4 className="font-semibold mb-1">Testing Needs</h4>
                        <p className="text-sm text-muted-foreground">{app.testing_needs}</p>
                      </div>
                    )}

                    {app.current_tools && (
                      <div>
                        <h4 className="font-semibold mb-1">Current Tools</h4>
                        <p className="text-sm text-muted-foreground">{app.current_tools}</p>
                      </div>
                    )}

                    {app.pain_points && (
                      <div>
                        <h4 className="font-semibold mb-1">Pain Points</h4>
                        <p className="text-sm text-muted-foreground">{app.pain_points}</p>
                      </div>
                    )}

                    {app.interested_features.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Interested Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {app.interested_features.map(feature => (
                            <Badge key={feature} variant="outline">{feature.replace('_', ' ')}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.referral_source && (
                      <div>
                        <h4 className="font-semibold mb-1">Referral Source</h4>
                        <p className="text-sm text-muted-foreground">{app.referral_source}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Review Notes</h4>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add notes about this application..."
                        rows={3}
                      />
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => updateApplicationStatus(app.id, 'approved')}
                          disabled={updating}
                          className="flex-1"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => updateApplicationStatus(app.id, 'waitlisted')}
                          disabled={updating}
                          variant="outline"
                          className="flex-1"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Waitlist
                        </Button>
                        <Button
                          onClick={() => updateApplicationStatus(app.id, 'rejected')}
                          disabled={updating}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}

            {filteredApplications.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No applications found matching your filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
