'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@docujourney/ui';
import { BlogCategory } from '@/lib/blog/types';

interface BlogCategoriesProps {
  categories: Array<BlogCategory & { count: number }>;
  activeCategory?: string;
}

export function BlogCategories({ categories, activeCategory }: BlogCategoriesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Link
            href="/blog"
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              !activeCategory
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'hover:bg-muted/50'
            }`}
          >
            <span className="font-medium">All Posts</span>
            <Badge variant="secondary">
              {categories.reduce((total, cat) => total + cat.count, 0)}
            </Badge>
          </Link>

          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/blog/category/${category.slug}`}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                activeCategory === category.slug
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded ${category.color}`}>
                  {/* You can add icons here based on category.icon */}
                </div>
                <span className="font-medium">{category.name}</span>
              </div>
              <Badge variant="secondary">{category.count}</Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}