'use client'
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { formatValue } from '@/utils/documentUtils';
import { DocumentMetaDataTransformedModel } from '@/lib/types/document.model';

interface DocumentCardBodyProps {
    doc: DocumentMetaDataTransformedModel;
    documentSchema: DocumentTypeSchemaModel;
}

const DocumentCardBody: React.FC<DocumentCardBodyProps> = ({ doc, documentSchema }) => {
    return (
        <>
            {documentSchema?.fields && documentSchema.fields.filter((field: any) => field.displayInOverview).map((field: any) => {
                if (!field.key || !doc.extracted) return null;
                const value = doc.extracted[field.key as keyof typeof doc.extracted];
                if (value === undefined || value === null) return null;
                const displayValue = formatValue(value, field.type);
                return (
                    <div key={field.key} className="flex justify-between pb-2">
                        <span className="text-muted-foreground">{field.label}:</span>
                        <span className="">{displayValue}</span>
                    </div>
                );
            })}
            </>
    );
};

export default DocumentCardBody; 