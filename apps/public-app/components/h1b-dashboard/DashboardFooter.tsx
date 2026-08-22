'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Database, 
  TrendingUp, 
  Building, 
  MapPin, 
  Users, 
  Scale,
  Mail,
  Twitter,
  Linkedin,
  ExternalLink,
  Shield,
  FileText,
  BarChart3,
} from 'lucide-react';
import { ImmigrantCentralLogo } from './ImmigrantCentralLogo';
import { Card } from '@docujourney/ui';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, children, external = false, className = '' }) => {
  const baseClasses = 'text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5';
  
  if (external) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`${baseClasses} ${className}`}
      >
        {children}
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  }
  
  return (
    <Link href={href} className={`${baseClasses} ${className}`}>
      {children}
    </Link>
  );
};

const FooterSection: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ 
  title, 
  children, 
  icon, 
}) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
      {icon}
      {title}
    </h3>
    <div className="space-y-3 text-sm">
      {children}
    </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ 
  label, 
  value, 
  icon, 
}) => (
  <div className="text-center space-y-2">
    <div className="flex justify-center">
      <div className="p-2 bg-primary/10 text-primary rounded-lg">
        {icon}
      </div>
    </div>
    <div className="text-lg font-semibold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export const DashboardFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-16 border-t border-border bg-card">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <ImmigrantCentralLogo className="w-10 h-10" size={40} />
              <div>
                <h2 className="text-xl font-semibold text-foreground">Immigrant Central</h2>
                <p className="text-sm text-muted-foreground">H1B Analytics Platform</p>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              Comprehensive H1B visa analytics and immigration data insights. Access real-time statistics, 
              salary benchmarks, approval rates, and company analytics to make informed immigration decisions.
            </p>
            
            {/* Key Stats */}
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <StatCard 
                  label="Companies" 
                  value="180K+" 
                  icon={<Building className="w-4 h-4" />} 
                />
                <StatCard 
                  label="Applications" 
                  value="3.7M+" 
                  icon={<FileText className="w-4 h-4" />} 
                />
                <StatCard 
                  label="Job Titles" 
                  value="425K+" 
                  icon={<Users className="w-4 h-4" />} 
                />
              </div>
            </Card>
          </div>
          
          {/* Navigation Links */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              
              {/* H1B Data */}
              <FooterSection 
                title="H1B Data" 
                icon={<Database className="w-4 h-4" />}
              >
                <FooterLink href="/h1b-dashboard">Dashboard Overview</FooterLink>
                <FooterLink href="/h1b-dashboard?view=companies">Top Employers</FooterLink>
                <FooterLink href="/h1b-dashboard?view=salaries">Salary Analytics</FooterLink>
                <FooterLink href="/h1b-dashboard?view=trends">Market Trends</FooterLink>
                <FooterLink href="/h1b-dashboard?view=approvals">Approval Rates</FooterLink>
              </FooterSection>
              
              {/* Analytics */}
              <FooterSection 
                title="Analytics" 
                icon={<TrendingUp className="w-4 h-4" />}
              >
                <FooterLink href="/h1b-dashboard/employers">By Employer</FooterLink>
                <FooterLink href="/h1b-dashboard/locations">By Location</FooterLink>
                <FooterLink href="/h1b-dashboard/jobs">By Job Title</FooterLink>
                <FooterLink href="/h1b-dashboard/attorneys">By Attorney</FooterLink>
                <FooterLink href="/h1b-dashboard?category=industry">By Industry</FooterLink>
              </FooterSection>
              
              
              {/* Legal & Company */}
              <FooterSection 
                title="Company" 
                icon={<Scale className="w-4 h-4" />}
              >
                <FooterLink href="/about">About Us</FooterLink>
                <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
                <FooterLink href="/terms-of-service">Terms of Service</FooterLink>
                <FooterLink href="/contact">Contact</FooterLink>
              </FooterSection>
              
            </div>
          </div>
        </div>
        
        {/* Newsletter Signup */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Stay Updated with H1B Trends
              </h3>
              <p className="text-sm text-muted-foreground">
                Get weekly insights on H1B approval rates, salary trends, and market analysis.
              </p>
            </div>
            <div className="flex gap-2 min-w-0 md:min-w-80">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors duration-200 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Copyright & Legal */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
              <span>© {currentYear} Immigrant Central. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Data Updated Regularly
                </span>
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Source: US Dept. of Labor
                </span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">Follow us:</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://x.com/immigracentral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
                  aria-label="Follow us on X (Twitter)"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/company/immigrantcentral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
                  aria-label="Follow us on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="mailto:support@usimmigrantcentral.com"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
                  aria-label="Email us"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </footer>
  );
};