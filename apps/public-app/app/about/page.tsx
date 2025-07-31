'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { 
  Users, 
  Target, 
  Heart, 
  TrendingUp, 
  Database, 
  Globe,
  Shield,
  Lightbulb,
  Award,
  BarChart3,
  Building,
  MapPin,
  CheckCircle,
  Zap,
  Eye,
  BookOpen,
} from 'lucide-react';
import { ImmigrantCentralLogo } from '../../components/h1b-dashboard/ImmigrantCentralLogo';
import { DashboardHeader } from '../../components/h1b-dashboard/DashboardHeader';
import { DashboardFooter } from '../../components/h1b-dashboard/DashboardFooter';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <ImmigrantCentralLogo className="w-16 h-16" size={64} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Immigrant Central
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We are a passionate data analytics platform dedicated to empowering immigrants with comprehensive, 
            data-driven insights to navigate their journey with confidence and clarity.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Immigration is complex, but data shouldn't be. We believe every immigrant deserves access to 
                transparent, accurate, and actionable information that can shape their career and life decisions.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Starting with H1B visa data, we're building the most comprehensive immigration analytics platform 
                to help you understand market trends, salary benchmarks, approval rates, and opportunities across 
                the United States.
              </p>
            </div>
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">2M+</div>
                  <div className="text-sm text-muted-foreground">H1B Applications Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-sm text-muted-foreground">Companies Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                  <div className="text-sm text-muted-foreground">Job Titles Covered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Data Transparency</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">What We Do</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We transform complex immigration data into clear, actionable insights that help you make informed decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="p-2 bg-blue-100 rounded-lg w-fit mb-4">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">H1B Data Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive analysis of H1B applications, approval rates, salary trends, and employer patterns 
                  updated daily from official government sources.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="p-2 bg-green-100 rounded-lg w-fit mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Market Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Year-over-year growth analysis, geographic distribution, industry trends, and salary benchmarks 
                  to help you understand the immigration landscape.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="p-2 bg-purple-100 rounded-lg w-fit mb-4">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Company Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed employer analytics including sponsorship history, average salaries, success rates, 
                  and geographic presence for informed career decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="p-2 bg-orange-100 rounded-lg w-fit mb-4">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Location Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  City and state-level analysis of H1B opportunities, cost of living considerations, 
                  and regional job market dynamics.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="p-2 bg-red-100 rounded-lg w-fit mb-4">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Attorney Networks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Immigration attorney performance data, success rates, and specialization areas to help 
                  you choose the right legal representation.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="p-2 bg-teal-100 rounded-lg w-fit mb-4">
                  <Zap className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Daily data refreshes from the US Department of Labor ensure you always have access to 
                  the most current immigration statistics and trends.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Our Values</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="p-4 bg-blue-50 rounded-2xl w-fit mx-auto mb-4">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Transparency</h3>
              <p className="text-muted-foreground">
                We believe in complete data transparency. All our information comes from official government sources 
                and is presented without bias or hidden agendas.
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-green-50 rounded-2xl w-fit mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Privacy</h3>
              <p className="text-muted-foreground">
                Your data and privacy are paramount. We don't track personal information and our analytics 
                are built on publicly available immigration data.
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-purple-50 rounded-2xl w-fit mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Innovation</h3>
              <p className="text-muted-foreground">
                We continuously innovate to present complex immigration data in intuitive, actionable ways 
                that serve the immigrant community better.
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-orange-50 rounded-2xl w-fit mx-auto mb-4">
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Accessibility</h3>
              <p className="text-muted-foreground">
                Immigration data should be accessible to everyone. We provide free access to essential insights 
                that can impact your immigration journey.
              </p>
            </div>
          </div>
        </section>

        {/* Future Vision Section */}
        <section className="mb-16">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-3 mb-6">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">Looking Forward</h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                While we currently focus on H1B data, our vision extends far beyond. We're building towards 
                a comprehensive immigration analytics ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Green Card Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Expanding to cover permanent residency data, processing times, and country-specific quotas.
                </p>
              </div>

              <div className="text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Immigration Community</h3>
                <p className="text-sm text-muted-foreground">
                  Building features for immigrants to share experiences and connect with others on similar journeys.
                </p>
              </div>

              <div className="text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Visa Categories</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive coverage of L1, O1, EB categories, and other immigration pathways.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Join Our Community
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you're planning your H1B application, researching employers, or analyzing market trends, 
              we're here to support your immigration journey with data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/h1b-dashboard">
                <Button size="lg" className="px-8">
                  Explore H1B Dashboard
                </Button>
              </Link>
              <Link href="mailto:contact@immigrantcentral.com">
                <Button variant="outline" size="lg" className="px-8">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default AboutPage;