export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  excerpt: string;
  author: BlogAuthor;
  category: BlogCategory;
  tags: string[];
  date: string;
  updated?: string;
  published: boolean;
  featured: boolean;
  image?: string;
  readingTime: number;
  seo: BlogSEO;
}

export interface BlogAuthor {
  name: string;
  slug: string;
  bio: string;
  avatar?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface BlogCategory {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

export interface BlogSEO {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  noIndex?: boolean;
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  categories: BlogCategory[];
  featured: BlogPost[];
}

export interface BlogPostResponse extends BlogPost {
  relatedPosts: BlogPost[];
  nextPost?: BlogPost;
  prevPost?: BlogPost;
}