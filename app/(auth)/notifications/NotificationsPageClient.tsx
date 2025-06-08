"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

interface NotificationsPageClientProps {
  notifications: NotificationItem[];
}

const NotificationsPageClient: React.FC<NotificationsPageClientProps> = ({ notifications }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Stay updated with the latest activity on your account
          </p>
        </div>

        {sortedNotifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet.</p>
        ) : (
          <div className="space-y-4">
            {sortedNotifications.map((n) => (
              <Card key={n.id} className="bg-white border shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">
                      {n.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{formatDate(n.date)}</p>
                  </div>
                  {!n.read && <Badge variant="secondary">New</Badge>}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm">{n.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPageClient;
