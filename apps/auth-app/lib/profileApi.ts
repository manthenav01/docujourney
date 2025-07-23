import { adminDb } from './firebaseAdmin';
import { Profile } from './types/profile.model';
import { ensureUserDocumentExists } from './userApi';

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
                           (typeof data.lastVisaStatusAnalysis.analyzedAt === 'string' ? data.lastVisaStatusAnalysis.analyzedAt : null),
            };
        }
        
        return {
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || '',
            dateOfBirth: data.dateOfBirth?.toDate?.()?.toISOString() || 
                        (typeof data.dateOfBirth === 'string' ? data.dateOfBirth : null),
            firstEntryDate: data.firstEntryDate?.toDate?.()?.toISOString() || 
                           (typeof data.firstEntryDate === 'string' ? data.firstEntryDate : null),
            firstEntryVisaType: data.firstEntryVisaType || null,
            countryOfCitizen: data.countryOfCitizen || null,
            // Convert Firestore Timestamps to ISO strings
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
            admin: data.admin || false,
            isAdmin: data.admin || false, // Alias for easier component use
            relationship: data.relationship || null,
            currentlyEmployed: data.currentlyEmployed || false,
            lastVisaStatusAnalysis,
        } as Profile;
    });
};

export const createProfile = async (userId: string, profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: Date | null;
    firstEntryDate?: Date | null;
    firstEntryVisaType?: string | null;
    countryOfCitizen?: string | null;
    relationship?: string;
    isAdmin?: boolean;
    currentlyEmployed?: boolean |  null;
}): Promise<string> => {
    // Ensure user document exists first
    await ensureUserDocumentExists(userId);
    
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
        firstEntryDate: profileData.firstEntryDate || null,
        firstEntryVisaType: profileData.firstEntryVisaType || null,
        countryOfCitizen: profileData.countryOfCitizen || null,
        relationship: profileData.relationship || null,
        admin: profileData.isAdmin || false,
        currentlyEmployed: profileData.currentlyEmployed || null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    const docRef = await profileRef.add(newProfile);
    console.log(`Created profile ${docRef.id} for user ${userId}:`, { 
        firstName: profileData.firstName, 
        lastName: profileData.lastName, 
    });
    return docRef.id;
};

export const updateProfile = async (userId: string, profileId: string, profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: Date | null | string;
    firstEntryDate?: Date | null | string;
    firstEntryVisaType?: string | null;
    countryOfCitizen?: string | null;
    relationship?: string;
    isAdmin?: boolean;
    currentlyEmployed?: boolean;
}): Promise<void> => {
    const profileRef = adminDb
        .collection('users')
        .doc(userId)
        .collection('profiles')
        .doc(profileId);
    
    const updateData: Record<string, any> = {
        ...profileData,
        updatedAt: new Date(),
    };
    
    // Map isAdmin to admin for consistency with existing data structure, but only if isAdmin is defined
    if (profileData.isAdmin !== undefined) {
        updateData.admin = profileData.isAdmin;
    }
    
    // Remove isAdmin from updateData since we mapped it to admin (or it's undefined)
    delete updateData.isAdmin;
    
    await profileRef.update(updateData);
};

export const createAdminProfileForNewUser = async (userId: string): Promise<string> => {
    try {
        // Ensure user document exists first (delegated to userApi)
        await ensureUserDocumentExists(userId);
        
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
        
        // Create admin profile (user document already exists)
        const profileId = await createProfile(userId, {
            firstName,
            lastName,
            email: userRecord.email || '',
            phone: '',
            dateOfBirth: null,
            relationship: 'self',
            isAdmin: true,
            currentlyEmployed: null, // Default to false for new users
        });
        
        console.log(`Created admin profile for user ${userId}:`, { firstName, lastName, email: userRecord.email });
        return profileId;
    } catch (error) {
        console.error('Error creating admin profile for new user:', error);
        throw error;
    }
};