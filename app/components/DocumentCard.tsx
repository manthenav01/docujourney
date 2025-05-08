import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/Button';
import { TrashIcon, FileIcon, FolderIcon } from 'lucide-react';
import { deleteDocument } from '@/lib/documentActions';
import DocumentStatusBadge from '@/components/ui/DocumentStatusBadge';

interface DocumentCardProps {
    doc: any;
    userId: string;
    profileId: string;
    documentSchema: any;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, userId, profileId, documentSchema }) => {
    const handleDelete = async () => {
        try {
            await deleteDocument(userId, profileId, doc.id);
            alert('Document deleted successfully.');
        } catch (error) {
            alert('Failed to delete document.');
        }
    };

    return (
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
                    </div>
                    {doc.extracted?.valid_to ? (
                        <DocumentStatusBadge validTo={doc.extracted.valid_to} />
                    ) : null}
                </div>
            </CardHeader>
            <Separator orientation="horizontal" />
            <CardContent>
                {documentSchema?.fields?.filter((f: any) => f.displayInOverview).map((field: any) => {
                    if (!field.key || !doc.extracted) return null;
                    const value = doc.extracted[field.key as keyof typeof doc.extracted];
                    if (value === undefined || value === null) return null;
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
                <Button variant={"outline"} onClick={handleDelete}>
                    <TrashIcon className="h-4 w-4 mr-2 " />
                </Button>
                <Button variant={"outline"}>
                    <FileIcon className="h-4 w-4 mr-2" />
                    View
                </Button>
            </CardFooter>
        </Card>
    );
};

export default DocumentCard; 