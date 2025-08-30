import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getPostsByCategory } from '@/lib/blog/content';
import { BlogCard } from '@/components/blog/BlogCard';
import { DashboardHeader } from '@/components/h1b-dashboard/DashboardHeader';
import { DashboardFooter } from '@/components/h1b-dashboard/DashboardFooter';
import { Badge } from '@docujourney/ui';
import { ArrowLeft, Rss } from 'lucide-react';
import { generateBlogListingStructuredData } from '@/lib/blog/structured-data';
import Script from 'next/script';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find(c => c.slug === slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com';

  return {
    title: `${category.name} Articles - US Immigrant Central Blog`,
    description: `Browse articles about ${category.name} on US Immigrant Central. Expert insights on H1B visas, immigration processes, and US work authorization.`,
    openGraph: {
      title: `${category.name} Articles - US Immigrant Central Blog`,
      description: `Browse articles about ${category.name} on US Immigrant Central. Expert insights on H1B visas, immigration processes, and US work authorization.`,
      url: `${baseUrl}/blog/category/${category.slug}`,
      siteName: 'US Immigrant Central',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${category.name} Articles`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} Articles - US Immigrant Central`,
      description: `Browse articles about ${category.name} on US Immigrant Central`,
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${baseUrl}/blog/category/${category.slug}`,
      types: {
        'application/rss+xml': [
          { url: `${baseUrl}/blog/feed.xml`, title: 'RSS Feed' },
        ],
        'application/atom+xml': [
          { url: `${baseUrl}/blog/atom.xml`, title: 'Atom Feed' },
        ],
      },
    },
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const categories = await getCategories();
  const category = categories.find(c => c.slug === slug);

  if (!category) {
    notFound();
  }

  // Pagination
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const postsPerPage = 12;
  
  const allPosts = await getPostsByCategory(slug);
  const totalPages = Math.ceil(allPosts.length / postsPerPage);
  
  const posts = allPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com';
  const structuredData = generateBlogListingStructuredData(baseUrl, category);

  return (
    <>
      {structuredData && (
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        
        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link 
                href="/blog"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to all posts
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href="/blog/feed.xml"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  title="RSS Feed"
                >
                  <Rss className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className={`px-4 py-2 text-base ${category.color || ''}`}>
                {category.name}
              </Badge>
              <span className="text-muted-foreground">
                {allPosts.length} {allPosts.length === 1 ? 'article' : 'articles'}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {category.name} Articles
            </h1>
            
            {category.description && (
              <p className="text-lg text-muted-foreground max-w-3xl">
                {category.description}
              </p>
            )}
          </div>

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {posts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/blog/category/${category.slug}?page=${currentPage - 1}`}
                      className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Link
                            key={page}
                            href={`/blog/category/${category.slug}?page=${page}`}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                              page === currentPage
                                ? 'bg-primary text-white'
                                : 'text-foreground hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </Link>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  {currentPage < totalPages && (
                    <Link
                      href={`/blog/category/${category.slug}?page=${currentPage + 1}`}
                      className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found in this category.</p>
              <Link href="/blog" className="mt-4 inline-block text-primary hover:underline">
                View all articles
              </Link>
            </div>
          )}
        </main>
        
        <DashboardFooter />
      </div>
    </>
  );
}