import { NextResponse } from 'next/server';
import { getAllPosts, getCategories } from '@/lib/blog/content';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateAtomEntry(post: any, baseUrl: string, category?: any): string {
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const published = new Date(post.date).toISOString();
  const updated = new Date(post.updated || post.date).toISOString();
  
  return `
  <entry>
    <id>${postUrl}</id>
    <title type="text">${escapeXml(post.title)}</title>
    <link href="${postUrl}" rel="alternate" type="text/html"/>
    <published>${published}</published>
    <updated>${updated}</updated>
    <author>
      <name>US Immigrant Central Team</name>
      <email>team@usimmigrantcentral.com</email>
    </author>
    <summary type="text">${escapeXml(post.excerpt)}</summary>
    <content type="html"><![CDATA[${post.content || post.excerpt}]]></content>
    ${category ? `<category term="${escapeXml(category.slug)}" label="${escapeXml(category.name)}"/>` : ''}
    ${post.tags?.map((tag: string) => `<category term="${escapeXml(tag.toLowerCase().replace(/\s+/g, '-'))}" label="${escapeXml(tag)}"/>`).join('') || ''}
  </entry>
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

    // Get the most recent update time
    const lastUpdated = sortedPosts.length > 0
      ? new Date(sortedPosts[0].updated || sortedPosts[0].date).toISOString()
      : new Date().toISOString();

    // Generate Atom entries
    const atomEntries = sortedPosts.map(post => {
      const category = categories.find(c => c.slug === post.category?.slug);
      return generateAtomEntry(post, baseUrl, category);
    }).join('\n');

    // Generate the full Atom feed
    const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${baseUrl}/blog</id>
  <title>US Immigrant Central Blog</title>
  <subtitle>Expert insights on H1B visas, immigration processes, and US work authorization</subtitle>
  <link href="${baseUrl}/blog/atom.xml" rel="self" type="application/atom+xml"/>
  <link href="${baseUrl}/blog" rel="alternate" type="text/html"/>
  <updated>${lastUpdated}</updated>
  <author>
    <name>US Immigrant Central Team</name>
    <email>team@usimmigrantcentral.com</email>
    <uri>${baseUrl}</uri>
  </author>
  <rights>Copyright © ${new Date().getFullYear()} US Immigrant Central</rights>
  <generator uri="${baseUrl}" version="1.0">US Immigrant Central Blog System</generator>
  <icon>${baseUrl}/favicon.ico</icon>
  <logo>${baseUrl}/logo.png</logo>
  ${atomEntries}
</feed>`;

    return new NextResponse(atomFeed, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error generating Atom feed:', error);
    return new NextResponse('Error generating Atom feed', { status: 500 });
  }
}