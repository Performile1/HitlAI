'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string | null;
  author_name: string;
  published_at: string;
  created_at: string;
  categories: { name: string; slug: string }[];
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPost();
  }, [params.slug]);

  async function loadPost() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_post_categories (
            blog_categories (
              name,
              slug
            )
          )
        `)
        .eq('slug', params.slug)
        .eq('published', true)
        .single();

      if (error) throw error;

      if (data) {
        setPost({
          ...data,
          categories: data.blog_post_categories?.map((pc: any) => pc.blog_categories) || []
        });
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600 text-xl">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-600 text-xl mb-4">Post not found</div>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {post.categories.map((cat) => (
              <span 
                key={cat.slug}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-6 text-slate-600 mb-8 pb-8 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span className="font-medium">{post.author_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>{formatDate(post.published_at || post.created_at)}</span>
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mb-12 rounded-xl overflow-hidden">
            <img 
              src={post.featured_image_url} 
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg prose-slate max-w-none
            prose-headings:font-bold prose-headings:text-slate-900
            prose-p:text-slate-700 prose-p:leading-relaxed
            prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-900 prose-strong:font-semibold
            prose-ul:text-slate-700 prose-ol:text-slate-700
            prose-li:marker:text-indigo-600
            prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-slate-900 prose-pre:text-slate-100
            prose-blockquote:border-l-indigo-600 prose-blockquote:text-slate-700
            prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Testing?
          </h2>
          <p className="text-xl text-indigo-100 mb-6">
            Join companies using HitlAI to deliver better products faster
          </p>
          <Link href="/company/login">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
