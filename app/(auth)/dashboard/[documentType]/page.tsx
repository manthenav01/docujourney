import { cookies } from 'next/headers';
import { fetchDocumentsByType, sortDocumentsBySchemaOrder } from '@/lib/documentActions';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { DocumentExtractedResponseData } from '@/lib/types/document.model';
import { Separator } from '@/components/ui/separator';
import { FileIcon, FolderIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import DocumentStatusBadge from '@/components/ui/DocumentStatusBadge';
import React from 'react';
import { fetchProfiles } from '@/lib/profileApi';
import ProfileSwitcher from '@/components/ProfileSwitcher';


async function fetchDocumentSchema(documentType: string) {
    // You may want to fetch all schemas and pick one, or fetch by type
    // For now, assume all schemas are available in a single call
    const { fetchDocumentSchemas } = await import('@/lib/documentActions');
    const schemas = await fetchDocumentSchemas();
    return schemas[documentType] || null;
}

const DocumentTypePage = async ({ params, searchParams }: { params: { documentType: string }, searchParams: { profileId?: string } }) => {
    const cookiesList = await cookies();
    const userId = cookiesList.get('userId')?.value;
    const profileIdFromUrl = typeof searchParams.profileId === 'string' ? searchParams.profileId : undefined;
    if (!userId) {
        return <div><p>Missing user or profile information.</p></div>;
    }
    const documentType = params.documentType;
    const profiles = await fetchProfiles(userId);
    const activeProfile = profiles.find(profile => profileIdFromUrl ? profile.id === profileIdFromUrl : profile.admin) || profiles[0];
    const documentSchema = await fetchDocumentSchema(documentType);
    let documents = await fetchDocumentsByType(userId, activeProfile.id, documentType);
    documents = sortDocumentsBySchemaOrder(documents, documentSchema);

    return (
        <>
            <div className="flex items-center justify-between mb-4">

                <h2 className="text-xl font-medium">{documentSchema?.displayName}</h2>
                <ProfileSwitcher
                    profiles={profiles}
                    initialProfileId={activeProfile?.id}
                    userId={userId}
                />
            </div>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {documents.length === 0 ? (
                    <p>No documents found for this type.</p>
                ) : (
                    documents.map((doc) => (
                        <Card key={doc.id}>
                            <CardHeader className="flex items-center gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <FolderIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="flex justify-between flex-1 items-start">
                                    <div>
                                        <CardTitle className="text-lg font-medium text-slate-800">
                                            {doc.name}
                                        </CardTitle>
                                        {/* <CardDescription className="text-sm text-muted-foreground">
                                            {doc.name}
                                        </CardDescription> */}
                                    </div>
                                    {doc.extracted?.valid_to ? (
                                        <DocumentStatusBadge validTo={doc.extracted.valid_to} />
                                    ) : null}
                                </div>
                            </CardHeader>
                            <Separator orientation="horizontal" />
                            <CardContent>
                                {documentSchema?.fields?.filter(f => f.displayInOverview).map((field) => {
                                    if (!field.key || !doc.extracted) return null;
                                    const value = doc.extracted[field.key as keyof typeof doc.extracted];
                                    if (value === undefined || value === null) return null;
                                    // Use the same formatValue logic as DashboardDisplay
                                    let displayValue = '';
                                    if (value && typeof value === 'object' && 'seconds' in value) {
                                        displayValue = new Date(value.seconds * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                    } else if (field.type === 'date' && typeof value === 'string') {
                                        const dateValue = new Date(value);
                                        displayValue = !isNaN(dateValue.getTime()) ? dateValue.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A';
                                    } else {
                                        displayValue = String(value);
                                    }
                                    return (
                                        <div key={field.key} className="flex justify-between pb-2">
                                            <span className="text-muted-foreground">{field.label}:</span>
                                            <span className="">{displayValue}</span>
                                        </div>
                                    );
                                })}
                            </CardContent>
                            <Separator orientation="horizontal" />
                            <CardFooter className="flex justify-between">
                                <Button variant={"outline"}>
                                    <TrashIcon className="h-4 w-4 mr-2 " />
                                </Button>
                                <Button variant={"outline"}>
                                    <FileIcon className="h-4 w-4 mr-2" />
                                    View
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </>
    );
};

export default DocumentTypePage;
