"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import VisaStatusCard from '@/components/VisaStatusCard';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { Profile } from '@/lib/types/profile.model';
import { DocumentMetaDataTransformedModel } from '@/lib/types/document.model';
import { auth } from '@/lib/firebase';
import { 
    LayoutDashboard, 
    FileText, 
    Users, 
    Upload, 
    Calendar, 
    Clock,
    TrendingUp,
    Star,
    Zap,
    Award,
    Eye,
    Mail,
    Loader2
} from 'lucide-react';
import { getVisaStatusColorClasses, getVisaStatusIcon } from '@/lib/visaStatusUtils';
import VisaTimeline, { createVisaTimelineEvents } from '@/components/VisaTimeline';

interface DashboardDocument extends DocumentMetaDataTransformedModel {
    profileId: string;
    profileName: string;
    profileRelationship: string;
}

interface DashboardPageClientProps {
    userId: string;
    activeProfileId: string;
    activeProfile: Profile;
    profiles: Profile[];
    documentSchemas: Record<string, DocumentTypeSchemaModel>;
    allDocuments: DashboardDocument[];
}

const DashboardPageClient: React.FC<DashboardPageClientProps> = ({
    userId,
    activeProfileId,
    activeProfile,
    profiles,
    documentSchemas,
    allDocuments
}) => {
    const router = useRouter();
    const [isTestEmailLoading, setIsTestEmailLoading] = useState(false);
    const [testEmailMessage, setTestEmailMessage] = useState('');

    // Function to send test email
    const sendTestEmail = async () => {
        setIsTestEmailLoading(true);
        setTestEmailMessage('');
        
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const token = await user.getIdToken();
            
            const response = await fetch('/api/sendTestEmail', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.uid
                }),
            });

            const result = await response.json();
            
            if (response.ok) {
                setTestEmailMessage('Test email sent successfully! Check your inbox.');
            } else {
                setTestEmailMessage(`Error: ${result.error || 'Failed to send test email'}`);
            }
        } catch (error) {
            console.error('Error sending test email:', error);
            setTestEmailMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        } finally {
            setIsTestEmailLoading(false);
        }
    };

    // Calculate dashboard statistics
    const totalDocuments = allDocuments.length;
    const totalProfiles = profiles.length;
    const recentDocuments = allDocuments.slice(0, 6); // Last 6 documents
    
    // Use saved visa status from profiles instead of calculating manually
    const profilesWithVisaStatus = profiles.map(profile => {
        const profileDocuments = allDocuments.filter(doc => doc.profileId === profile.id);
        
        // Get saved visa status analysis from profile (now properly typed)
        const lastVisaStatusAnalysis = profile.lastVisaStatusAnalysis;
        
        let visaStatus = 'unknown';
        let statusDetails = null;
        let currentStatus = null;
        let visaType = null;
        let daysUntilExpiry: number | null = null;
        
        if (lastVisaStatusAnalysis) {
            // Use the AI analysis results
            currentStatus = lastVisaStatusAnalysis.currentStatus;
            visaType = lastVisaStatusAnalysis.visaType;
            statusDetails = lastVisaStatusAnalysis.statusDetails;
            
            // Convert AI status to simple status for UI compatibility
            if (currentStatus?.toLowerCase().includes('in status')) {
                // Check for expiration warnings to determine if expiring soon
                if (lastVisaStatusAnalysis.expirationWarnings?.length > 0) {
                    visaStatus = 'expiring';
                } else {
                    visaStatus = 'active';
                }
            } else if (currentStatus?.toLowerCase().includes('out of status')) {
                visaStatus = 'expired';
            }
            
            // Try to calculate days until expiry from warnings
            const expirationWarning = lastVisaStatusAnalysis.expirationWarnings?.[0];
            if (expirationWarning && expirationWarning.includes('days')) {
                const daysMatch = expirationWarning.match(/(\d+)\s+days?/);
                if (daysMatch) {
                    daysUntilExpiry = parseInt(daysMatch[1]);
                }
            }
        }
        
        return {
            ...profile,
            visaStatus,
            currentStatus,
            visaType,
            statusDetails,
            daysUntilExpiry,
            documentCount: profileDocuments.length,
            lastAnalyzed: lastVisaStatusAnalysis?.analyzedAt
        };
    });

    // Helper function to render status icon
    const renderStatusIcon = (status: string) => {
        const IconComponent = getVisaStatusIcon(status);
        return <IconComponent className="w-4 h-4" />;
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getDocumentTypeDisplayName = (documentType: string) => {
        return documentSchemas[documentType]?.displayName || documentType;
    };

    // Calculate completion score (gamification)
    const calculateCompletionScore = () => {
        const documentsScore = Math.min(totalDocuments * 10, 100); // Max 100 points for documents
        const profilesScore = Math.min(totalProfiles * 20, 100); // Max 100 points for profiles
        return Math.round((documentsScore + profilesScore) / 2);
    };

    const completionScore = calculateCompletionScore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-4">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2">Welcome back, {activeProfile.firstName}! Here's your document journey overview.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={sendTestEmail}
                            disabled={isTestEmailLoading}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            {isTestEmailLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Mail className="w-4 h-4" />
                            )}
                            {isTestEmailLoading ? 'Sending...' : 'Send Test Email'}
                        </Button>
                    </div>
                </div>
                
                {/* Test Email Message */}
                {testEmailMessage && (
                    <div className={`mb-4 p-3 rounded-md text-sm ${
                        testEmailMessage.includes('Error') 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                        {testEmailMessage}
                    </div>
                )}

                {/* Gamification Score */}
                <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-6 h-6 text-slate-600" />
                                    <h3 className="text-xl font-bold text-slate-800">Journey Progress</h3>
                                </div>
                                <p className="text-slate-600">Keep going! You're doing great organizing your documents.</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold mb-1 text-slate-700">{completionScore}%</div>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-current text-amber-400" />
                                    <span className="text-sm text-slate-600">Completion Score</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                                <p className="text-3xl font-bold text-gray-900">{totalDocuments}</p>
                                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                    <TrendingUp className="w-3 h-3" />
                                    All organized
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Family Profiles</p>
                                <p className="text-3xl font-bold text-gray-900">{totalProfiles}</p>
                                <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                                    <Zap className="w-3 h-3" />
                                    Ready to go
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                                <p className="text-3xl font-bold text-gray-900">{recentDocuments.length}</p>
                                <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    This week
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Visa Timeline */}
            <div className="mb-8">
                <VisaTimeline 
                    events={createVisaTimelineEvents(
                        allDocuments.filter(doc => doc.profileId === activeProfileId),
                        activeProfile.lastVisaStatusAnalysis
                    )}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Status Overview */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            Profile Visa Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {profilesWithVisaStatus.map((profile) => (
                                <div 
                                    key={profile.id} 
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/documents?profileId=${profile.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-full flex items-center justify-center text-blue-700 font-semibold shadow-sm">
                                            {profile.firstName[0]}{profile.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {profile.firstName} {profile.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500 capitalize">
                                                {profile.relationship || 'self'} • {profile.documentCount} documents
                                                {profile.visaType && ` • ${profile.visaType}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {profile.daysUntilExpiry !== null && (
                                            (profile.currentStatus || profile.visaStatus) === 'expiring' ||
                                            (profile.currentStatus || '').toLowerCase().includes('expiring') ||
                                            (profile.currentStatus || '').toLowerCase().includes('expires')
                                        ) && (
                                            <span className="text-xs text-orange-600 font-medium">
                                                {profile.daysUntilExpiry} days left
                                            </span>
                                        )}
                                        <Badge className={`${getVisaStatusColorClasses(profile.currentStatus || profile.visaStatus)} border-0 flex items-center gap-1`}>
                                            {renderStatusIcon(profile.currentStatus || profile.visaStatus)}
                                            <span className="capitalize">
                                                {profile.currentStatus || profile.visaStatus}
                                            </span>
                                        </Badge>
                                        <Eye className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Documents */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Recent Documents
                            </CardTitle>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push('/documents')}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentDocuments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No documents uploaded yet</p>
                                    <p className="text-sm">Upload your first document to get started!</p>
                                </div>
                            ) : (
                                recentDocuments.map((doc) => (
                                    <div 
                                        key={doc.id} 
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/documents?profileId=${doc.profileId}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {doc.extracted?.document_type 
                                                        ? getDocumentTypeDisplayName(doc.extracted.document_type)
                                                        : doc.name
                                                    }
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {doc.profileName} • {formatDate(doc.createdAt || doc.uploadedAt || '')}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {doc.status}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Visa Status Analysis */}
            <div className="mt-8">
                <VisaStatusCard 
                    userId={userId}
                    profileId={activeProfileId}
                    profileName={`${activeProfile.firstName} ${activeProfile.lastName}`}
                    autoAnalyze={true}
                />
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                    variant="outline"
                    className="h-20 text-left border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    onClick={() => router.push('/upload')}
                >
                    <div className="flex items-center gap-3">
                        <Upload className="w-6 h-6 text-blue-600" />
                        <div>
                            <p className="font-medium text-blue-900">Upload Document</p>
                            <p className="text-sm text-blue-600">Add a new document</p>
                        </div>
                    </div>
                </Button>

                <Button
                    variant="outline"
                    className="h-20 text-left border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300"
                    onClick={() => router.push('/profiles')}
                >
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-purple-600" />
                        <div>
                            <p className="font-medium text-purple-900">Manage Profiles</p>
                            <p className="text-sm text-purple-600">Add or edit family members</p>
                        </div>
                    </div>
                </Button>

                <Button
                    variant="outline"
                    className="h-20 text-left border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                    onClick={() => router.push('/documents')}
                >
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-green-600" />
                        <div>
                            <p className="font-medium text-green-900">View Documents</p>
                            <p className="text-sm text-green-600">Browse all documents</p>
                        </div>
                    </div>
                </Button>
            </div>
        </div>
    );
};

export default DashboardPageClient;
