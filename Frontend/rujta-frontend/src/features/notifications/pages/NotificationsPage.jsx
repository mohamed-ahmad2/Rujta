import React from "react";
import { useNotifications } from "../hook/useNotifications";


const NotificationsPage = () => {
  const { notifications, loading, markAsRead } = useNotifications();

  if (loading) {
    return <div className="p-6">Loading notifications...</div>;
  }

  return (
    
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {notifications.length === 0 && (
        <p className="text-gray-500">No notifications yet.</p>
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.isRead && markAsRead(n.id)}
            className={`p-4 border rounded cursor-pointer transition
              ${n.isRead ? "bg-gray-100" : "bg-white hover:bg-gray-50"}
            `}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">{n.title}</h4>
              {!n.isRead && (
                <span className="text-xs bg-secondary text-white px-2 py-1 rounded">
                  New
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
