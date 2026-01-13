'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, [selectedCategory]);

  async function loadPosts() {
    try {
      let query = supabase
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
        .eq('published', true)
        .order('published_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const formattedPosts = data?.map((post: any) => ({
        ...post,
        categories: post.blog_post_categories?.map((pc: any) => pc.blog_categories) || []
      })) || [];

      // Filter by category if selected
      const filtered = selectedCategory
        ? formattedPosts.filter(post => 
            post.categories.some((cat: any) => cat.slug === selectedCategory)
          )
        : formattedPosts;

      setPosts(filtered);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const { data } = await supabase
        .from('blog_categories')
        .select('name, slug')
        .order('name');

      setCategories(data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              HitlAI Blog
            </h1>
            <p className="text-xl text-indigo-100">
              Insights on AI testing, product updates, and the future of software quality
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Posts
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.slug
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="text-slate-600 text-xl">Loading posts...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-slate-600 text-xl mb-4">No blog posts yet</div>
              <p className="text-slate-500">Check back soon for updates and insights!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
                    {/* Featured Image */}
                    {post.featured_image_url ? (
                      <div className="aspect-video bg-slate-200 overflow-hidden">
                        <img 
                          src={post.featured_image_url} 
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <div className="text-indigo-300 text-6xl font-bold">
                          {post.title.charAt(0)}
                        </div>
                      </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col">
                      {/* Categories */}
                      {post.categories.length > 0 && (
                        <div className="flex gap-2 mb-3 flex-wrap">
                          {post.categories.map((cat) => (
                            <span 
                              key={cat.slug}
                              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-2xl font-bold text-slate-900 mb-3 hover:text-indigo-600 transition-colors">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-slate-600 mb-4 flex-1">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-slate-500 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{post.author_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.published_at || post.created_at)}</span>
                        </div>
                      </div>

                      {/* Read More */}
                      <div className="mt-4">
                        <span className="text-indigo-600 font-medium flex items-center gap-2 hover:gap-3 transition-all">
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Stay Updated
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Get the latest insights on AI testing and product updates delivered to your inbox
          </p>
          <div className="flex gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
