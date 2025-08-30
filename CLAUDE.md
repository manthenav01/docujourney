# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Data Import Pipeline
```bash
npm run cleanup:employer-data  # Clean H1B Excel data using Python
npm run import:data           # Import all cleaned data to Firestore
npm run import:employers      # Import only employer data
npm run import:jobs          # Import only job/LCA data
npm run import:worksites     # Import only worksite data
npm run import:test          # Test Firebase connection
npm run import:sample        # Create sample data for testing
```

### BigQuery Data Upload Pipeline
```bash
# Upload to default project (doctracker-b4528)
python scripts/data_pipeline.py --year-folder 2024

# Upload to specific project (e.g., immigrant-central-test)
python scripts/data_pipeline.py --year-folder 2024 --project-id immigrant-central-test

# Process specific files
python scripts/data_pipeline.py --files path/to/file1.xlsx path/to/file2.xlsx

# Test without uploading
python scripts/data_pipeline.py --year-folder 2023 --no-upload

# List available data files
python scripts/data_pipeline.py --list-files
```

### Python Data Processing
```bash
.venv/bin/python scripts/employer-data-cleanup.py  # Direct Python execution
```

## Architecture Overview

### Core Application Structure
- **Next.js 14** with App Router and TypeScript
- **Firebase** for authentication, Firestore database, and file storage
- **Genkit AI** integration for visa status analysis using Gemini 1.5 Flash
- **Google BigQuery** for H1B data analytics and visualization
- **Tailwind CSS** with Shadcn/UI components for styling

### Key Features
1. **Document Management System** - Upload, verify, and organize immigration documents
2. **Profile Management** - Multi-user support with relationship tracking
3. **Visa Status Analysis** - AI-powered document analysis using Genkit
4. **H1B Data Dashboard** - Interactive analytics from BigQuery datasets
5. **Timeline Generation** - Visual timeline of visa journey

### Data Flow Architecture
```
Frontend (Next.js) → API Routes → Firebase (Auth/Firestore/Storage)
                                → Genkit AI (Document Analysis)
                                → BigQuery (H1B Analytics)
```

### Authentication & Security
- Firebase Authentication with Google sign-in
- Row-level security based on user profiles
- Secure file storage with access controls
- Cross-origin policies configured for Firebase Auth popups

## Important Technical Details

### Firebase Configuration
- Project ID: `doctracker-b4528`
- Authentication, Firestore, and Storage enabled
- Service account key required for admin operations: `serviceAccountKey.json`

### Genkit AI Integration
- Uses Gemini 1.5 Flash for document analysis
- Privacy-first: only document types and dates sent to AI, no personal info
- Automatic visa status analysis triggered after document verification
- Environment variable required: `GOOGLE_GENAI_API_KEY`

### Data Processing Pipeline
1. **Raw H1B Data** (Excel files) → **Python Cleanup** → **CSV Files** → **Node.js Import** → **Firestore**
2. Python scripts handle data validation, deduplication, and normalization
3. Node.js scripts batch import to Firestore collections: `employers`, `jobs`, `worksites`

### Component Architecture
- **Shadcn/UI** components in `components/ui/`
- **Feature-specific** components in `components/` (organized by functionality)
- **Reusable hooks** in `hooks/` and `components/hooks/`
- **Type definitions** in `lib/types/`

### API Routes Structure
- `/api/analyzeVisaStatus` - AI-powered visa status analysis
- `/api/h1b-data` - BigQuery data endpoints
- `/api/generateTimeline` - Timeline generation
- Document management APIs (create, update, delete)

### Key Libraries & Frameworks
- **React Hook Form** with **Zod** for form validation
- **Recharts** for data visualization
- **D3.js** for advanced chart components
- **Lucide React** for icons
- **Sonner** for toast notifications

## Development Workflow

### Adding New Features
1. Create components in appropriate directories (`components/` or `components/ui/`)
2. Add API routes in `app/api/` following existing patterns
3. Update type definitions in `lib/types/`
4. Use existing Firebase services in `lib/`

### UX Design Consistency Guidelines
**CRITICAL**: Always follow existing UX patterns when implementing new features.

