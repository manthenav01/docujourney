"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/Button';
import { TrashIcon, FileIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DocumentStatusBadge from '@/components/ui/DocumentStatusBadge';
import { toast } from 'sonner';
import { getFileTypeIcon, getFileTypeColor } from '@/utils/fileTypeIcons';

interface DocumentCardProps {
    doc: any;
    userId: string;
    profileId: string;
    documentSchema: any;
    children?: React.ReactNode;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, userId, profileId, documentSchema, children }) => {
    const router = useRouter();
    const FileTypeIcon = getFileTypeIcon(doc.name);
    const fileTypeColor = getFileTypeColor(doc.name);
    
    const handleDelete = async () => {
        try {
            const res = await fetch('/api/deleteDocument', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, profileId, documentId: doc.id }),
            });
            if (!res.ok) throw new Error();
            toast.success('Document deleted successfully.');
            router.refresh();
        } catch (error) {
            toast.error('Failed to delete document.');
        }
    };
    return (
        <Card key={doc.id}>
            <CardHeader className="flex items-center gap-4">
                <div className={`${fileTypeColor.bg} p-3 rounded-lg`}>
                    <FileTypeIcon className={`h-8 w-8 ${fileTypeColor.text}`} />
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
                {children}
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