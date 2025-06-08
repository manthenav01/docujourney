import { cookies } from 'next/headers';
import NotificationsPageClient from './NotificationsPageClient';

const NotificationsPage = async () => {
  const cookiesList = await cookies();
  const userId = cookiesList.get('userId')?.value;

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">You must be logged in to view this page.</p>
      </div>
    );
  }

  // Mock notifications data - replace with Firestore fetch later
  const mockNotifications = [
    {
      id: '1',
      title: 'Welcome to DocuJourney!',
      message: 'Thanks for signing up. Start uploading your documents.',
      date: '2023-10-01T10:00:00Z',
      read: false,
    },
    {
      id: '2',
      title: 'Document Expiring Soon',
      message: 'Your passport will expire in 30 days.',
      date: '2023-09-25T09:00:00Z',
      read: false,
    },
    {
      id: '3',
      title: 'Profile Updated',
      message: "You successfully updated John's profile.",
      date: '2023-09-20T08:30:00Z',
      read: true,
    },
  ];

  return <NotificationsPageClient notifications={mockNotifications} />;
};

export default NotificationsPage;
