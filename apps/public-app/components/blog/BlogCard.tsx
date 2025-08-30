'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@docujourney/ui';
import { Clock, Calendar } from 'lucide-react';
import { BlogPost } from '@/lib/blog/types';
import { formatDate } from '@/lib/blog/utils';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const cardClasses = featured
    ? 'hover:shadow-xl transition-all duration-300 border-2 border-primary/20 hover:border-primary/40'
    : 'hover:shadow-lg transition-shadow duration-300';

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className={post.category.color}>
            {post.category.name}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime} min read</span>
          </div>
        </div>

        <CardTitle className={`line-clamp-2 ${featured ? 'text-xl' : 'text-lg'}`}>
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-primary transition-colors"
          >
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(post.date)}</span>
          </div>

          {post.tags.length > 0 && (
            <div className="flex gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}