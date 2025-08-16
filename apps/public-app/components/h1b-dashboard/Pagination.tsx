'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@docujourney/ui';

interface SearchParams {
  search?: string;
  industry?: string;
  state?: string;
  minSalary?: number;
  maxSalary?: number;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: SearchParams;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}: PaginationProps) {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Maximum number of page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Remove scrolling behavior - let user stay where they are
  const handleClick = (e: React.MouseEvent) => {
    // Prevent any default scrolling behavior
    e.stopPropagation();
  };

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    
    // Add page param if not page 1
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    // Add search params
    if (searchParams.search) {
      params.set('search', searchParams.search);
    }
    if (searchParams.industry) {
      params.set('industry', searchParams.industry);
    }
    if (searchParams.state) {
      params.set('state', searchParams.state);
    }
    if (searchParams.minSalary !== undefined) {
      params.set('minSalary', searchParams.minSalary.toString());
    }
    if (searchParams.maxSalary !== undefined) {
      params.set('maxSalary', searchParams.maxSalary.toString());
    }
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center space-x-2 mt-8 mb-8" aria-label="Pagination">
      {/* First page button */}
      <Link 
        href={getPageUrl(1)}
        scroll={false}
        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
        onClick={handleClick}
      >
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage === 1}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </Link>

      {/* Previous page button */}
      <Link 
        href={getPageUrl(Math.max(1, currentPage - 1))}
        scroll={false}
        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
        onClick={handleClick}
      >
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </Link>

      {/* Page numbers */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Link
              key={pageNum}
              href={getPageUrl(pageNum)}
              scroll={false}
              onClick={handleClick}
            >
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={`min-w-[40px] ${isActive ? 'font-semibold' : ''}`}
                aria-label={`Go to page ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Next page button */}
      <Link 
        href={getPageUrl(Math.min(totalPages, currentPage + 1))}
        scroll={false}
        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
        onClick={handleClick}
      >
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>

      {/* Last page button */}
      <Link 
        href={getPageUrl(totalPages)}
        scroll={false}
        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
        onClick={handleClick}
      >
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </Link>
    </nav>
  );
}

// Page info component - Client component for locale formatting
interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

export function PaginationInfo({ currentPage, totalPages, totalCount, limit }: PaginationInfoProps) {
  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, totalCount);

  // Use consistent number formatting to avoid hydration mismatches
  const formatNumber = (num: number) => num.toLocaleString('en-US');

  return (
    <div className="text-sm text-gray-600 text-center mb-4">
      Showing <span className="font-semibold">{formatNumber(start)}</span> to{' '}
      <span className="font-semibold">{formatNumber(end)}</span> of{' '}
      <span className="font-semibold">{formatNumber(totalCount)}</span> H1B sponsor companies
    </div>
  );
}