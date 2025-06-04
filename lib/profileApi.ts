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
        
        // Handle lastVisaStatusAnalysis conversion
        let lastVisaStatusAnalysis = null;
        if (data.lastVisaStatusAnalysis) {
            lastVisaStatusAnalysis = {
                ...data.lastVisaStatusAnalysis,
                analyzedAt: data.lastVisaStatusAnalysis.analyzedAt?.toDate?.()?.toISOString() || 
                           (typeof data.lastVisaStatusAnalysis.analyzedAt === 'string' ? data.lastVisaStatusAnalysis.analyzedAt : null)
            };
        }
        
        return {
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || '',
            dateOfBirth: data.dateOfBirth?.toDate().toISOString() || null,
            // Convert Firestore Timestamps to ISO strings
            createdAt: data.createdAt?.toDate().toISOString() || null,
            updatedAt: data.updatedAt?.toDate().toISOString() || null,
            admin: data.admin || false,
            isAdmin: data.admin || false, // Alias for easier component use
            relationship: data.relationship || null,
            lastVisaStatusAnalysis
        } as Profile;
    });
};

export const createProfile = async (userId: string, profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: Date | null;
    relationship?: string;
    isAdmin?: boolean;
}): Promise<string> => {
    const profileRef = adminDb
        .collection('users')
        .doc(userId)
        .collection('profiles');
    
    const newProfile = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth || null,
        relationship: profileData.relationship || null,
        admin: profileData.isAdmin || false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    const docRef = await profileRef.add(newProfile);
    return docRef.id;
};

export const updateProfile = async (userId: string, profileId: string, profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: Date | null;
    relationship?: string;
    isAdmin?: boolean;
}): Promise<void> => {
    const profileRef = adminDb
        .collection('users')
        .doc(userId)
        .collection('profiles')
        .doc(profileId);
    
    const updateData = {
        ...profileData,
        // Map isAdmin to admin for consistency with existing data structure
        admin: profileData.isAdmin,
        updatedAt: new Date(),
    };
    
    // Remove isAdmin from updateData since we mapped it to admin
    delete updateData.isAdmin;
    
    await profileRef.update(updateData);
};

export const createAdminProfileForNewUser = async (userId: string): Promise<string> => {
    try {
        // Get user information from Firebase Auth using Admin SDK
        const admin = await import('firebase-admin');
        const userRecord = await admin.auth().getUser(userId);
        
        // Extract name from displayName or email
        let firstName = 'User';
        let lastName = '';
        
        if (userRecord.displayName) {
            const nameParts = userRecord.displayName.trim().split(' ');
            firstName = nameParts[0] || 'User';
            lastName = nameParts.slice(1).join(' ') || '';
        } else if (userRecord.email) {
            // If no display name, use email username as first name
            const emailUsername = userRecord.email.split('@')[0];
            firstName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
        }
        
        // Create admin profile
        const profileId = await createProfile(userId, {
            firstName,
            lastName,
            email: userRecord.email || '',
            phone: '',
            dateOfBirth: null,
            relationship: 'self',
            isAdmin: true,
        });
        
        console.log(`Created admin profile for user ${userId}:`, { firstName, lastName, email: userRecord.email });
        return profileId;
    } catch (error) {
        console.error('Error creating admin profile for new user:', error);
        throw error;
    }
};