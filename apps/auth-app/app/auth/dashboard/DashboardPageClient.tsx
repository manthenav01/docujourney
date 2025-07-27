'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@docujourney/ui';
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
    Loader2,
    Edit,
    Globe,
} from 'lucide-react';
import { getVisaStatusColorClasses, getVisaStatusIcon } from '@/lib/visaStatusUtils';
import VisaTimeline from '@/components/VisaTimeline';
import * as flags from 'country-flag-icons/react/3x2';

// Helper function to get flag component dynamically
const getFlagComponent = (countryCode: string) => {
    try {
        // Type assertion to access the flag components
        const flagsMap = flags as any;
        return flagsMap[countryCode] || null;
    } catch (error) {
        return null;
    }
};

// Helper function to map country names to ISO codes
const getCountryCode = (countryName: string): string => {
    const countryMap: { [key: string]: string } = {
        'india': 'IN',
        'united states': 'US',
        'united states of america': 'US',
        'usa': 'US',
        'china': 'CN',
        'people\'s republic of china': 'CN',
        'united kingdom': 'GB',
        'uk': 'GB',
        'great britain': 'GB',
        'england': 'GB',
        'canada': 'CA',
        'australia': 'AU',
        'germany': 'DE',
        'france': 'FR',
        'japan': 'JP',
        'south korea': 'KR',
        'korea': 'KR',
        'brazil': 'BR',
        'mexico': 'MX',
        'nigeria': 'NG',
        'south africa': 'ZA',
        'italy': 'IT',
        'spain': 'ES',
        'netherlands': 'NL',
        'poland': 'PL',
        'russia': 'RU',
        'russian federation': 'RU',
        'turkey': 'TR',
        'argentina': 'AR',
        'chile': 'CL',
        'colombia': 'CO',
        'peru': 'PE',
        'venezuela': 'VE',
        'pakistan': 'PK',
        'bangladesh': 'BD',
        'sri lanka': 'LK',
        'nepal': 'NP',
        'philippines': 'PH',
        'thailand': 'TH',
        'vietnam': 'VN',
        'indonesia': 'ID',
        'malaysia': 'MY',
        'singapore': 'SG',
        'egypt': 'EG',
        'morocco': 'MA',
        'kenya': 'KE',
        'ghana': 'GH',
        'ethiopia': 'ET',
        // Add more mappings as needed
    };
    
    // Convert input to lowercase and trim whitespace for case-insensitive matching
    const normalizedCountry = countryName.toLowerCase().trim();
    return countryMap[normalizedCountry] || '';
};

interface DashboardDocument extends DocumentMetaDataTransformedModel {
    profileId: string;
    profileName: string;
    profileRelationship: string;
}

interface DashboardPageClientProps {
    userId: string;
    profiles: Profile[];
    documentSchemas: Record<string, DocumentTypeSchemaModel>;
    allDocuments: DashboardDocument[];
}

