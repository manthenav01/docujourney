import { NextRequest, NextResponse } from 'next/server';
import { analyzeVisaStatus, prepareDocumentsForAnalysis } from '@/lib/genkit';
import { fetchAndGroupDocuments } from '@/lib/documentActions';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { userId, profileId } = await request.json();

    // Validate required parameters
    if (!userId || !profileId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId or profileId' },
        { status: 400 }
      );
    }

    // Fetch all documents for the profile
    const { documentGroups } = await fetchAndGroupDocuments(userId, profileId);
    
    // Flatten all documents from all groups
    const allDocuments = documentGroups.flatMap(group => group.docs);
    
    // Filter for completed documents with extracted data
    const completedDocuments = allDocuments.filter(doc => 
      doc.status === 'verified' || doc.status === 'completed' && doc.extracted
    );

    if (completedDocuments.length === 0) {
      return NextResponse.json({
        currentStatus: 'No Documents',
        visaType: 'Unknown',
        statusDetails: 'No verified documents found for analysis',
        expirationWarnings: [],
        nextActions: ['Upload and verify immigration documents'],
        confidence: 1.0
      });
    }

    // Prepare documents for Genkit analysis (removing personal information)
    const documentsForAnalysis = prepareDocumentsForAnalysis(completedDocuments);

    // Analyze visa status using Genkit
    const visaStatusAnalysis = await analyzeVisaStatus({
      documents: documentsForAnalysis,
      currentDate: new Date().toISOString()
    });

    // Store the analysis result in Firestore for caching (optional)
    try {
      await adminDb
        .collection('users')
        .doc(userId)
        .collection('profiles')
        .doc(profileId)
        .update({
          lastVisaStatusAnalysis: {
            ...visaStatusAnalysis,
            analyzedAt: new Date(),
            documentCount: completedDocuments.length
          }
        });
    } catch (error) {
      console.warn('Failed to store visa status analysis:', error);
      // Continue even if storage fails
    }

    return NextResponse.json(visaStatusAnalysis);
  } catch (error) {
    console.error('Error analyzing visa status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze visa status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
