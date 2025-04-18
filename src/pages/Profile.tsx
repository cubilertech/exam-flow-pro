import React, { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { MainLayout } from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Globe, Pencil } from 'lucide-react';
import { EditProfileModal } from '@/components/profile/EditProfileModal';

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{user.username || 'User'}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
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
                    <div className="flex items-center">
                      <span className="w-24 text-muted-foreground">Country:</span>
                      <span className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        {user.country || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Show subscription section only for students */}
                {!user.isAdmin && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">My Subscriptions</h3>
                    <div>
                      <p>Here you can manage your subscriptions.</p>
                      {/* Add subscription content here */}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditProfileModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen} 
      />
    </MainLayout>
  );
};

export default Profile;
