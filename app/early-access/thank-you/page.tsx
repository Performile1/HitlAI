import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Mail, Calendar, Rocket } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Application Submitted | HitlAI',
  description: 'Thank you for applying to our early access program'
}

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="inline-flex p-4 bg-green-100 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Application Submitted!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your interest in HitlAI's Early Access Program
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-600" />
              What happens next?
            </h2>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                    1
                  </div>
                </div>
                <div>
                  <p className="font-medium">Application Review</p>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your application within 5-7 business days
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                    2
                  </div>
                </div>
                <div>
                  <p className="font-medium">Email Notification</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email with your application status and next steps
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                    3
                  </div>
                </div>
                <div>
                  <p className="font-medium">Onboarding & Access</p>
                  <p className="text-sm text-muted-foreground">
                    If approved, we'll send you an invitation link and onboarding guide
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-gray-50 rounded-lg text-left">
              <Mail className="h-5 w-5 text-gray-600 mb-2" />
              <h3 className="font-semibold mb-1">Check Your Email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a confirmation to your email address
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg text-left">
              <Calendar className="h-5 w-5 text-gray-600 mb-2" />
              <h3 className="font-semibold mb-1">Review Timeline</h3>
              <p className="text-sm text-muted-foreground">
                Expect to hear from us within 5-7 business days
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Return to Home
              </Button>
            </Link>
            <Link href="/docs" className="flex-1">
              <Button className="w-full">
                Explore Documentation
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            Questions? Contact us at{' '}
            <a href="mailto:support@hitlai.com" className="text-blue-600 hover:underline">
              support@hitlai.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
