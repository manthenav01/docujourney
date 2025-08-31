import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { BlogPost, BlogFilters, BlogListResponse, BlogPostResponse, BlogCategory } from './types';
import { calculateReadingTime, generateExcerpt, getBlogCategories, generateSlug } from './utils';

// Configure marked options for better rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Remove custom renderer - using built-in heading IDs

// Use content directory within the app - handle both monorepo and standalone app contexts
const getContentDir = () => {
  const cwd = process.cwd();
  
  // Check if we're running from the app directory
  const directPath = path.join(cwd, 'content', 'blog');
  if (fs.existsSync(directPath)) {
    return directPath;
  }
  
  // Check if we're running from the monorepo root
  const appPath = path.join(cwd, 'apps', 'public-app', 'content', 'blog');
  if (fs.existsSync(appPath)) {
    return appPath;
  }
  
  // Default to direct path
  return directPath;
};

const BLOG_CONTENT_DIR = getContentDir();
const POSTS_DIR = path.join(BLOG_CONTENT_DIR, 'posts');

export async function getAllBlogPosts(filters: BlogFilters = {}): Promise<BlogListResponse> {
  try {
    // Ensure directory exists
    if (!fs.existsSync(POSTS_DIR)) {
      fs.mkdirSync(POSTS_DIR, { recursive: true });
    }

    const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));

    let posts: BlogPost[] = [];

    for (const file of files) {
      try {
        const post = await getBlogPostBySlug(file.replace('.md', ''));
        if (post && post.published) {
          posts.push(post);
        }
      } catch (error) {
        console.error(`Error loading post ${file}:`, error);
      }
    }

    // Apply filters
    if (filters.category) {
      posts = posts.filter(post => post.category.slug === filters.category);
    }

    if (filters.tag) {
      posts = posts.filter(post => post.tags.includes(filters.tag!));
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.description.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm)),
      );
    }

    if (filters.featured !== undefined) {
      posts = posts.filter(post => post.featured === filters.featured);
    }

    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination
    const total = posts.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 10;
    posts = posts.slice(offset, offset + limit);

    // Get featured posts
    const featuredPosts = posts.filter(post => post.featured).slice(0, 3);

    return {
      posts,
      total,
      categories: getBlogCategories(),
      featured: featuredPosts,
    };
  } catch (error) {
    console.error('Error getting all blog posts:', error);
    return {
      posts: [],
      total: 0,
      categories: getBlogCategories(),
      featured: [],
    };
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(POSTS_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    const categories = getBlogCategories();

    const category = categories.find(cat => cat.slug === data.category) || categories[0];

    // Convert Markdown to HTML
    const htmlContent = await marked(content);
    
    const post: BlogPost = {
      slug,
      title: data.title || '',
      description: data.description || '',
      content: htmlContent,
      excerpt: data.excerpt || generateExcerpt(content),
      author: {
        name: 'Immigrant Central',
        slug: 'immigrant-central',
        bio: 'Your trusted source for H1B visa information and immigration insights.',
        avatar: '/logo.svg',
      },
      category,
      tags: data.tags || [],
      date: data.date || new Date().toISOString(),
      updated: data.updated,
      published: data.published !== false,
      featured: data.featured || false,
      image: data.image,
      readingTime: data.readingTime || calculateReadingTime(content),
      seo: {
        title: data.seo?.title || data.title,
        description: data.seo?.description || data.description,
        keywords: data.seo?.keywords || data.tags || [],
        canonical: data.seo?.canonical,
        noIndex: data.seo?.noIndex || false,
      },
    };

    return post;
  } catch (error) {
    console.error(`Error getting blog post ${slug}:`, error);
    return null;
  }
}

export async function getBlogPostWithRelated(slug: string): Promise<BlogPostResponse | null> {
  try {
    const post = await getBlogPostBySlug(slug);
    if (!post) {return null;}

    // Get related posts (same category, excluding current post)
    const { posts: relatedPosts } = await getAllBlogPosts({
      category: post.category.slug,
      limit: 4,
    });

    const filteredRelated = relatedPosts.filter(p => p.slug !== slug);

    // Get next and previous posts
    const { posts: allPosts } = await getAllBlogPosts({ limit: 1000 });
    const currentIndex = allPosts.findIndex(p => p.slug === slug);

    const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : undefined;
    const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : undefined;

    return {
      ...post,
      relatedPosts: filteredRelated,
      nextPost,
      prevPost,
    };
  } catch (error) {
    console.error(`Error getting blog post with related ${slug}:`, error);
    return null;
  }
}

export async function getBlogCategoriesWithCount(): Promise<Array<BlogCategory & { count: number }>> {
  try {
    const { posts } = await getAllBlogPosts({ limit: 1000 });
    const categories = getBlogCategories();

    return categories.map(category => ({
      ...category,
      count: posts.filter(post => post.category.slug === category.slug).length,
    }));
  } catch (error) {
    console.error('Error getting blog categories with count:', error);
    return [];
  }
}

export async function searchBlogPosts(query: string, limit: number = 10): Promise<BlogPost[]> {
  try {
    const { posts } = await getAllBlogPosts({
      search: query,
      limit,
    });

    return posts;
  } catch (error) {
    console.error('Error searching blog posts:', error);
    return [];
  }
}

// Helper functions for compatibility
export async function getAllPosts(): Promise<BlogPost[]> {
  const response = await getAllBlogPosts({ limit: 1000 });
  return response.posts;
}

export async function getCategories(): Promise<BlogCategory[]> {
  const categoriesWithCount = await getBlogCategoriesWithCount();
  return categoriesWithCount.map(({ count, ...category }) => category);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return getBlogPostBySlug(slug);
}

export async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const response = await getAllBlogPosts({ 
    category: categorySlug,
    limit: 1000, 
  });
  return response.posts;
}