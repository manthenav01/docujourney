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
    User,
    Upload, 
    Calendar, 
    Clock,
    TrendingUp,
    Star,
    Zap,
    Award,
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

            {/* Active Profile Summary */}
            {(activeProfile.firstEntryDate || activeProfile.firstEntryVisaType) && (
                <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" />
                            {activeProfile.firstName}'s Profile Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {activeProfile.firstEntryDate && (
                                <div className="bg-white p-4 rounded-lg border border-indigo-100">
                                    <p className="text-sm font-medium text-gray-600 mb-1">First Entry to US</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(activeProfile.firstEntryDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                    {activeProfile.firstEntryVisaType && (
                                        <p className="text-sm text-indigo-600 mt-1">
                                            on {activeProfile.firstEntryVisaType} visa
                                        </p>
                                    )}
                                </div>
                            )}
                            {activeProfile.countryOfCitizen && (
                                <div className="bg-white p-4 rounded-lg border border-indigo-100">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Country of Citizenship</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {activeProfile.countryOfCitizen}
                                    </p>
                                </div>
                            )}
                            <div className="bg-white p-4 rounded-lg border border-indigo-100">
                                <p className="text-sm font-medium text-gray-600 mb-1">Employment Status</p>
                                <div className="flex items-center gap-2">
                                    <Badge 
                                        variant="outline" 
                                        className={`${
                                            activeProfile.currentlyEmployed 
                                                ? 'bg-green-50 text-green-700 border-green-200' 
                                                : 'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}
                                    >
                                        {activeProfile.currentlyEmployed ? 'Employed' : 'Unemployed'}
                                    </Badge>
                                </div>
                            </div>
                            {activeProfile.lastVisaStatusAnalysis && (
                                <div className="bg-white p-4 rounded-lg border border-indigo-100">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Current Visa Status</p>
                                    <div className="flex items-center gap-2">
                                        {renderStatusIcon(activeProfile.lastVisaStatusAnalysis.currentStatus)}
                                        <Badge className={`${getVisaStatusColorClasses(activeProfile.lastVisaStatusAnalysis.currentStatus)} border-0`}>
                                            {activeProfile.lastVisaStatusAnalysis.currentStatus}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Visa Timeline */}
            <div className="mb-8">
                <VisaTimeline 
                    events={createVisaTimelineEvents(
                        allDocuments.filter(doc => doc.profileId === activeProfileId),
                        activeProfile.lastVisaStatusAnalysis
                    )}
                />
            </div>

            <div className="grid grid-cols-1 gap-8">
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
