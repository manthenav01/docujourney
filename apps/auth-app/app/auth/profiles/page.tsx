import { cookies } from 'next/headers';
import { fetchProfiles } from '@/lib/profileApi';
import ProfilesPageClient from './ProfilesPageClient';

const ProfilesPage = async () => {
    const cookiesList = await cookies();
    const userId = cookiesList.get('userId')?.value;

    if (!userId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">You must be logged in to view this page.</p>
            </div>
        );
    }

    try {
        const profiles = await fetchProfiles(userId);

        return (
            <ProfilesPageClient 
                profiles={profiles}
                userId={userId}
            />
        );
    } catch (error) {
        console.error('Error fetching profiles:', error);
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-600">Failed to load profiles. Please try again.</p>
            </div>
        );
    }
};

export default ProfilesPage;
