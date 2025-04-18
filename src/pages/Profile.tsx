
import React from 'react';
import { useAppSelector } from '@/lib/hooks';
import { MainLayout } from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Globe } from 'lucide-react';
import { ProfileForm } from '@/components/profile/ProfileForm';

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>You need to be logged in to view your profile.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.username || 'User'}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-md font-medium mb-2">Account Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-24 text-muted-foreground">Role:</span>
                      <Badge variant={user.isAdmin ? "destructive" : "default"}>
                        {user.isAdmin ? 'Admin' : 'Student'}
                      </Badge>
                    </div>
                    {!user.isAdmin && (
                      <div className="flex items-center">
                        <span className="w-24 text-muted-foreground">Country:</span>
                        <span className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          {user.country || 'Not specified'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Edit Form */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Edit Profile</h3>
                  <ProfileForm />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
