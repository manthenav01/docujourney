import { adminDb } from "./firebaseAdmin";
import { Profile } from "./types/profile.model";

export const fetchProfiles = async (userId: string) => {
    // Use Firebase Admin SDK to bypass security rules for SSR
    const snapshot = await adminDb
        .collection('users')
        .doc(userId)
        .collection('profiles')
        .get();
    return snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            // Convert Firestore Timestamps to ISO strings
            createdAt: data.createdAt?.toDate().toISOString() || null,
            updatedAt: data.updatedAt?.toDate().toISOString() || null,
            admin: data.admin || false,
            relationship: data.relationship || null,
        } as Profile;
    });
};

export const createProfile = async (userId: string, profileData: {
    firstName: string;
    lastName: string;
    email: string;
    relationship?: string;
}): Promise<string> => {
    const profileRef = adminDb
        .collection('users')
        .doc(userId)
        .collection('profiles');
    
    const newProfile = {
        ...profileData,
        admin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    const docRef = await profileRef.add(newProfile);
    return docRef.id;
};