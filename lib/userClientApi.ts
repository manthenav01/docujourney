import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const ensureUserDocumentExistsClient = async (
    userId: string,
    email: string | null,
    displayName: string | null,
    photoURL: string | null,
    provider: string
): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            // Create new user document
            await setDoc(userDocRef, {
                uid: userId,
                email: email || '',
                displayName: displayName || '',
                photoURL: photoURL || '',
                createdAt: new Date(),
                updatedAt: new Date(),
                provider: provider,
                lastLoginAt: new Date()
            });
            console.log('Created user document for:', userId);
        } else {
            // Update last login time
            await setDoc(userDocRef, {
                lastLoginAt: new Date(),
                updatedAt: new Date()
            }, { merge: true });
            console.log('Updated last login for:', userId);
        }
    } catch (error) {
        console.error('Error ensuring user document exists:', error);
        throw error;
    }
};

export const createUserDocumentClient = async (userData: {
    userId: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    provider: string;
}): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', userData.userId);
        
        await setDoc(userDocRef, {
            uid: userData.userId,
            email: userData.email,
            displayName: userData.displayName || '',
            photoURL: userData.photoURL || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            provider: userData.provider,
            lastLoginAt: new Date()
        });
        
        console.log('Created user document for:', userData.userId);
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
};

export const updateUserLastLoginClient = async (userId: string): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', userId);
        
        await setDoc(userDocRef, {
            lastLoginAt: new Date(),
            updatedAt: new Date()
        }, { merge: true });
        
        console.log('Updated last login for:', userId);
    } catch (error) {
        console.error('Error updating user last login:', error);
        throw error;
    }
};
