import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostWithRelated } from '@/lib/blog/content';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog slug is required',
        },
        { status: 400 },
      );
    }

    const post = await getBlogPostWithRelated(slug);

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog post',
      },
      { status: 500 },
    );
  }
}