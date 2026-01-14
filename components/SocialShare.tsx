'use client'

import { Share2, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SocialShareProps {
  url: string
  title: string
  description?: string
  hashtags?: string[]
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function SocialShare({ 
  url, 
  title, 
  description = '', 
  hashtags = [],
  variant = 'outline',
  size = 'default'
}: SocialShareProps) {
  
  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    window.open(linkedInUrl, '_blank', 'width=600,height=600')
  }

  const shareOnX = () => {
    const text = `${title}${description ? ' - ' + description : ''}`
    const hashtagString = hashtags.length > 0 ? `&hashtags=${hashtags.join(',')}` : ''
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}${hashtagString}`
    window.open(xUrl, '_blank', 'width=600,height=600')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    // You could add a toast notification here
    alert('Link copied to clipboard!')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareOnLinkedIn} className="cursor-pointer">
          <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnX} className="cursor-pointer">
          <svg 
            className="w-4 h-4 mr-2" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
          <Share2 className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
