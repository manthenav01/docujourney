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
        } as Profile;
    });
};