# DocuJourney Monorepo Architecture

This project has been restructured into a monorepo with separate deployable applications for public (non-auth) and authentication-required features.

## 🏗️ Architecture Overview

```
docujourney/
├── apps/
│   ├── public-app/          # Non-auth app (Landing + H1B Dashboard)
│   └── auth-app/            # Auth app (Document Management)
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── utils/               # Shared utilities
│   └── config/              # Shared configurations
└── scripts/                 # Data processing scripts (shared)
```

## 🚀 Applications

### **Public App** (`apps/public-app/`)
- **Purpose**: Public-facing features that don't require authentication
- **Features**:
  - Landing page
  - H1B Dashboard and analytics
  - Company/job/city pages
  - Semantic search
- **Port**: 3000
- **Deployment**: Static/Edge (Vercel, Netlify)

### **Auth App** (`apps/auth-app/`)  
- **Purpose**: Authentication-required document management features
- **Features**:
  - User authentication
  - Document upload/management
  - Profile management
  - Visa status analysis
  - Timeline generation
- **Port**: 3001
- **Deployment**: Full Node.js (Vercel, Railway)

## 📦 Shared Packages

### **@docujourney/ui**
- Shadcn/UI components
- Shared styling and themes
- Common UI patterns

### **@docujourney/utils**
- SEO utilities
- Common helper functions
- Shared business logic

### **@docujourney/config**
- Tailwind configuration
- TypeScript configuration
- Build configurations

## 🔧 Development

### **Install Dependencies**
```bash
npm install
```

### **Development Commands**
```bash
# Start public app (landing + H1B dashboard)
npm run dev:public

# Start auth app (document management)  
npm run dev:auth

# Start both apps simultaneously
npm run dev:public & npm run dev:auth
```

### **Build Commands**
```bash
# Build both apps
npm run build

# Build specific apps
npm run build:public
npm run build:auth
```

### **Deployment**

#### **Public App Deployment**
```bash
cd apps/public-app
npm run build
npm run start
```

#### **Auth App Deployment**
```bash  
cd apps/auth-app
npm run build
npm run start
```

## 🔀 Migration Notes

### **What Changed**
1. **Separated Applications**: Auth and non-auth features are now separate deployable apps
2. **Shared Components**: UI components moved to `packages/ui` 
3. **Shared Utilities**: Common utilities moved to `packages/utils`
4. **Independent Scaling**: Each app can be deployed and scaled independently

### **Import Path Changes**
- UI components: `@/components/ui/button` → `@docujourney/ui`
- Utils: `@/lib/utils` → `@docujourney/utils`
- SEO: `@/lib/seo` → `@docujourney/utils/seo`

### **Environment Variables**
Each app needs its own environment configuration:

**Public App** requires:
- `GOOGLE_CLOUD_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS`

**Auth App** requires:
- All Firebase configuration
- Genkit AI configuration  
- Document processing keys

## 🎯 Benefits

1. **Separate Deployments**: Deploy public features without auth complexity
2. **Independent Scaling**: Scale each app based on usage patterns
3. **Faster Builds**: Smaller app-specific builds
4. **Security**: Auth features isolated from public app
5. **Code Sharing**: No duplication of UI components and utilities

## 📝 Next Steps

1. **Deploy Public App**: Can be deployed immediately for H1B dashboard
2. **Continue Auth Development**: Auth app remains in development
3. **Environment Setup**: Configure separate environment variables for each app
4. **Domain Routing**: Set up subdomain or path-based routing if needed

## 🔍 Troubleshooting

### **Build Issues**
- Ensure `npm install` is run in the root directory
- Check that shared packages are properly linked via workspaces
- Verify import paths are updated correctly

### **Development Issues**
- Make sure ports 3000 and 3001 are available
- Check that shared packages are being resolved correctly
- Verify TypeScript paths configuration

This architecture provides complete separation while maintaining code reusability and development efficiency.