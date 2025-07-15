'use client';

import { useSession } from 'next-auth/react';
import { Users, Building2, MessageSquare, Target } from 'lucide-react';

const stats = [
  { name: 'Total Contacts', stat: '71', icon: Users, color: 'bg-blue-500' },
  { name: 'Active Companies', stat: '23', icon: Building2, color: 'bg-green-500' },
  { name: 'Communications Today', stat: '12', icon: MessageSquare, color: 'bg-yellow-500' },
  { name: 'Open Leads', stat: '8', icon: Target, color: 'bg-purple-500' },
];

const recentActivity = [
  {
    id: 1,
    type: 'contact_added',
    description: 'New contact added: John Smith from Acme Corp',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'email_sent',
    description: 'Email sent to Jane Doe regarding project proposal',
    time: '4 hours ago',
  },
  {
    id: 3,
    type: 'meeting_scheduled',
    description: 'Meeting scheduled with Tech Solutions Inc.',
    time: '6 hours ago',
  },
];

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your CRM today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <div>
              <div className={`absolute ${item.color} rounded-md p-3`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {item.name}
              </p>
            </div>
            <div className="ml-16 pb-6 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivity.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivity.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {activity.description}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 