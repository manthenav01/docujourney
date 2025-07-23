/**
 * Authentication Service
 * Handles the complete authentication flow including user document creation
 * This is the proper place to handle user document creation as it's part of the auth flow
 */

import { ensureUserDocumentExistsClient } from './userClientApi';
import { auth } from './firebase';
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithEmailAndPassword,
    User, 
} from 'firebase/auth';

/**
 * Complete Google authentication flow including user document creation
 */
export const authenticateWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Ensure user document exists after successful authentication
    await ensureUserDocumentExistsClient(
        user.uid,
        user.email,
        user.displayName,
        user.photoURL,
        'google',
    );
    
    // Set authentication cookie
    document.cookie = `userId=${user.uid}; path=/;`;
    
    return user;
};

/**
 * Complete email/password authentication flow including user document creation
 */
export const authenticateWithEmailPassword = async (email: string, password: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Ensure user document exists after successful authentication
    await ensureUserDocumentExistsClient(
        user.uid,
        user.email,
        user.displayName,
        user.photoURL,
        'email',
    );
    
    // Set authentication cookie
    document.cookie = `userId=${user.uid}; path=/;`;
    
    return user;
};

/**
 * Handle authentication errors with appropriate error messages
 */
export const getAuthErrorMessage = (error: any): string => {
    if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
                return 'No account found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/invalid-email':
                return 'Invalid email address format.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in was cancelled.';
            case 'auth/cancelled-popup-request':
                return 'Sign-in was cancelled.';
            default:
                return 'Authentication failed. Please try again.';
        }
    }
    return 'An unexpected error occurred. Please try again.';
};
