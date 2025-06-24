'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { BadgeCheck, ShieldX, Trash } from 'lucide-react';

export default function DetailsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error('Expected array but got:', data);
        toast.error(data?.error || 'Unexpected response from server');
        setUsers([]);
        return;
      }

      setUsers(data);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const cycleRole = (currentRole: string) => {
    if (currentRole === 'USER') return 'ADMIN';
    if (currentRole === 'ADMIN') return 'OWNER';
    return 'USER';
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const newRole = cycleRole(currentRole);
    try {
      const res = await fetch('/api/admin/user/role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error();
      toast.success('Role updated');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update role');
    }
  };

  const handleToggleVerified = async (
    userId: string,
    currentVerified: boolean
  ) => {
    try {
      const res = await fetch('/api/admin/user/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verified: !currentVerified }),
      });
      if (!res.ok) throw new Error();
      toast.success('Verification updated');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle verification');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/user/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-yellow-100 text-yellow-800';
      case 'OWNER':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredUsers = users.filter((user) => {
    const valuesToSearch = [
      user.name,
      user.email,
      user.role,
      user.details?.organizationName,
      user.details?.organizationAddress,
      user.details?.gstNumber,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return valuesToSearch.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Team Members</h1>

      {/* Search Field */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, role, org..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user: any) => (
            <Card
              key={user.id}
              className="bg-white/80 backdrop-blur-lg shadow-md rounded-xl border border-gray-200"
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-start flex-col gap-2 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {user.name || 'No name'}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div>
                      {user.details?.verified ? (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-100 border border-green-400 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-4 h-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-red-600 bg-red-100 border border-red-400 px-2 py-0.5 rounded-full">
                          <ShieldX className="w-4 h-4" />
                          Unverified
                        </span>
                      )}
                    </div>

                    <span
                      className={clsx(
                        'text-xs font-bold px-2 py-1 rounded-full',
                        getRoleBadgeColor(user.role)
                      )}
                    >
                      {user.role}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-700">
                {user.details ? (
                  <>
                    <p>
                      <strong>Organization :</strong>{' '}
                      {user.details.organizationName}
                    </p>
                    <p>
                      <strong>Address :</strong>{' '}
                      {user.details.organizationAddress}
                    </p>
                    <p>
                      <strong>GST :</strong> {user.details.gstNumber}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-400">No details provided</p>
                )}

                <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => handleChangeRole(user.id, user.role)}
                  >
                    Change Role
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      handleToggleVerified(
                        user.id,
                        user.details?.verified ?? false
                      )
                    }
                  >
                    {user.details?.verified ? 'Unverify' : 'Verify'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No users found.</p>
      )}
    </div>
  );
}
