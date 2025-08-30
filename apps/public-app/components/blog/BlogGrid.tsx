'use client';

import React from 'react';
import { BlogCard } from './BlogCard';
import { BlogPost } from '@/lib/blog/types';

interface BlogGridProps {
  posts: BlogPost[];
  featured?: BlogPost[];
  loading?: boolean;
}

export function BlogGrid({ posts, featured = [], loading = false }: BlogGridProps) {
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Featured Posts Skeleton */}
        {featured.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-48 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Regular Posts Skeleton */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const regularPosts = posts.filter(post => !featured.some(f => f.slug === post.slug));

  return (
    <div className="space-y-12">
      {/* Featured Posts */}
      {featured.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 text-foreground">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((post) => (
              <BlogCard key={post.slug} post={post} featured />
            ))}
          </div>
        </section>
      )}

      {/* Regular Posts */}
      {regularPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 text-foreground">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <p className="text-lg mb-2">No articles found</p>
            <p>Check back later for new content!</p>
          </div>
        </div>
      )}
    </div>
  );
}