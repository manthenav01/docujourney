import React from 'react';
import DocumentStatusBadge from './ui/DocumentStatusBadge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { DeleteIcon, FileIcon, FolderIcon, TrashIcon } from 'lucide-react';
import { DocumentMetaDataModel, DocumentExtractedResponseData } from '@/lib/types/document.model';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { Separator } from './ui/separator';
import { Button } from './ui/Button';
import { Badge } from './ui/badge';

// Helper function to format values based on their type
function formatValue(value: any, fieldType?: string): string {
    // Handle null or undefined
    if (value === undefined || value === null) return 'N/A';

    // Handle Firebase Timestamp objects
    if (value && typeof value === 'object' && 'seconds' in value) {
        return new Date(value.seconds * 1000).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Handle date strings if field type is date
    if (fieldType === 'date' && typeof value === 'string') {
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime())) {
            return dateValue.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        }
    }

    // Return string representation for everything else
    return String(value);
}


interface DashboardDisplayProps {
    userId: string;
    initialProfileId: string;
    documentGroups: { documentType: string; docs: DocumentMetaDataModel[] }[];
    documentSchemas: Record<string, DocumentTypeSchemaModel>;
}

export default function DashboardDisplay({
    userId,
    initialProfileId,
    documentGroups,
    documentSchemas,
}: DashboardDisplayProps) {
    return (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documentGroups.length === 0 ? (
                <p>No documents found for this profile.</p>
            ) : (
                documentGroups.map((group) => (
                    <div key={group.documentType} >
                        {group.docs.length > 0 ? (
                            <Card key={group.docs[0].id}>
                                <CardHeader className="flex items-center gap-4">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <FolderIcon className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="flex justify-between flex-1 items-start">
                                        <div>
                                            <CardTitle className="text-lg font-medium text-slate-800">
                                                {documentSchemas[group.documentType]?.displayName || group.documentType}
                                            </CardTitle>
                                            <CardDescription className="text-sm text-muted-foreground">
                                                {group.docs?.length || 0} documents
                                            </CardDescription>
                                        </div>
                                        {group.docs[0]?.extracted?.valid_to ? (
                                            <DocumentStatusBadge
                                                validTo={group.docs[0]?.extracted?.valid_to}
                                            />
                                        ) : null}
                                    </div>

                                </CardHeader>

                                <Separator
                                    orientation="horizontal"
                                />
                                <Link
                                    href={`/dashboard/${group.documentType}?profileId=${initialProfileId}`}
                                    passHref
                                >
                                    <CardContent className="cursor-pointer">
                                    {/* Document metadata - key-value pairs */}
                                        {documentSchemas[group.documentType]?.fields
                                        ?.filter(field => field.displayInOverview)
                                        .map((field) => {
                                            // Skip if no key or the document has no extracted data
                                            if (!field.key || !group.docs[0]?.extracted) return null;

                                            // Safely access the field value from extracted data
                                            const extractedData = group.docs[0].extracted;
                                            const value = extractedData[field.key as keyof typeof extractedData];

                                            // Skip if the value doesn't exist
                                            if (value === undefined || value === null) return null;

                                            // Use the helper function to format the value
                                            const displayValue = formatValue(value, field.type);

                                            return (
                                                <div key={field.key} className="flex justify-between pb-2">
                                                    <span className="text-muted-foreground">{field.label}:</span>
                                                    <span className="">{displayValue}</span>
                                                </div>
                                            );
                                        })
                                        }
                                    </CardContent>
                                </Link>
                                <Separator
                                    orientation="horizontal"
                                />
                                <CardFooter className="flex justify-between">
                                    <Button variant={"outline"} >
                                        <TrashIcon className="h-4 w-4 mr-2 " />
                                    </Button>

                                    <Button variant={"outline"} >
                                        <FileIcon className="h-4 w-4 mr-2" />
                                        View
                                    </Button>
                                </CardFooter>
                            </Card>
                        ) : (
                            <p>No documents of this type.</p>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
