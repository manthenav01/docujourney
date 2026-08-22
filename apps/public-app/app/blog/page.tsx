import { Metadata } from 'next';
import { Suspense } from 'react';
import { generateMetadata } from '@docujourney/utils';
import { getAllBlogPosts, getBlogCategoriesWithCount } from '@/lib/blog/content';
import { DashboardHeader } from '@/components/h1b-dashboard/DashboardHeader';
import { DashboardFooter } from '@/components/h1b-dashboard/DashboardFooter';
import { SmartBreadcrumb } from '@/components/h1b-dashboard/SmartBreadcrumb';
import { BlogGrid } from '@/components/blog/BlogGrid';
import { BlogCategories } from '@/components/blog/BlogCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { Search, TrendingUp } from 'lucide-react';
import { generateBlogListingStructuredData } from '@/lib/blog/structured-data';
import Script from 'next/script';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.usimmigrantcentral.com';

export const metadata: Metadata = {
  ...generateMetadata({
    title: 'H1B Blog - Immigration Insights, Visa Trends & Career Advice',
    description: 'Stay updated with the latest H1B visa trends, immigration insights, salary data, and career advice. Expert analysis on visa policies, company sponsorships, and job market trends.',
    keywords: ['H1B blog', 'immigration blog', 'visa trends', 'H1B news', 'immigration advice', 'career tips', 'visa policies'],
    type: 'website',
    path: '/blog',
  }),
  alternates: {
    canonical: `${baseUrl}/blog`,
    types: {
      'application/rss+xml': [
        { url: `${baseUrl}/blog/feed.xml`, title: 'US Immigrant Central Blog RSS Feed' },
      ],
      'application/atom+xml': [
        { url: `${baseUrl}/blog/atom.xml`, title: 'US Immigrant Central Blog Atom Feed' },
      ],
    },
  },
};

export default async function BlogPage() {
  const { posts, featured, categories } = await getAllBlogPosts({ limit: 20 });
  const categoriesWithCount = await getBlogCategoriesWithCount();
  
  const structuredData = generateBlogListingStructuredData(baseUrl);

  return (
    <>
      {structuredData && (
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <Suspense fallback={<div className="h-16 bg-background" />}>
        <DashboardHeader />
      </Suspense>

      {/* Breadcrumb Navigation */}
      <Suspense fallback={<div className="h-8 bg-background" />}>
        <SmartBreadcrumb />
      </Suspense>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Search className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            H1B Immigration Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stay informed with expert insights on H1B visas, immigration trends, salary data,
            and career advice for international professionals.
          </p>
        </section>

        {/* Featured Stats */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{posts.length}+</div>
                <div className="text-muted-foreground">Articles Published</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{categories.length}</div>
                <div className="text-muted-foreground">Categories Covered</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-muted-foreground">Latest Immigration Insights</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <BlogCategories categories={categoriesWithCount} />

              {/* Newsletter Signup */}
              <Card>
                <CardHeader>
                  <CardTitle>Stay Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get the latest H1B news and immigration updates delivered to your inbox.
                  </p>
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-input rounded-md text-sm"
                    />
                    <button className="w-full bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <BlogGrid posts={posts} featured={featured} />
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
    </>
  );
}