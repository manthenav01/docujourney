import { adminDb } from "./firebaseAdmin";

export const ensureUserDocumentExists = async (userId: string): Promise<void> => {
    try {
        // Get user information from Firebase Auth using Admin SDK
        const admin = await import('firebase-admin');
        const userRecord = await admin.auth().getUser(userId);
        
        const userDocRef = adminDb.collection('users').doc(userId);
        const userDoc = await userDocRef.get();
        
        if (!userDoc.exists) {
            // Create the user document with basic info
            await userDocRef.set({
                uid: userId,
                email: userRecord.email || '',
                displayName: userRecord.displayName || '',
                photoURL: userRecord.photoURL || '',
                createdAt: new Date(),
                updatedAt: new Date(),
                provider: userRecord.providerData?.[0]?.providerId || 'email',
                lastLoginAt: new Date()
            });
            console.log(`Created user document for user ${userId}`);
        } else {
            // Update lastLoginAt if user document exists
            await userDocRef.update({
                lastLoginAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`Updated user document for user ${userId}`);
        }
    } catch (error) {
        console.error('Error ensuring user document exists:', error);
        throw error;
    }
};

export const createUserDocument = async (userId: string, userData: {
    email: string;
    displayName?: string;
    photoURL?: string;
    provider: string;
}): Promise<void> => {
    try {
        const userDocRef = adminDb.collection('users').doc(userId);
        
        await userDocRef.set({
            uid: userId,
            email: userData.email,
            displayName: userData.displayName || '',
            photoURL: userData.photoURL || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            provider: userData.provider,
            lastLoginAt: new Date()
        });
        
        console.log(`Created user document for user ${userId}`);
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
};

export const updateUserLastLogin = async (userId: string): Promise<void> => {
    try {
        const userDocRef = adminDb.collection('users').doc(userId);
        
        await userDocRef.update({
            lastLoginAt: new Date(),
            updatedAt: new Date()
        });
        
        console.log(`Updated last login for user ${userId}`);
    } catch (error) {
        console.error('Error updating user last login:', error);
        throw error;
    }
};

export const getUserDocument = async (userId: string) => {
    try {
        const userDocRef = adminDb.collection('users').doc(userId);
        const userDoc = await userDocRef.get();
        
        if (userDoc.exists) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error fetching user document:', error);
        throw error;
    }
};