#### Card Component Standards
- **Structure**: Always use `Card`, `CardHeader`, `CardTitle`, `CardContent` from `@docujourney/ui`
- **Card Classes**: Apply `className="w-full"` to all Card components
- **Title Format**: Use `className="text-lg font-semibold flex items-center"` for CardTitle
- **Icons**: Include Lucide React icons with `className="w-5 h-5 mr-2"` (e.g., `Scale`, `CheckCircle`, `TrendingUp`)
- **Memory Optimization**: Wrap components with `React.memo()` and set `displayName`
- **Data Processing**: Use `useMemo()` for expensive calculations and data transformations

#### List Item Pattern (REQUIRED)
- **Container**: Use `space-y-2` for list spacing in CardContent
- **Item Structure**: Each item must follow this pattern:
  ```tsx
  <Link
    href="/path/to/detail"
    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
  >
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
        {index + 1}
      </div>
      <div>
        <div className="font-medium text-foreground">{primaryText}</div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{metric1}</span>
          <span className="text-sm text-muted-foreground/60">•</span>
          <span className="text-sm text-muted-foreground">{metric2}</span>
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="font-semibold text-foreground">{primaryMetric}</div>
      <div className="text-xs text-muted-foreground">{metricLabel}</div>
    </div>
  </Link>
  ```

#### Loading States Pattern (REQUIRED)
- **Structure**: Use exact same Card structure as main component
- **Loading Items**: Create exactly 5 skeleton items using `[...Array(5)].map((_, index) => ...)`
- **Skeleton Pattern**:
  ```tsx
  <div key={index} className="flex items-center justify-between animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-6 h-6 bg-muted rounded-full"></div>
      <div className="h-4 bg-muted rounded w-48"></div>
    </div>
    <div className="h-4 bg-muted rounded w-16"></div>
  </div>
  ```

#### Empty States Pattern (REQUIRED)
- **Container**: Use `flex items-center justify-center h-32`
- **Message**: Simple text with `text-muted-foreground` class
- **No Icons**: Don't include large placeholder icons in empty states

#### Typography & Formatting
- **Numbers**: Always use `formatNumber()` function with `toLocaleString()`
- **Currency**: Use compact format (`$XXK`, `$X.XM`) via `formatSalary()` function  
- **Percentages**: Display to 1 decimal place using `toFixed(1)` (e.g., `95.5%`)
- **Primary Text**: Use `font-medium text-foreground` for main item names
- **Secondary Text**: Use `text-sm text-muted-foreground` for metrics
- **Text Truncation**: Limit primary text to ~35 characters with ellipsis

#### Component Structure Requirements
- **Exports**: Always export as `React.memo(ComponentFunction)`
- **Display Name**: Set `ComponentFunction.displayName = 'ComponentName'`
- **Props Interface**: Name as `ComponentNameProps`
- **Data Processing**: Use `useMemo()` for data transformations
- **Show Top 5**: Default to showing 5 items maximum in lists

**Example Reference**: Use `TopAttorneysCard.tsx` as the definitive pattern for all ranking/list cards.

### Working with H1B Data
1. Place raw Excel files in `scripts/data/2025-q2/`
2. Run cleanup: `npm run cleanup:employer-data`
3. Import to Firestore: `npm run import:data`
4. BigQuery service available in `lib/h1bBigQueryService.ts`

### AI Integration
- Genkit configuration in `lib/genkitConfig.ts`
- Document analysis logic in `lib/visaStatusUtils.ts`
- Triggers in `lib/timelineTriggers.ts`

### Testing & Validation
- Use `npm run import:test` to verify Firebase connection
- Use `npm run import:sample` for testing with sample data
- Check Firestore console for data validation
- Test AI responses with different document combinations

## File Organization Patterns

### Page Structure (App Router)
- `app/(auth)/` - Protected routes requiring authentication
- `app/api/` - API route handlers
- `app/docs/[slug]/` - Dynamic documentation pages

### Component Organization
- Group related components in subdirectories
- Use `index.ts` files for clean imports
- Separate business logic into custom hooks
- Keep UI components pure and reusable

### Configuration Files
- `next.config.js` - WebAssembly support, CORS headers for Firebase
- `tailwind.config.js` - Custom styling configuration
- `tsconfig.json` - TypeScript with path mapping (`@/*`)