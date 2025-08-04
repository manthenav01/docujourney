import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { generateMetadata } from '@docujourney/utils';
import { Button } from '@docujourney/ui';
import { DashboardHeader } from '../../components/h1b-dashboard/DashboardHeader';
import { DashboardFooter } from '../../components/h1b-dashboard/DashboardFooter';

export const metadata: Metadata = generateMetadata({
  title: 'Terms of Service - ImmigrantCentral',
  description: 'Terms of Service and User Agreement for ImmigrantCentral H1B analytics platform. Learn about data usage, limitations, and your rights.',
  keywords: ['terms of service', 'user agreement', 'H1B data', 'legal terms', 'platform usage'],
  type: 'website',
  path: '/terms-of-service',
});

const TermsOfServicePage = () => {
  const lastUpdated = 'January 2025';
  const effectiveDate = 'January 2025';

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <DashboardHeader />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Welcome to ImmigrantCentral. These terms govern your use of our H1B analytics platform and services.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Last updated: {lastUpdated}
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Effective: {effectiveDate}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-blue max-w-none">
          {/* Introduction & Acceptance */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
              <p className="text-blue-800 font-medium">
                By accessing or using ImmigrantCentral, you agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              ImmigrantCentral ("we", "our", or "us") provides H1B visa analytics and immigration data insights through our platform. 
              These Terms of Service ("Terms") create a legally binding agreement between you ("User", "you", or "your") and ImmigrantCentral.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you do not agree to these Terms, please do not use our services. We may update these Terms from time to time, 
              and your continued use constitutes acceptance of any changes.
            </p>
          </section>

          {/* Service Description */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Services</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">H1B Data Analytics</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Interactive dashboards with H1B statistics and trends</li>
                  <li>Employer-specific H1B application data and analytics</li>
                  <li>Salary benchmarking and compensation insights</li>
                  <li>Geographic and industry-based H1B analysis</li>
                  <li>Historical H1B approval and filing trends</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Data Sources & Coverage</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Official U.S. Department of Labor (DOL) LCA data</li>
                  <li>USCIS H1B approval statistics and trends</li>
                  <li>Comprehensive coverage from 2016-2025</li>
                  <li>Regular data updates and refreshes</li>
                  <li>Advanced search and filtering capabilities</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Usage & Accuracy */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Usage & Accuracy</h2>
            
            <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-6">
              <p className="text-green-800 font-medium">
                ✅ All H1B data displayed on our platform is derived from official U.S. government sources and is publicly available information.
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Data Sources & Reliability</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Primary Source:</strong> U.S. Department of Labor Labor Condition Application (LCA) disclosures</li>
                  <li><strong>Data Processing:</strong> We clean, normalize, and analyze raw government data for better insights</li>
                  <li><strong>Regular Updates:</strong> Data is refreshed regularly to reflect the latest government releases</li>
                  <li><strong>Historical Coverage:</strong> Comprehensive data spanning multiple fiscal years (2016-2025)</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                <h4 className="text-lg font-medium text-yellow-900 mb-2">Important Disclaimers</h4>
                <ul className="list-disc pl-6 space-y-2 text-yellow-800">
                  <li><strong>No Guarantee of Accuracy:</strong> While we strive for accuracy, we cannot guarantee that all data is error-free</li>
                  <li><strong>Independent Verification:</strong> Users should verify critical information independently</li>
                  <li><strong>No Sponsorship Guarantee:</strong> Historical data does not guarantee future H1B sponsorship by any employer</li>
                  <li><strong>Legal Advice:</strong> Our platform does not provide legal advice or immigration consulting services</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">User Responsibilities & Conduct</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Permitted Use</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Research H1B trends and employer patterns for personal or professional purposes</li>
                  <li>Access salary benchmarking data for career planning and negotiation</li>
                  <li>Use data insights for academic research or journalism (with proper attribution)</li>
                  <li>Share platform links and reference our data in professional contexts</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Prohibited Activities</h3>
                <div className="bg-red-50 border-l-4 border-red-400 p-6">
                  <ul className="list-disc pl-6 space-y-2 text-red-800">
                    <li><strong>Data Scraping:</strong> Automated extraction or bulk downloading of our data without permission</li>
                    <li><strong>Commercial Redistribution:</strong> Reselling or redistributing our processed data commercially</li>
                    <li><strong>Platform Abuse:</strong> Attempts to disrupt, overload, or harm our services</li>
                    <li><strong>Misrepresentation:</strong> Using our data to make false or misleading claims</li>
                    <li><strong>Spam or Harassment:</strong> Any form of spam, harassment, or malicious activity</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Intellectual Property Rights</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Our Rights</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Platform Design:</strong> All website design, user interface, and user experience elements</li>
                  <li><strong>Analytics & Insights:</strong> Our unique analysis, visualizations, and derived insights</li>
                  <li><strong>Brand Assets:</strong> ImmigrantCentral name, logo, and trademark elements</li>
                  <li><strong>Software & Code:</strong> Underlying software, algorithms, and technical implementations</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Public Data</h3>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
                  <p className="text-blue-800">
                    <strong>Important Note:</strong> The underlying H1B data we display is public information from U.S. government sources. 
                    Our intellectual property rights apply to our presentation, analysis, and derived insights, not the raw government data itself.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Limitations of Liability */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Limitations of Liability</h2>
            
            <div className="bg-orange-50 border-l-4 border-orange-400 p-6 mb-6">
              <p className="text-orange-800 font-medium">
                ⚠️ Important Legal Notice: Please read this section carefully as it limits our liability in certain situations.
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Service Availability</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>We provide our services "as is" without warranties of any kind</li>
                  <li>We do not guarantee uninterrupted or error-free service availability</li>
                  <li>Platform maintenance, updates, or technical issues may cause temporary disruptions</li>
                  <li>We reserve the right to modify, suspend, or discontinue services at any time</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Limitation of Damages</h3>
                <p className="text-gray-700 mb-4">
                  To the maximum extent permitted by law, ImmigrantCentral shall not be liable for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, business opportunities, or data</li>
                  <li>Decisions made based on information from our platform</li>
                  <li>Third-party content or services linked from our platform</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Indemnification */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">User Indemnification</h2>
            <p className="text-gray-700 mb-4">
              You agree to indemnify, defend, and hold harmless ImmigrantCentral, its officers, directors, employees, and agents from any claims, damages, or expenses arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Your use or misuse of our platform and services</li>
              <li>Violation of these Terms of Service or any applicable laws</li>
              <li>Content you submit or actions you take on our platform</li>
              <li>Infringement of any third-party rights</li>
              <li>Any decisions made based on information from our platform</li>
            </ul>
          </section>

          {/* Governing Law & Disputes */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Governing Law & Dispute Resolution</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Applicable Law</h3>
                <p className="text-gray-700">
                  These Terms are governed by and construed in accordance with the laws of the United States and the State of California, 
                  without regard to conflict of law principles.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Dispute Resolution</h3>
                <p className="text-gray-700 mb-4">
                  For any disputes arising from these Terms or your use of our services:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Informal Resolution:</strong> We encourage users to contact us first to resolve disputes informally</li>
                  <li><strong>Binding Arbitration:</strong> Unresolved disputes shall be settled through binding arbitration</li>
                  <li><strong>Individual Claims:</strong> Class action lawsuits and class-wide arbitrations are waived</li>
                  <li><strong>Jurisdiction:</strong> Courts in San Francisco County, California have exclusive jurisdiction</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Changes to These Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We may update these Terms of Service from time to time to reflect changes in our services, 
                legal requirements, or business practices.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
                <h4 className="font-medium text-blue-900 mb-2">How We Notify You</h4>
                <ul className="list-disc pl-6 space-y-1 text-blue-800">
                  <li>Updated Terms will be posted on this page with a new "Last Updated" date</li>
                  <li>Significant changes may be announced through our platform or website</li>
                  <li>Your continued use after changes constitutes acceptance of the new Terms</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Us</h2>
            <p className="text-gray-700 mb-6">
              Questions about these Terms of Service? Need to report a violation or request permissions? We're here to help.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-3">Legal & Terms Questions</h3>
                <p className="text-gray-600 mb-2">Email: support@usimmigrantcentral.com</p>
                <p className="text-gray-600">For Terms of Service inquiries</p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-3">Business & Partnership</h3>
                <p className="text-gray-600 mb-2">Email: support@usimmigrantcentral.com</p>
                <p className="text-gray-600">For business inquiries and partnerships</p>
              </div>
            </div>
          </section>

          {/* Final Legal Notice */}
          <section className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Final Legal Notes</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, 
                the remaining provisions will continue to be valid and enforceable.
              </p>
              <p>
                <strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, 
                constitute the entire agreement between you and ImmigrantCentral.
              </p>
              <p>
                <strong>No Waiver:</strong> Our failure to enforce any provision of these Terms 
                does not constitute a waiver of our right to enforce it later.
              </p>
              <p>
                <strong>Assignment:</strong> You may not assign your rights or obligations under these Terms. 
                We may assign our rights and obligations to any party.
              </p>
              <p className="text-sm text-gray-600 mt-6">
                <strong>Effective Date:</strong> These Terms of Service are effective as of {effectiveDate} and replace all previous versions.
              </p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="outline" size="lg" className="px-8">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <DashboardFooter />
    </div>
  );
};

export default TermsOfServicePage;