'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { H1BRelationshipMapper, type H1BRelationship, type RelationshipContext } from '@/lib/seo/relationshipMapper';
import Link from 'next/link';

interface SmartInternalLinksProps {
  maxLinks?: number;
  minRelevanceScore?: number;
  includeTypes?: Array<'employer_jobs' | 'employer_locations' | 'job_locations' | 'job_salaries' | 'location_employers' | 'similar_jobs' | 'competitor_employers'>;
  className?: string;
}

/**
 * Smart Internal Links Component
 * Automatically discovers and displays contextually relevant H1B data links
 * Completely invisible to users while providing comprehensive internal linking for SEO
 */
export const SmartInternalLinks: React.FC<SmartInternalLinksProps> = ({
  maxLinks = 50,
  minRelevanceScore = 0.1,
  includeTypes,
  className = 'sr-only',
}) => {
  const searchParams = useSearchParams();
  const [relationships, setRelationships] = useState<H1BRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  
  // Memoize relationship mapper instance to prevent recreating on every render
  const relationshipMapper = useMemo(() => new H1BRelationshipMapper(), []);
  
  // Discover relationships when context changes
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }
    
    // Debounce mechanism to prevent excessive API calls
    const timeoutId = setTimeout(async () => {
      // Don't start new requests if already loading
      if (isLoadingRef.current) {
        return;
      }
      
      // Extract context from URL parameters
      const context: RelationshipContext = {};
      
      const employer = searchParams.get('employer');
      const job = searchParams.get('job') || searchParams.get('title');
      const city = searchParams.get('city');
      const state = searchParams.get('state');
      const year = searchParams.get('year');
      const minSalary = searchParams.get('minSalary');
      const maxSalary = searchParams.get('maxSalary');
      
      if (employer) {context.employer = employer;}
      if (job) {context.job = job;}
      if (city) {context.city = city;}
      if (state) {context.state = state;}
      if (year) {context.year = year;}
      if (minSalary && maxSalary) {
        context.salaryRange = [parseInt(minSalary), parseInt(maxSalary)];
      }
      
      // Only fetch if we have meaningful context
      if (!context.employer && !context.job && !context.city && !context.state && !context.salaryRange) {
        setRelationships([]);
        return;
      }
      
      isLoadingRef.current = true;
      setIsLoading(true);
      try {
        const discoveredRelationships = await relationshipMapper.discoverRelationships(context);
        
        // Filter by types if specified
        const filteredRelationships = includeTypes
          ? discoveredRelationships.filter(rel => includeTypes.includes(rel.type))
          : discoveredRelationships;
        
        // Filter by relevance score and limit
        const qualifiedRelationships = filteredRelationships
          .map(rel => ({
            ...rel,
            targets: rel.targets.filter(target => target.relevanceScore >= minRelevanceScore),
          }))
          .filter(rel => rel.targets.length > 0);
        
        setRelationships(qualifiedRelationships);
      } catch (error) {
        console.warn('Failed to discover relationships:', error);
        setRelationships([]);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    }, 300); // 300ms debounce delay

    // Cleanup timeout on component unmount or dependency change
    return () => clearTimeout(timeoutId);
  }, [searchParams, maxLinks, minRelevanceScore, includeTypes, relationshipMapper]);
  
  // Generate internal link URLs
  const generateLinkUrl = (target: H1BRelationship['targets'][0]): string => {
    const baseUrl = '/h1b-dashboard';
    
    switch (target.type) {
      case 'employer':
        return `${baseUrl}/company/${target.slug}`;
      case 'job':
        return `${baseUrl}/job/${target.slug}`;
      case 'location':
        return `${baseUrl}/city/${target.slug}`;
      default:
        return baseUrl;
    }
  };
  
  // Generate contextual link text
  const generateLinkText = (target: H1BRelationship['targets'][0], relationship: H1BRelationship): string => {
    switch (relationship.type) {
      case 'employer_jobs':
        return relationship.source.type === 'employer'
          ? `${target.name} jobs at ${relationship.source.name}`
          : `${relationship.source.name} positions at ${target.name}`;
      case 'employer_locations':
        return `${relationship.source.name} offices in ${target.name}`;
      case 'job_locations':
        return `${relationship.source.name} jobs in ${target.name}`;
      case 'location_employers':
        return `${target.name} H1B jobs in ${relationship.source.name}`;
      case 'similar_jobs':
        return `${target.name} (similar to ${relationship.source.name})`;
      case 'competitor_employers':
        return `${target.name} (similar to ${relationship.source.name})`;
      default:
        return target.name;
    }
  };
  
  // Don't render if no relationships or still loading
  if (isLoading || relationships.length === 0) {
    return null;
  }
  
  // Flatten all targets with their relationship context
  const allLinks = relationships.flatMap(rel =>
    rel.targets.map(target => ({
      ...target,
      relationshipType: rel.type,
      relationshipObj: rel,
      relationshipDescription: target.relationship,
      linkText: generateLinkText(target, rel),
      url: generateLinkUrl(target),
    })),
  );
  
  // Sort by relevance and limit
  const topLinks = allLinks
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxLinks);
  
  return (
    <nav className={className} aria-hidden="true">
      <h3>Related H1B Data</h3>
      
      {/* Employer-related links */}
      {relationships.some(rel => rel.type === 'employer_jobs' || rel.type === 'employer_locations') && (
        <section>
          <h4>Employer Analysis</h4>
          <ul>
            {topLinks
              .filter(link => ['employer_jobs', 'employer_locations', 'competitor_employers'].includes(link.relationshipType))
              .slice(0, 15)
              .map((link, index) => (
                <li key={`employer-${index}`}>
                  <Link href={link.url} title={link.relationshipDescription}>
                    {link.linkText}
                  </Link>
                  <span className="relevance-score" data-score={link.relevanceScore.toFixed(2)}>
                    ({link.relationshipDescription})
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}
      
      {/* Job-related links */}
      {relationships.some(rel => rel.type === 'job_locations' || rel.type === 'similar_jobs') && (
        <section>
          <h4>Job Market Analysis</h4>
          <ul>
            {topLinks
              .filter(link => ['job_locations', 'similar_jobs', 'job_salaries'].includes(link.relationshipType))
              .slice(0, 15)
              .map((link, index) => (
                <li key={`job-${index}`}>
                  <Link href={link.url} title={link.relationshipDescription}>
                    {link.linkText}
                  </Link>
                  <span className="relevance-score" data-score={link.relevanceScore.toFixed(2)}>
                    ({link.relationshipDescription})
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}
      
      {/* Location-related links */}
      {relationships.some(rel => rel.type === 'location_employers') && (
        <section>
          <h4>Geographic Distribution</h4>
          <ul>
            {topLinks
              .filter(link => ['location_employers'].includes(link.relationshipType))
              .slice(0, 10)
              .map((link, index) => (
                <li key={`location-${index}`}>
                  <Link href={link.url} title={link.relationshipDescription}>
                    {link.linkText}
                  </Link>
                  <span className="relevance-score" data-score={link.relevanceScore.toFixed(2)}>
                    ({link.relationshipDescription})
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}
      
      {/* Cross-category links for comprehensive coverage */}
      <section>
        <h4>Comprehensive H1B Analysis</h4>
        <ul>
          <li>
            <Link href="/h1b-dashboard/employers" title="Browse all H1B sponsoring employers">
              H1B Sponsoring Employers Database
            </Link>
          </li>
          <li>
            <Link href="/h1b-dashboard/jobs" title="Browse all H1B job titles">
              H1B Job Titles and Salaries
            </Link>
          </li>
          <li>
            <Link href="/h1b-dashboard/cities" title="Browse H1B data by location">
              H1B Jobs by City and State
            </Link>
          </li>
          <li>
            <Link href="/h1b-dashboard/attorneys" title="Browse H1B immigration attorneys">
              H1B Immigration Attorneys
            </Link>
          </li>
          {searchParams.get('employer') && (
            <li>
              <Link 
                href={`/h1b-dashboard?employer=${encodeURIComponent(searchParams.get('employer')!)}`}
                title={`All H1B data for ${searchParams.get('employer')}`}
              >
                Complete {searchParams.get('employer')} H1B Analysis
              </Link>
            </li>
          )}
          {searchParams.get('job') && (
            <li>
              <Link 
                href={`/h1b-dashboard?job=${encodeURIComponent(searchParams.get('job')!)}`}
                title={`All H1B data for ${searchParams.get('job')} positions`}
              >
                Complete {searchParams.get('job')} Market Analysis
              </Link>
            </li>
          )}
        </ul>
      </section>
      
      {/* Schema markup for the internal linking structure */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Related H1B Data Points',
            description: 'Contextually relevant H1B visa data and analysis',
            numberOfItems: topLinks.length,
            itemListElement: topLinks.slice(0, 20).map((link, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'WebPage',
                name: link.linkText,
                url: `https://usimmigrantcentral.com${link.url}`,
                description: link.relationshipDescription,
                about: {
                  '@type': link.type === 'employer' ? 'Organization' : 
                          link.type === 'job' ? 'Occupation' : 
                          link.type === 'location' ? 'Place' : 'Thing',
                  name: link.name,
                },
              },
            })),
          }),
        }}
      />
    </nav>
  );
};

/**
 * Specialized component for employer-focused internal links
 */
export const EmployerInternalLinks: React.FC<Omit<SmartInternalLinksProps, 'includeTypes'>> = (props) => (
  <SmartInternalLinks 
    {...props} 
    includeTypes={['employer_jobs', 'employer_locations', 'competitor_employers']}
  />
);

/**
 * Specialized component for job-focused internal links
 */
export const JobInternalLinks: React.FC<Omit<SmartInternalLinksProps, 'includeTypes'>> = (props) => (
  <SmartInternalLinks 
    {...props} 
    includeTypes={['employer_jobs', 'job_locations', 'similar_jobs']}
  />
);

/**
 * Specialized component for location-focused internal links
 */
export const LocationInternalLinks: React.FC<Omit<SmartInternalLinksProps, 'includeTypes'>> = (props) => (
  <SmartInternalLinks 
    {...props} 
    includeTypes={['location_employers', 'job_locations']}
  />
);