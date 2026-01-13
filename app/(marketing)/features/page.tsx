import { Sparkles, Users, Bot, Target, Camera, Video, TrendingUp, Shield, Zap, CheckCircle, ArrowRight, Code, BarChart3, FileText, Smartphone, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      category: "AI Testing",
      icon: Bot,
      color: "purple",
      items: [
        {
          name: "AI Digital Twins",
          description: "AI testers trained by real humans to mimic diverse user personas with authentic behavior patterns",
          icon: Sparkles
        },
        {
          name: "Persona Forge",
          description: "Create custom AI personas with specific demographics, tech literacy, and behavioral traits",
          icon: Users
        },
        {
          name: "AI Training Loop",
          description: "Human testers contribute to AI training and earn passive income from their AI twins",
          icon: TrendingUp
        },
        {
          name: "Automated Testing",
          description: "Run tests 24/7 with AI testers at a fraction of the cost of human-only testing",
          icon: Zap
        }
      ]
    },
    {
      category: "Human Testing",
      icon: Users,
      color: "blue",
      items: [
        {
          name: "Verified Human Testers",
          description: "Biometric verification ensures real humans with Sentinel anti-bot technology",
          icon: Shield
        },
        {
          name: "Diverse Tester Pool",
          description: "Access testers across demographics, tech skills, and accessibility needs",
          icon: Globe
        },
        {
          name: "Quality Ratings",
          description: "Tester performance tracking with automatic flagging and quality thresholds",
          icon: BarChart3
        },
        {
          name: "Mission Control",
          description: "Testers manage available tests, track earnings, and view performance metrics",
          icon: Target
        }
      ]
    },
    {
      category: "Advanced Annotations",
      icon: Camera,
      color: "indigo",
      items: [
        {
          name: "Element-Specific Annotations",
          description: "Click-to-select elements with automatic CSS selector and XPath generation",
          icon: Target
        },
        {
          name: "Screenshot Capture & Markup",
          description: "Capture screenshots with drawing tools: pen, arrows, boxes, circles, and text",
          icon: Camera
        },
        {
          name: "Screen Recording",
          description: "Record full test sessions with pause/resume and automatic upload",
          icon: Video
        },
        {
          name: "AI Issue Detection",
          description: "GPT-4 Vision automatically detects usability and accessibility issues",
          icon: Sparkles
        }
      ]
    },
    {
      category: "Testing Types",
      icon: CheckCircle,
      color: "emerald",
      items: [
        {
          name: "Usability Testing",
          description: "Identify navigation issues, confusing flows, and UX friction points",
          icon: Users
        },
        {
          name: "Accessibility Testing",
          description: "WCAG compliance checking, color contrast, screen reader compatibility",
          icon: Shield
        },
        {
          name: "Mobile App Testing",
          description: "Upload APK/IPA files or stream apps directly in the browser (coming soon)",
          icon: Smartphone
        },
        {
          name: "Web Application Testing",
          description: "Test any web URL with iframe embedding or direct navigation",
          icon: Globe
        }
      ]
    },
    {
      category: "Reporting & Analytics",
      icon: FileText,
      color: "amber",
      items: [
        {
          name: "Comprehensive Reports",
          description: "Executive summaries with overall scores, top concerns, and strengths",
          icon: FileText
        },
        {
          name: "Human vs AI Comparison",
          description: "Statistics comparing human and AI tester performance across categories",
          icon: BarChart3
        },
        {
          name: "Category Breakdown",
          description: "Issues organized by usability, accessibility, performance, design, and content",
          icon: TrendingUp
        },
        {
          name: "Prioritized Recommendations",
          description: "Immediate, short-term, and long-term action items with clear guidance",
          icon: CheckCircle
        }
      ]
    },
    {
      category: "Platform Features",
      icon: Zap,
      color: "rose",
      items: [
        {
          name: "Flexible Testing Options",
          description: "Choose AI-only, human-only, or mixed testing based on budget and needs",
          icon: Target
        },
        {
          name: "Credit-Based Pricing",
          description: "Pay-as-you-go with credit packages - no subscriptions required",
          icon: Zap
        },
        {
          name: "Real-Time Collaboration",
          description: "Team members can view tests, add comments, and track progress together",
          icon: Users
        },
        {
          name: "API Access",
          description: "Integrate HitlAI into your CI/CD pipeline with our REST API",
          icon: Code
        }
      ]
    },
    {
      category: "Security & Privacy",
      icon: Lock,
      color: "slate",
      items: [
        {
          name: "Data Encryption",
          description: "All data encrypted in transit and at rest with industry-standard protocols",
          icon: Lock
        },
        {
          name: "Biometric Verification",
          description: "Sentinel system tracks mouse patterns, typing speed, and focus events",
          icon: Shield
        },
        {
          name: "Secure Storage",
          description: "Test recordings and screenshots stored securely with automatic deletion",
          icon: Shield
        },
        {
          name: "Privacy Controls",
          description: "Blur sensitive data in screenshots and control what testers can access",
          icon: Lock
        }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      purple: { bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-200', icon: 'text-purple-600' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200', icon: 'text-blue-600' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-200', icon: 'text-indigo-600' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200', icon: 'text-emerald-600' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', icon: 'text-amber-600' },
      rose: { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200', icon: 'text-rose-600' },
      slate: { bg: 'bg-slate-50', text: 'text-slate-900', border: 'border-slate-200', icon: 'text-slate-600' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Everything You Need for Modern Testing
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Comprehensive testing platform combining AI automation with human insight. 
              From element-specific annotations to AI-powered issue detection.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/company/login">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
                  Start Testing
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-20">
            {features.map((category, idx) => {
              const CategoryIcon = category.icon;
              const colors = getColorClasses(category.color);
              
              return (
                <div key={idx}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`p-3 rounded-xl ${colors.bg} border-2 ${colors.border}`}>
                      <CategoryIcon className={`w-8 h-8 ${colors.icon}`} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">{category.category}</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {category.items.map((item, itemIdx) => {
                      const ItemIcon = item.icon;
                      return (
                        <div 
                          key={itemIdx}
                          className={`p-6 rounded-xl border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-shadow`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg bg-white border ${colors.border}`}>
                              <ItemIcon className={`w-6 h-6 ${colors.icon}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className={`text-xl font-semibold ${colors.text} mb-2`}>
                                {item.name}
                              </h3>
                              <p className="text-slate-600">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Testing?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join companies using HitlAI to deliver better products faster with AI-powered testing.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/company/login">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
                Get Started Free
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
