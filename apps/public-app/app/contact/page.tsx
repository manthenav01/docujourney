import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { generateMetadata } from '@docujourney/utils';
import { Card } from '@docujourney/ui';
import { 
  Mail, 
  Clock, 
  MessageSquare,
  HeadphonesIcon,
  Users,
  Shield,
  Zap,
  Globe,
} from 'lucide-react';
import { DashboardHeader } from '../../components/h1b-dashboard/DashboardHeader';
import { DashboardFooter } from '../../components/h1b-dashboard/DashboardFooter';
import { ImmigrantCentralLogo } from '../../components/h1b-dashboard/ImmigrantCentralLogo';
import { ContactForm } from '../../components/contact/ContactForm';
import { SmartBreadcrumb } from '../../components/h1b-dashboard/SmartBreadcrumb';

export const metadata: Metadata = generateMetadata({
  title: 'Contact Us - ImmigrantCentral H1B Support & Inquiries',
  description: 'Get expert help with H1B data questions, immigration insights, and platform support. Contact our team for personalized assistance with your H1B journey and career planning.',
  keywords: ['contact ImmigrantCentral', 'H1B support', 'immigration help', 'visa data questions', 'H1B assistance', 'immigration support'],
  type: 'website',
  path: '/contact',
});

export default function ContactPage() {

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Breadcrumb Navigation */}
      <Suspense fallback={<div className="h-12" />}>
        <SmartBreadcrumb />
      </Suspense>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <MessageSquare className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Contact Immigrant Central
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Have questions about H1B data, visa analytics, or immigration insights? We're here to help you navigate your immigration journey with data-driven support and expert guidance.
          </p>
          
          {/* Quick Contact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">&lt;24h</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Data Access</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm text-muted-foreground">Free Support</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* Contact Information & FAQ */}
          <div className="space-y-8">
            {/* Direct Contact */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <HeadphonesIcon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Direct Contact</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm text-muted-foreground">support@usimmigrantcentral.com</div>
                    <div className="text-xs text-muted-foreground mt-1">Response within 24 hours</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium">Support Hours</div>
                    <div className="text-sm text-muted-foreground">Monday - Friday</div>
                    <div className="text-xs text-muted-foreground">9:00 AM - 6:00 PM EST</div>
                  </div>
                </div>
                
              </div>
            </Card>

            {/* Why Contact Us */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Why Contact Us?</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium text-sm">Expert Immigration Data</div>
                    <div className="text-xs text-muted-foreground">Get guidance on H1B trends, salary data, and company analytics</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <div className="font-medium text-sm">Fast Response</div>
                    <div className="text-xs text-muted-foreground">Quick answers to your immigration data questions</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <div className="font-medium text-sm">Platform Support</div>
                    <div className="text-xs text-muted-foreground">Help with dashboard features and data interpretation</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImmigrantCentralLogo className="w-5 h-5" size={20} />
                Quick Resources
              </h3>
              <div className="space-y-2">
                <a href="/h1b-dashboard" className="block text-sm text-primary hover:underline">
                  → H1B Data Dashboard
                </a>
                <a href="/h1b-dashboard/employers" className="block text-sm text-primary hover:underline">
                  → Top H1B Employers
                </a>
                <a href="/h1b-dashboard/jobs" className="block text-sm text-primary hover:underline">
                  → H1B Job Analysis
                </a>
                <a href="/about" className="block text-sm text-primary hover:underline">
                  → About Our Platform
                </a>
                <a href="/privacy-policy" className="block text-sm text-primary hover:underline">
                  → Privacy Policy
                </a>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Information Section */}
        <section className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How We Can Help You
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our expert team specializes in H1B data analysis and immigration insights. Here's what we can assist you with:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">H1B Data Questions</h3>
              <p className="text-sm text-muted-foreground">
                Get answers about specific companies, salary ranges, approval rates, job trends, and historical H1B data patterns.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Career Guidance</h3>
              <p className="text-sm text-muted-foreground">
                Understand which companies are actively hiring for H1B positions and what salary expectations are realistic for your field.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Data Accuracy</h3>
              <p className="text-sm text-muted-foreground">
                Report data discrepancies, suggest improvements, or verify information you've found on our platform.
              </p>
            </Card>
          </div>
        </section>
      </main>

      <DashboardFooter />
    </div>
  );
}