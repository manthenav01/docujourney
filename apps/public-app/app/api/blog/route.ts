import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/lib/blog/content';

export async function GET(request: NextRequest) {
  try {
    // Temporary debugging for production
    console.log('Blog API called - Environment:', {
      cwd: process.cwd(),
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
    });

    const { searchParams } = new URL(request.url);

    const filters = {
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      author: searchParams.get('author') || undefined,
      search: searchParams.get('search') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const result = await getAllBlogPosts(filters);

    // Log result for debugging
    console.log('Blog posts loaded:', {
      postsCount: result.posts.length,
      totalCount: result.total,
      categoriesCount: result.categories.length,
    });

    return NextResponse.json({
      success: true,
      data: result,
      debug: process.env.NODE_ENV === 'development' ? {
        cwd: process.cwd(),
        postsFound: result.posts.length,
      } : undefined,
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog posts',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}