import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBlogPostWithRelated, getCategories, getPostBySlug, getAllPosts } from '@/lib/blog/content';
import { generateBlogPostMetadata } from '@/lib/blog/utils';
import { BlogPost } from '@/components/blog/BlogPost';
import { DashboardHeader } from '@/components/h1b-dashboard/DashboardHeader';
import { DashboardFooter } from '@/components/h1b-dashboard/DashboardFooter';
import { 
  generateArticleStructuredData, 
  generateBreadcrumbStructuredData,
  generateAuthorStructuredData,
  combineStructuredData,
} from '@/lib/blog/structured-data';
import Script from 'next/script';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostWithRelated(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return generateBlogPostMetadata(post);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const postData = await getBlogPostWithRelated(slug);

  if (!postData) {
    notFound();
  }

  const post = await getPostBySlug(slug);
  const categories = await getCategories();
  const category = categories.find(c => c.slug === post?.category?.slug);
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com';
  
  // Default author if not specified
  const author = {
    name: 'US Immigrant Central Team',
    slug: 'us-immigrant-central-team',
    url: `${baseUrl}/about`,
    bio: 'Expert insights on H1B visas and US immigration',
    role: 'Immigration Content Team',
    avatar: `${baseUrl}/team-avatar.png`,
    social: {
      twitter: 'usimmigrantcentral',
      linkedin: 'us-immigrant-central',
    },
  };

  // Generate structured data
  const articleData = post ? generateArticleStructuredData(post, author, baseUrl) : null;
  const breadcrumbData = post ? generateBreadcrumbStructuredData(post, category, baseUrl) : null;
  const authorData = generateAuthorStructuredData(author, baseUrl);
  
  const structuredData = combineStructuredData(articleData, breadcrumbData, authorData);

  return (
    <>
      {structuredData && (
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      )}
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <BlogPost post={postData} />
          </div>
        </main>
        <DashboardFooter />
      </div>
    </>
  );
}