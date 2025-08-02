# Google Analytics 4 Setup Guide

## ✅ Implementation Complete

Google Analytics 4 has been successfully integrated into the Immigrant Central platform. Here's what's been implemented:

## 🚀 Quick Setup Steps

### 1. Get Your GA4 Measurement ID
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new GA4 property for "Immigrant Central"
3. Copy your Measurement ID (format: G-XXXXXXXXXX)

### 2. Configure Environment Variable
Add your Measurement ID to your environment variables:

```bash
# In .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Deploy & Verify
- Deploy your changes
- Visit your site and check Google Analytics Real-Time reports
- Events should start appearing within minutes

## 📊 What's Being Tracked

### Automatic Events:
- **Page Views**: Every page visit
- **Session Duration**: How long users stay
- **Bounce Rate**: Single-page sessions
- **Geographic Data**: Where users are located
- **Device Information**: Desktop/mobile usage

### Custom H1B Events:
- **Company Views**: `view_company_profile`
  - Company name, total applications, approval rate, average salary
- **Job Searches**: `search_h1b_jobs`
  - Search terms, results count
- **Salary Data Views**: `view_salary_data`
  - Data type (company/job/location), entity name, salary range
- **Filter Usage**: `apply_filter`
  - Filter type, filter value, results count
- **Dashboard Interactions**: `dashboard_interaction`
  - Component interactions, action types

## 🔧 Files Created/Modified

### New Files:
- `/lib/analytics.ts` - Analytics configuration and tracking functions
- `/components/GoogleAnalytics.tsx` - GA4 script component
- `/components/CookieConsent.tsx` - Cookie consent banner
- `/.env.local.example` - Environment variable template

### Modified Files:
- `/app/layout.tsx` - Added GA4 and cookie consent
- `/components/h1b-dashboard/CompanyDashboard.tsx` - Company view tracking
- `/components/h1b-dashboard/SemanticSearch.tsx` - Search tracking
- `/components/h1b-dashboard/SearchAndFilters.tsx` - Filter tracking
- `/app/privacy-policy/page.tsx` - Updated privacy policy

## 📈 Analytics Dashboard Setup

### Recommended Goals:
1. **Engagement Goal**: Users who view 3+ company pages
2. **Search Goal**: Users who perform 2+ searches
3. **Retention Goal**: Users who return within 7 days

### Custom Reports to Create:
1. **H1B Company Performance**
   - Top viewed companies
   - Average time on company pages
   - Company page bounce rates

2. **Search Analytics**
   - Most popular search terms
   - Search result effectiveness
   - Search refinement patterns

3. **User Journey**
   - Common page flows
   - Drop-off points
   - Conversion funnels

## 🍪 Privacy & Compliance

### Cookie Consent:
- ✅ Cookie banner implemented
- ✅ User choice respected (accept/decline)
- ✅ Analytics only enabled with consent
- ✅ Privacy policy updated

### GDPR/CCPA Compliance:
- Users can decline analytics cookies
- No personal data is collected
- Transparent privacy policy
- Easy to withdraw consent

## 📊 Expected Analytics Data

### Business Insights:
- **Popular H1B Companies**: Which employers get most views
- **Search Patterns**: What users are looking for
- **Geographic Interest**: Where users are located vs data they view
- **Feature Usage**: Which dashboard features are most valuable

### User Behavior:
- **Entry Points**: How users discover your platform
- **Navigation Patterns**: How users explore H1B data
- **Engagement Depth**: Time spent on different content types
- **Return Visits**: User retention and loyalty

### Performance Metrics:
- **Page Load Times**: How fast your H1B data loads
- **Search Performance**: Speed of search results
- **Mobile Usage**: Mobile vs desktop usage patterns
- **Error Tracking**: Where users encounter issues

## 🔍 Testing & Verification

### Real-Time Testing:
1. Visit your site with GA4 enabled
2. Check Google Analytics Real-Time reports
3. Perform actions (search, view companies, apply filters)
4. Verify events appear in Real-Time Events

### Event Testing:
```javascript
// Test in browser console
trackCompanyView({
  name: 'Test Company',
  totalApplications: 1000,
  approvalRate: 95.5,
  avgSalary: 120000
});
```

## 📞 Troubleshooting

### Common Issues:
1. **Events not showing**: Check measurement ID and environment variable
2. **Consent not working**: Verify cookie consent banner appears
3. **Development vs Production**: GA4 only tracks in production mode

### Debug Mode:
Add to your GA4 config for debugging:
```javascript
gtag('config', 'G-XXXXXXXXXX', {
  debug_mode: true
});
```

## 💰 Cost Analysis

### Free Tier (Current):
- ✅ 10 million events/month
- ✅ Standard reports
- ✅ Real-time data
- ✅ 14 months retention
- ✅ API access

### Your Usage Estimate:
- ~50,000 monthly users = ~500,000 events
- Well within free limits
- Room for 20x growth before hitting limits

## 🎯 Next Steps

1. **Set up GA4 property** with your measurement ID
2. **Add environment variable** and deploy
3. **Verify tracking** in Real-Time reports
4. **Create custom dashboards** for H1B insights
5. **Set up goals** for user engagement
6. **Monitor and optimize** based on data

Your H1B analytics platform now has enterprise-level analytics tracking!