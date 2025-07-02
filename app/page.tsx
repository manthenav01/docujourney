"use client";
import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { FileText, Search, ShieldCheck, UploadCloud, Eye, ChartLine, Bolt, Lock, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

function HomePage() {
  const router = useRouter();

  return (
    <>
      <header className="w-full flex items-center justify-between py-6 px-6 md:px-12 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            DocuJourney
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-500 text-white shadow" style={{ letterSpacing: '0.04em' }}>
              AI
            </span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-base font-medium">
          <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Features</a>
          <a href="/visa-dashboard" className="text-gray-700 hover:text-blue-600 transition">Visa Analytics</a>
          <a href="#howItWorks" className="text-gray-700 hover:text-blue-600 transition">How it works</a>
          <a href="#" className="text-gray-700 hover:text-blue-600 transition">Help</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button className="hidden md:inline-block text-gray-700 bg-transparent hover:bg-gray-100" onClick={() => router.push('/login')}>
            Log in
          </Button>
          <Button onClick={() => router.push('/login')}>
            Sign up For Free
          </Button>
        </div>
      </header>

      <main className="px-4 md:px-8 py-8 space-y-24">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-center min-h-[70vh] text-center md:text-left bg-gradient-to-br from-blue-50 to-white relative overflow-hidden mb-16">
          <div className="flex-1 max-w-2xl mx-auto md:mx-0 z-10 px-4">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-gray-900 tracking-tight leading-tight">
              Effortless Document Management<br />
              <span className="text-teal-500">for Immigrants</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
              <span className="font-semibold">Smart tracking, instant search, secure storage, and privacy-first by design.</span><br />
              Secure, fast, and intuitive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-10">
              <Button className="px-8 py-3 text-lg" onClick={() => router.push('/login')}>
                Sign up for Free
              </Button>
              <a href="#features" className="inline-flex items-center justify-center px-8 py-3 border border-blue-500 text-blue-500 rounded-lg font-semibold hover:bg-blue-50 transition text-lg">
                Learn More
              </a>
            </div>
          </div>
          <div className="flex-1 max-w-[22vw] flex justify-center md:justify-end mt-8 md:mt-0 relative z-10">
            <div className="relative w-full flex flex-col items-center">
              <Image src="/assets/hero-section-graphic.png" alt="Hero Section" width={224} height={224} className="rounded-xl shadow-lg border border-blue-100 bg-white hover:scale-105 transition-transform mb-6" />
              <div className="absolute -right-10 -top-10 w-16 h-16 bg-blue-100 rounded-full blur-2xl opacity-40"></div>
              <div className="absolute -left-10 bottom-0 w-10 h-10 bg-purple-100 rounded-full blur-2xl opacity-30"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-5xl mx-auto py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4 mb-16">
          <Card className="flex flex-col items-center text-center p-6">
            <CardHeader>
              <FileText className="text-3xl text-blue-500 mb-4" />
              <CardTitle className="font-semibold text-lg mb-2">Smart Document Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-500">
                Track document status, history, and changes in real time with intelligent notifications.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="flex flex-col items-center text-center p-6">
            <Search className="text-3xl text-green-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">AI-Powered Search</h3>
            <p className="text-gray-500">
              Find documents instantly using advanced AI search and filtering capabilities.
            </p>
          </Card>
          <Card className="flex flex-col items-center text-center p-6">
            <ShieldCheck className="text-3xl text-purple-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
            <p className="text-gray-500">
              Your documents are encrypted and protected with enterprise-grade security.
            </p>
          </Card>
        </section>

        {/* How It Works Section */}
        <section id="howItWorks" className="max-w-5xl mx-auto py-12 px-4 md:px-0 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
                <UploadCloud className="text-2xl text-blue-500" />
              </span>
              <h4 className="font-semibold text-lg mb-2">1. Upload Documents</h4>
              <p className="text-gray-500">
                Easily upload your files in various formats. Our secure cloud handles everything.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
                <Eye className="text-2xl text-green-500" />
              </span>
              <h4 className="font-semibold text-lg mb-2">2. Track Progress</h4>
              <p className="text-gray-500">
                Monitor document status, get real-time updates, and never lose track of paperwork.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 mb-4">
                <ChartLine className="text-2xl text-purple-500" />
              </span>
              <h4 className="font-semibold text-lg mb-2">3. Get AI Insights</h4>
              <p className="text-gray-500">
                Leverage AI to extract key info, receive smart suggestions, and optimize workflow.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-gradient-to-br from-blue-50 to-white py-12 md:py-20 mt-8 px-4 md:px-0 mb-16">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-700">What Makes Us Different?</h2>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <Bolt className="text-yellow-500 text-xl mt-1" />
                  <span><span className="font-semibold text-blue-600">Instant AI Actions:</span> Summarize, extract, and organize with one click—no setup required.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="text-blue-500 text-xl mt-1" />
                  <span><span className="font-semibold text-blue-600">Privacy First:</span> Your data is never used to train models and stays in your control.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Globe className="text-green-500 text-xl mt-1" />
                  <span><span className="font-semibold text-blue-600">Works Anywhere:</span> Access documents securely from any device, anywhere.</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 flex justify-center">
              <Image src="/assets/hero-section-graphic.png" alt="Illustration" width={320} height={320} className="rounded-xl shadow-lg border border-blue-100" />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 text-center text-gray-500 py-8 text-sm mt-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-2">
          <span>&copy; 2025 DocuJourney. All rights reserved.</span>
          <span className="hidden md:inline">|</span>
          <a href="#features" className="hover:text-blue-500 transition">Features</a>
          <span className="hidden md:inline">|</span>
          <a href="mailto:support@docujourney.com" className="hover:text-blue-500 transition">Contact Support</a>
          <span className="hidden md:inline">|</span>
          <a href="#" className="hover:text-blue-500 transition">Privacy Policy</a>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          {/* social icons placeholder */}
        </div>
        <div className="mt-4 text-xs text-gray-400">Made with <span className="text-red-400">❤️</span> by the DocuJourney Team</div>
      </footer>
    </>
  );
}

export default HomePage;