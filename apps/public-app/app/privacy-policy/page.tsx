import React from 'react';
import { Metadata } from 'next';
import { generateMetadata } from '@docujourney/utils';

export const metadata: Metadata = generateMetadata({
  title: 'Privacy Policy - ImmigrantCentral',
  description: 'Learn how ImmigrantCentral protects your privacy and handles your data. Comprehensive privacy policy for our H1B analytics platform.',
  keywords: ['privacy policy', 'data protection', 'GDPR', 'privacy rights', 'H1B data'],
  type: 'website',
});

const PrivacyPolicyPage = () => {
  const lastUpdated = 'January 2025';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            At ImmigrantCentral, we are committed to protecting your privacy and ensuring transparency in how we handle data.
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-blue max-w-none">
          {/* Introduction */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              This Privacy Policy describes how ImmigrantCentral ("we", "our", or "us") handles information when you use our H1B analytics platform. We are committed to transparency and protecting user privacy while providing valuable immigration data insights.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Information We Collect</h2>
            
            <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-6">
              <p className="text-green-800 font-medium">
                ✅ We do not collect personal information. Our platform provides public H1B data analytics without requiring user accounts or personal data collection.
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Public Data We Display</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>H1B Labor Condition Application (LCA) data from the U.S. Department of Labor</li>
                  <li>Company names, job titles, and salary information from public filings</li>
                  <li>Geographic and industry-based H1B statistics</li>
                  <li>Historical H1B approval trends and analytics</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Technical Data (Anonymous)</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Basic analytics data (page views, popular searches) via Vercel Analytics</li>
                  <li>Performance metrics to improve platform speed and reliability</li>
                  <li>Error logs for technical troubleshooting (no personal information)</li>
                  <li>General usage patterns to enhance user experience</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">How We Use Data</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Public H1B Data</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Display H1B statistics and trends from official government sources</li>
                  <li>Provide salary benchmarking and market insights</li>
                  <li>Create interactive analytics dashboards</li>
                  <li>Generate search and filtering capabilities</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Platform Improvement</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Monitor platform performance and reliability</li>
                  <li>Understand popular search queries to improve features</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Ensure data accuracy and freshness</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Protection & Security */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Protection & Security</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
              <p className="text-blue-800 font-medium">
                🔒 Your security is our priority. We implement industry-standard security measures to protect your data.
              </p>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <p><strong>Encryption:</strong> All data transmission is encrypted using TLS/SSL protocols</p>
              <p><strong>Access Control:</strong> Strict authentication and authorization controls</p>
              <p><strong>Data Minimization:</strong> We only collect data necessary for our services</p>
              <p><strong>Regular Audits:</strong> Regular security assessments and vulnerability testing</p>
              <p><strong>Privacy by Design:</strong> Privacy considerations built into all our systems</p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              We work with trusted third-party services to provide you with the best experience:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-green-400 bg-green-50 p-4">
                <p><strong>Google Cloud Platform:</strong> For AI processing and data analytics</p>
              </div>
              <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                <p><strong>Firebase:</strong> For authentication and secure data storage</p>
              </div>
              <div className="border-l-4 border-purple-400 bg-purple-50 p-4">
                <p><strong>Vercel:</strong> For web analytics and performance monitoring</p>
              </div>
            </div>
            <p className="text-gray-600 mt-4 text-sm">
              These services may have their own privacy policies. We ensure all partners maintain high privacy standards.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Privacy Rights</h2>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
              <p className="text-blue-800 font-medium">
                Since we don't collect personal information, traditional data rights (access, deletion, portability) don't apply. However, you still have important rights:
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Transparency</h3>
                  <p className="text-gray-600">Clear information about what data we display and how we operate</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Data Source Verification</h3>
                  <p className="text-gray-600">All H1B data comes from official U.S. Department of Labor sources</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Contact & Feedback</h3>
                  <p className="text-gray-600">Reach out with questions or concerns about our privacy practices</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies & Analytics */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Cookies & Analytics</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your experience and analyze platform usage:
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-700"><strong>Essential Cookies:</strong> Required for platform functionality</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700"><strong>Analytics Cookies:</strong> Help us understand usage patterns</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-gray-700"><strong>Performance Cookies:</strong> Monitor and improve platform performance</span>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Us</h2>
            <p className="text-gray-700 mb-6">
              Have questions about this Privacy Policy or want to exercise your privacy rights? We're here to help.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-3">Privacy Questions</h3>
                <p className="text-gray-600 mb-2">Email: support@usimmigrantcentral.com</p>
                <p className="text-gray-600">For privacy-related inquiries</p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-3">General Support</h3>
                <p className="text-gray-600 mb-2">Email: support@usimmigrantcentral.com</p>
                <p className="text-gray-600">For platform questions and feedback</p>
              </div>
            </div>
          </section>

          {/* Legal Compliance */}
          <section className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Legal Compliance</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Privacy Regulations:</strong> While we don't collect personal data, we respect privacy principles from GDPR, CCPA, and other regulations.
              </p>
              <p>
                <strong>Public Data Usage:</strong> All H1B data displayed is from official government sources and is publicly available information.
              </p>
              <p>
                <strong>Age Requirements:</strong> Our platform is designed for general audiences. We do not target or knowingly collect information from children under 13.
              </p>
              <p>
                <strong>Data Accuracy:</strong> We strive to display accurate information from official sources but recommend verifying critical information independently.
              </p>
              <p className="text-sm text-gray-600 mt-6">
                This Privacy Policy may be updated to reflect changes in our practices or legal requirements. Updates will be posted on this page with a revised date.
              </p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;