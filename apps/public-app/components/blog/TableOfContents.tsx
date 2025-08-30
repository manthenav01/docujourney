'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { List, ChevronDown, ChevronRight } from 'lucide-react';

interface TableOfContentsProps {
  content: string;
}

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    // Wait for DOM to be ready, then extract headings from actual rendered content
    const extractHeadings = () => {
      const headings = document.querySelectorAll('.blog-content h2, .blog-content h3, .blog-content h4');
      
      const items: TOCItem[] = [];
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName[1]);
        const title = heading.textContent || '';
        let id = heading.id;
        
        // Generate ID if heading doesn't have one (use same logic as marked.js)
        if (!id) {
          id = title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
          heading.id = id;
        }
        
        items.push({ id, title, level });
      });
      
      setTocItems(items);
    };

    // Try to extract headings immediately
    extractHeadings();
    
    // Also try after a small delay in case content is still loading
    const timer = setTimeout(extractHeadings, 100);
    
    return () => clearTimeout(timer);
  }, [content]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
      });
      // Auto-close the TOC after clicking a link
      setIsCollapsed(true);
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 sticky top-4 max-h-[calc(100vh-2rem)] overflow-hidden">
      <CardHeader 
        className="pb-3 cursor-pointer flex-shrink-0" 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Table of Contents
          </div>
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CardTitle>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="pt-0 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <nav className="space-y-2">
            {tocItems.map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToHeading(item.id)}
                className={`
                  block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors
                  ${item.level === 2 ? 'font-medium text-gray-900' : ''}
                  ${item.level === 3 ? 'text-gray-700 ml-4' : ''}
                  ${item.level === 4 ? 'text-gray-600 ml-8' : ''}
                `}
              >
                {item.title}
              </button>
            ))}
          </nav>
        </CardContent>
      )}
    </Card>
  );
}

TableOfContents.displayName = 'TableOfContents';