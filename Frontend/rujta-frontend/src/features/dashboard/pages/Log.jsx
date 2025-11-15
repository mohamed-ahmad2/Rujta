import React from 'react';

export default function Log() {
  const logs = [
    { id: 1, user: 'Admin', action: 'Logged in', time: '2025-10-21 09:15:23' },
    { id: 2, user: 'John Doe', action: 'Updated product "Laptop X"', time: '2025-10-21 09:20:47' },
    { id: 3, user: 'System', action: 'Database backup completed', time: '2025-10-21 09:30:05' },
    { id: 4, user: 'Admin', action: 'Added new user "Sarah"', time: '2025-10-21 09:42:18' },
    { id: 5, user: 'John Doe', action: 'Viewed sales report', time: '2025-10-21 09:55:41' },
    { id: 6, user: 'System', action: 'Email notifications sent', time: '2025-10-21 10:10:00' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">🧾 Logs</h1>
      <p className="mb-4 text-gray-700">View your recent activity and system logs.</p>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-100 text-gray-700">
              <th className="px-4 py-2 border-b">#</th>
              <th className="px-4 py-2 border-b">User</th>
              <th className="px-4 py-2 border-b">Action</th>
              <th className="px-4 py-2 border-b">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{log.id}</td>
                <td className="px-4 py-2 border-b">{log.user}</td>
                <td className="px-4 py-2 border-b">{log.action}</td>
                <td className="px-4 py-2 border-b text-gray-500">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
