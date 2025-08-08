import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
}

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Rate limiting (simple in-memory store - in production use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    // Parse and validate request body
    const body: ContactFormData = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    // Sanitize input data
    const sanitizedData = {
      name: body.name.trim().slice(0, 100),
      email: body.email.trim().toLowerCase().slice(0, 255),
      subject: body.subject.trim().slice(0, 200),
      message: body.message.trim().slice(0, 5000),
      inquiryType: body.inquiryType || 'general',
      timestamp: new Date().toISOString(),
      ip: ip,
    };

    // In a production environment, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Integrate with your CRM or support system
    
    // For now, we'll log the contact form submission
    console.log('Contact form submission:', {
      ...sanitizedData,
      ip: '[REDACTED]', // Don't log IP in production logs
    });

    // Here you would typically:
    // - Save to your database
    // - Send an email to your support team
    // - Send a confirmation email to the user
    // - Integrate with your CRM (e.g., HubSpot, Salesforce)
    
    // Example of what you might do:
    /*
    // Save to database
    await db.contactSubmissions.create({
      data: sanitizedData
    });

    // Send notification email to support team
    await sendEmail({
      to: 'support@usimmigrantcentral.com',
      subject: `New Contact Form: ${sanitizedData.subject}`,
      html: generateContactNotificationEmail(sanitizedData)
    });

    // Send confirmation email to user
    await sendEmail({
      to: sanitizedData.email,
      subject: 'Thank you for contacting Immigrant Central',
      html: generateConfirmationEmail(sanitizedData.name)
    });
    */

    return NextResponse.json(
      { 
        message: 'Thank you for your message. We will get back to you within 24 hours.',
        success: true, 
      },
      { status: 200 },
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again or contact support directly.' },
      { status: 500 },
    );
  }
}

// Handle preflight OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Example email templates (you would implement these with your email service)
/*
function generateContactNotificationEmail(data: ContactFormData & { timestamp: string; ip: string }) {
  return `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Inquiry Type:</strong> ${data.inquiryType}</p>
    <p><strong>Subject:</strong> ${data.subject}</p>
    <p><strong>Message:</strong></p>
    <div style="border: 1px solid #ccc; padding: 10px; background: #f9f9f9;">
      ${data.message.replace(/\n/g, '<br>')}
    </div>
    <p><small>Submitted: ${data.timestamp}</small></p>
  `;
}

function generateConfirmationEmail(name: string) {
  return `
    <h2>Thank you for contacting Immigrant Central</h2>
    <p>Hi ${name},</p>
    <p>We've received your message and will get back to you within 24 hours.</p>
    <p>In the meantime, you can explore our H1B data dashboard for the latest immigration insights:</p>
    <p><a href="https://usimmigrantcentral.com/h1b-dashboard">Visit H1B Dashboard</a></p>
    <p>Best regards,<br>The Immigrant Central Team</p>
  `;
}
*/