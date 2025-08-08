/**
 * SEO Components Export Index
 * Centralized exports for all SEO-related components and utilities
 */

// Chart schema components
export { 
  ChartSchemaWrapper, 
  SalaryChartSchema, 
  TrendChartSchema, 
  DistributionChartSchema,
  useChartSchema, 
} from './ChartSchemaWrapper';

// Smart internal linking
export { 
  SmartInternalLinks,
  EmployerInternalLinks,
  JobInternalLinks,
  LocationInternalLinks, 
} from './SmartInternalLinks';

// Contextual navigation
export {
  ContextualNavigation,
  EmployerNavigation,
  JobNavigation,
  LocationNavigation,
} from './ContextualNavigation';

// Schema types
export type { ChartSchemaConfig } from '../../lib/schema/chartSchema';
export type { OrganizationSchemaConfig } from '../../lib/schema/organizationSchema';
export type { OccupationSchemaConfig } from '../../lib/schema/occupationSchema';
export type { PlaceSchemaConfig } from '../../lib/schema/placeSchema';
export type { DatasetConfig } from '../../lib/schema/datasetSchema';
export type { VisualArtworkConfig } from '../../lib/schema/visualArtworkSchema';

// SEO utilities
export type { SEOContext } from '../../lib/seo-utils';
export { 
  generateContextualSchema,
  generateContextualTitle,
  generateContextualDescription,
  generateContextualKeywords,
  generateCanonicalUrl,
  injectSchemaMarkup,
  updatePageMetadata,
} from '../../lib/seo-utils';

// Relationship mapping
export type { H1BRelationship, RelationshipContext } from '../../lib/seo/relationshipMapper';
export { H1BRelationshipMapper } from '../../lib/seo/relationshipMapper';