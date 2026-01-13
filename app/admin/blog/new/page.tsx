'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewBlogPostPage() {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    author_name: '',
    published: false
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('You must be logged in to create posts');
        return;
      }

      const { error } = await supabase
        .from('blog_posts')
        .insert({
          ...formData,
          author_id: user.id,
          author_name: formData.author_name || 'HitlAI Team',
          published_at: formData.published ? new Date().toISOString() : null
        });

      if (error) throw error;

      alert('Post created successfully!');
      router.push('/admin/blog');
    } catch (error: any) {
      console.error('Failed to create post:', error);
      alert(`Failed to create post: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Create New Post</h1>
          <p className="text-slate-600 mt-1">Write and publish a new blog post</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="Enter post title"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-sm"
                placeholder="post-url-slug"
              />
              <p className="text-xs text-slate-500 mt-1">
                URL: /blog/{formData.slug || 'post-url-slug'}
              </p>
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Author Name
              </label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="HitlAI Team"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="Brief summary of the post (shown in listings)"
              />
            </div>

            {/* Featured Image URL */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.featured_image_url}
                onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="https://example.com/image.jpg"
              />
              {formData.featured_image_url && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                  <img 
                    src={formData.featured_image_url} 
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Invalid image URL';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Content * (HTML supported)
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={20}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-sm"
                placeholder="Write your post content here. HTML tags are supported."
              />
              <p className="text-xs text-slate-500 mt-1">
                You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
              </p>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600"
              />
              <label htmlFor="published" className="text-sm font-medium text-slate-900">
                Publish immediately
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link href="/admin/blog">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
