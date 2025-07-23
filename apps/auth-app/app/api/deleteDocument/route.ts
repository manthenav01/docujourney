import { NextRequest, NextResponse } from 'next/server';
import { deleteDocument } from '@/lib/documentActions';

export async function POST(request: NextRequest) {
    try {
        const { userId, profileId, documentId } = await request.json();

        // Validate required parameters
        if (!userId || !profileId || !documentId) {
            return NextResponse.json(
                { error: 'Missing required parameters: userId, profileId, or documentId' },
                { status: 400 },
            );
        }

        // Delete the document using the existing function
        await deleteDocument(userId, profileId, documentId);

        return NextResponse.json(
            { message: 'Document deleted successfully' },
            { status: 200 },
        );
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: 'Failed to delete document' },
            { status: 500 },
        );
    }
}
