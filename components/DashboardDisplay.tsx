import React from 'react';
import DocumentStatusBadge from './ui/DocumentStatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import {  FileIcon, FolderIcon, } from 'lucide-react';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { Separator } from './ui/separator';
import { Button } from './ui/Button';
import DocumentCardBody from './DocumentCardBody';
import { DocumentMetaDataTransformedModel } from '@/lib/types/document.model';


interface DashboardDisplayProps {
    userId: string;
    initialProfileId: string;
    documentGroups: { documentType: string; docs: DocumentMetaDataTransformedModel[] }[];
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
                                    <DocumentCardBody doc={group.docs[0]} documentSchema={documentSchemas[group.documentType]} />
                                </Link>
                                <Separator
                                    orientation="horizontal"
                                />
                                <CardFooter className="flex justify-between">
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