const DashboardPageClient: React.FC<DashboardPageClientProps> = ({
    userId,
    profiles,
    documentSchemas,
    allDocuments,
}) => {
    const router = useRouter();
    const [isTestEmailLoading, setIsTestEmailLoading] = useState(false);
    const [testEmailMessage, setTestEmailMessage] = useState('');

    // Get the admin profile for welcome message
    const adminProfile = profiles.find(profile => profile.admin) || profiles[0];

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
                    userId: user.uid,
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
    
    // Calculate documents per profile for better insights
    const documentsByProfile = profiles.map(profile => ({
        profile,
        documentCount: allDocuments.filter(doc => doc.profileId === profile.id).length,
    }));

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
                year: 'numeric',
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

    // Helper function to render a profile summary card
    const renderProfileSummaryCard = (profile: Profile) => {
        const profileDocuments = allDocuments.filter(doc => doc.profileId === profile.id);
        const documentCount = profileDocuments.length;
        
        return (
            <Card key={profile.id} className="border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-slate-600" />
                            {profile.firstName} {profile.lastName}
                            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                                {profile.relationship || 'Self'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {documentCount} document{documentCount !== 1 ? 's' : ''}
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/profiles?edit=${profile.id}`)}
                                className="h-8 w-8 p-0 border-slate-200 hover:bg-slate-50"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {profile.lastVisaStatusAnalysis && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <p className="text-sm font-medium text-slate-600 mb-1">Current Status</p>
                                <div className="flex items-center gap-2">
                                    {renderStatusIcon(profile.lastVisaStatusAnalysis.currentStatus)}
                                    <Badge className={`${getVisaStatusColorClasses(profile.lastVisaStatusAnalysis.currentStatus)} border-0`}>
                                        {profile.lastVisaStatusAnalysis.currentStatus}
                                    </Badge>
                                </div>
                            </div>
                        )}
                        
                        {profile.lastVisaStatusAnalysis?.visaType && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <p className="text-sm font-medium text-slate-600 mb-1">Visa Type</p>
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-blue-600" />
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {profile.lastVisaStatusAnalysis.visaType}
                                    </Badge>
                                </div>
                            </div>
                        )}
                        
                        {profile.firstEntryDate && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <p className="text-sm font-medium text-slate-600 mb-1">First Entry to US</p>
                                <p className="text-lg font-semibold text-slate-900">
                                    {new Date(profile.firstEntryDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                    {profile.firstEntryVisaType && (
                                        <span className="text-sm text-blue-600 font-normal ml-2">
                                            on {profile.firstEntryVisaType} visa
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}
                        
                        {profile.countryOfCitizen && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <p className="text-sm font-medium text-slate-600 mb-1">Country of Citizenship</p>
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const countryCode = getCountryCode(profile.countryOfCitizen);
                                        if (countryCode) {
                                            const FlagComponent = getFlagComponent(countryCode);
                                            return FlagComponent ? (
                                                <FlagComponent className="h-4 w-6 rounded-sm shadow-sm" />
                                            ) : (
                                                <Globe className="h-4 w-4 text-slate-600" />
                                            );
                                        }
                                        return <Globe className="h-4 w-4 text-slate-600" />;
                                    })()}
                                    <p className="text-lg font-semibold text-slate-900">
                                        {profile.countryOfCitizen}
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <p className="text-sm font-medium text-slate-600 mb-1">Employment Status</p>
                            <div className="flex items-center gap-2">
                                <Badge 
                                    variant="outline" 
                                    className={`${
                                        profile.currentlyEmployed 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}
                                >
                                    {profile.currentlyEmployed ? 'Employed' : 'Unemployed'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            Dashboard
                        </h1>
                        <p className="text-slate-600 mt-2">Welcome back, {adminProfile.firstName}! Here&apos;s your family&apos;s document journey overview.</p>
                    </div>
                    <div className="flex gap-3 items-center">
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
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-6 h-6 text-blue-600" />
                                    <h3 className="text-xl font-bold text-blue-900">Journey Progress</h3>
                                </div>
                                <p className="text-blue-700">Keep going! You&apos;re doing great organizing your documents.</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold mb-1 text-blue-900">{completionScore}%</div>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-current text-amber-400" />
                                    <span className="text-sm text-blue-600">Completion Score</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border border-slate-200 bg-white hover:border-blue-300 transition-colors group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Documents</p>
                                <p className="text-3xl font-bold text-slate-900">{totalDocuments}</p>
                                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                    <TrendingUp className="w-3 h-3" />
                                    All organized
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white hover:border-purple-300 transition-colors group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Family Profiles</p>
                                <p className="text-3xl font-bold text-slate-900">{totalProfiles}</p>
                                <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                                    <Zap className="w-3 h-3" />
                                    Ready to go
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white hover:border-orange-300 transition-colors group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Recent Activity</p>
                                <p className="text-3xl font-bold text-slate-900">{recentDocuments.length}</p>
                                <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    This week
                                </p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Profile Cards */}
            <div className="mb-8 space-y-6">
                {profiles.map(profile => renderProfileSummaryCard(profile))}
            </div>

            <div className="mb-8 space-y-6">
                {[...profiles]
                    .sort((a, b) => {
                        if (a.admin && !b.admin) {return -1;}
                        if (!a.admin && b.admin) {return 1;}
                        return 0;
                    })
                    .map((profile) => {
                        const profileDocuments = allDocuments.filter(doc => doc.profileId === profile.id);
                        const hasDocuments = profileDocuments.length > 0;
                        
                        return (
                            <Card key={profile.id} className="border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            {profile.firstName} {profile.lastName}&apos;s Immigration Timeline
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {profile.admin && (
                                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                                    Admin
                                                </Badge>
                                            )}
                                            {profile.relationship && (
                                                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
                                                    {profile.relationship}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {hasDocuments ? (
                                        <VisaTimeline 
                                            userId={userId}
                                            profileId={profile.id}
                                        />
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p className="text-gray-600 mb-2">
                                                No documents uploaded yet for {profile.firstName}
                                            </p>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Upload visa documents to see {profile.firstName}&apos;s immigration timeline
                                            </p>
                                            <Button 
                                                variant="outline" 
                                                className="mt-2"
                                                onClick={() => router.push('/upload')}
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Documents
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
            </div>

            {/* Family Visa Status Analysis */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Award className="w-6 h-6 text-blue-600" />
                    Family Visa Status Analysis
                </h2>
                <VisaStatusCard 
                    userId={userId}
                    profileId={adminProfile.id}
                    profileName={`${adminProfile.firstName} ${adminProfile.lastName}`}
                    autoAnalyze={true}
                />
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Recent Documents */}
                <Card className="border border-slate-200 bg-white">
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
                                <div className="text-center py-8 text-slate-500">
                                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p>No documents uploaded yet</p>
                                    <p className="text-sm">Upload your first document to get started!</p>
                                </div>
                            ) : (
                                recentDocuments.map((doc) => (
                                    <div 
                                        key={doc.id} 
                                        className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/documents?profileId=${doc.profileId}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 text-sm">
                                                    {doc.extracted?.document_type 
                                                        ? getDocumentTypeDisplayName(doc.extracted.document_type)
                                                        : doc.name
                                                    }
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {doc.profileName} • {formatDate(doc.createdAt || doc.uploadedAt || '')}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                                            {doc.status}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                    variant="outline"
                    className="h-20 text-left border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
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
                    className="h-20 text-left border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
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
                    className="h-20 text-left border-2 border-dashed border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
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
