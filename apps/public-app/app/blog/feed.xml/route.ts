import { NextResponse } from 'next/server';
import { getAllPosts, getCategories } from '@/lib/blog/content';
import { formatDate } from '@/lib/blog/utils';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRSSItem(post: any, baseUrl: string, category?: any): string {
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const pubDate = new Date(post.date).toUTCString();
  
  // Extract plain text from HTML content for description
  const plainTextContent = post.content
    ? post.content.replace(/<[^>]*>/g, '').substring(0, 300) + '...'
    : post.excerpt;

  return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <content:encoded><![CDATA[${post.content || post.excerpt}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      ${category ? `<category>${escapeXml(category.name)}</category>` : ''}
      ${post.tags?.map((tag: string) => `<category>${escapeXml(tag)}</category>`).join('') || ''}
      <dc:creator>US Immigrant Central Team</dc:creator>
    </item>
  `.trim();
}

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.usimmigrantcentral.com';
    const [posts, categories] = await Promise.all([
      getAllPosts(),
      getCategories(),
    ]);

    // Sort posts by date (newest first)
    const sortedPosts = posts.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Generate RSS items
    const rssItems = sortedPosts.map(post => {
      const category = categories.find(c => c.slug === post.category?.slug);
      return generateRSSItem(post, baseUrl, category);
    }).join('\n');

    // Generate the full RSS feed
    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  <channel>
    <title>US Immigrant Central Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Expert insights on H1B visas, immigration processes, and US work authorization. Stay informed with the latest updates and guidance.</description>
    <language>en-US</language>
    <copyright>Copyright © ${new Date().getFullYear()} US Immigrant Central</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <sy:updatePeriod>daily</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <generator>US Immigrant Central Blog System</generator>
    <managingEditor>team@usimmigrantcentral.com (US Immigrant Central Team)</managingEditor>
    <webMaster>tech@usimmigrantcentral.com (US Immigrant Central Tech Team)</webMaster>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>US Immigrant Central Blog</title>
      <link>${baseUrl}/blog</link>
      <width>144</width>
      <height>144</height>
    </image>
    ${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}