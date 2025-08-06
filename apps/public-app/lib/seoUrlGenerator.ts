// Generate SEO-friendly URLs for different scenarios
export const generateSEOUrls = () => {
  const baseUrl = 'https://usimmigrantcentral.com/h1b-dashboard';
  
  // High-value search scenarios with clean URLs
  return {
    // Salary-focused URLs
    softwareEngineerSalary: `${baseUrl}?job=software-engineer&title=Software%20Engineer`,
    dataScientistSalary: `${baseUrl}?job=data-scientist&title=Data%20Scientist`,
    financialAnalystSalary: `${baseUrl}?job=financial-analyst&title=Financial%20Analyst`,
    architectSalary: `${baseUrl}?job=architect&title=Architect`,
    
    // Company-focused URLs  
    googleH1B: `${baseUrl}?employer=Google%20LLC`,
    microsoftH1B: `${baseUrl}?employer=Microsoft%20Corporation`,
    amazonH1B: `${baseUrl}?employer=Amazon.com%20Inc`,
    metaH1B: `${baseUrl}?employer=Meta%20Platforms%20Inc`,
    galeCengageH1B: `${baseUrl}?employer=Gale%20Cengage%20Learning`,
    
    // Location-focused URLs
    sanFranciscoH1B: `${baseUrl}?city=San%20Francisco&state=CA`,
    seattleH1B: `${baseUrl}?city=Seattle&state=WA`,
    austinH1B: `${baseUrl}?city=Austin&state=TX`,
    newYorkH1B: `${baseUrl}?city=New%20York&state=NY`,
    
    // Trend-focused URLs
    h1bTrends2025: `${baseUrl}?year=2025&trend=approval-rates`,
    h1bTrends2024: `${baseUrl}?year=2024&trend=salary-trends`,
    
    // Industry-specific
    techH1B: `${baseUrl}?industry=technology`,
    financeH1B: `${baseUrl}?industry=finance`,
    consultingH1B: `${baseUrl}?industry=consulting`,
  };
};

// Generate sitemap entries for these URLs
export const getSEOSitemapEntries = () => {
  const urls = generateSEOUrls();
  
  return Object.entries(urls).map(([key, url]) => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
};