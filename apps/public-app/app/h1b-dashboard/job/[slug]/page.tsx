import { JobDashboard } from '@/components/h1b-dashboard';
import { generateH1BMetadata, generateStructuredData } from '@docujourney/utils';
import JobPageClient from './JobPageClient';

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return <JobPageClient slug={slug} />;
}

function JobPageClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const jobTitle = searchParams.get('title') || 'Unknown Job';
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Update document title and meta description dynamically
    const cleanJobTitle = decodeURIComponent(jobTitle);
    document.title = `${cleanJobTitle} H1B Data - Salary & Employment Analytics | DocuJourney`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        `Comprehensive H1B visa data for ${cleanJobTitle} positions. View salary ranges, top employers, geographic distribution, and job market trends. Latest H1B employment analytics.`,
      );
    }

    // Add job-specific structured data
    const structuredData = generateStructuredData('h1b-data', { 
      title: cleanJobTitle,
      slug: slug, 
    });
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);


    setIsLoaded(true);

    return () => {
      // Cleanup scripts
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        if (script.textContent?.includes(cleanJobTitle)) {
          document.head.removeChild(script);
        }
      });
    };
  }, [jobTitle, slug]);

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-muted/30 rounded-xl animate-pulse">
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-80 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
            </div>
          </div>
          
          {/* Quick skeleton preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="p-6 border border-border rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
          
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading H1B data for {jobTitle}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO-optimized content for job page */}
      <div className="sr-only">
        <h1>{jobTitle} H1B Visa Job Data and Market Analytics</h1>
        <p>
          Comprehensive H1B visa job market data for {jobTitle} positions including salary ranges, 
          top employers, geographic distribution, employment trends, and career insights. 
          Explore detailed job market analytics for informed career decisions.
        </p>
        <div>
          <span>Keywords: {jobTitle} H1B, {jobTitle} visa jobs, {jobTitle} salary data, 
          {jobTitle} employment, H1B {jobTitle}, visa jobs {jobTitle}, job market {jobTitle}</span>
        </div>
      </div>

      <JobDashboard 
        jobSlug={slug}
        jobTitle={jobTitle}
      />
    </>
  );
}