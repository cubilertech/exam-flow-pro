
import React, {
  useEffect,
  useState,
} from 'react';

import {
  Book,
  CheckCircle,
  Globe,
  User,
} from 'lucide-react';

import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useQuestionBankSubscriptions,
} from '@/hooks/useQuestionBankSubscriptions';
import { useAppSelector } from '@/lib/hooks';

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.isAdmin || false;
  const {
    subscriptions,
    activeQuestionBankId,
    setActiveQuestionBankById,
  } = useQuestionBankSubscriptions();
  const [editModalOpen, setEditModalOpen] = useState(false);

  return (
    <>
      <div className="container mx-auto py-8 px-2 md:px-6">
        <div className="flex flex-col space-y-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row  items-start  md:items-center justify-between">
                <div className="flex items-center  space-x-4">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {user.username || "User"}
                    </CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
                <Button
                className='mt-4 md:mt-0'
                  onClick={() => setEditModalOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium mb-2">
                    Personal Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-24 text-muted-foreground">
                        Country:
                      </span>
                      <span className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        {user.country || "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-muted-foreground">
                        Gender:
                      </span>
                      <span className="capitalize">{user.gender || "Not specified"}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center">
                        <span className="w-24 text-muted-foreground">
                          Phone:
                        </span>
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.city && (
                      <div className="flex items-center">
                        <span className="w-24 text-muted-foreground">
                          City:
                        </span>
                        <span>{user.city}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-medium mb-2">Account Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-24 text-muted-foreground">Role:</span>
                      <Badge variant={isAdmin ? "destructive" : "default"}>
                        {isAdmin ? "Admin" : "Student"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4  md:gap-2">
                      <span className="w-24 text-muted-foreground">
                        Subscriptions:
                      </span>
                      <Badge variant="outline">
                        {subscriptions.length} Question Banks
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center pb-1">
                  {/* <Book className="h-5 w-5 mr-2" /> */}
                  My Question Banks
                </CardTitle>
                <CardDescription>
                  Question banks assigned to you by administrators. Contact your admin for access to additional question banks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Book className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-2">
                      No question banks assigned yet.
                    </p>
                    <p className="text-sm text-muted-foreground text-center">
                      Please contact your administrator to get access to question banks.
                    </p>
                  </div>
                ) : (
                  <Table className='w-[30rem] md:w-full'>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        {/* <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((bank) => (
                        <TableRow key={bank.id}>
                          <TableCell className="font-medium">
                            {bank.name}
                          </TableCell>
                          <TableCell className='line-clamp-2'>
                            {bank.description || "No description available"}
                          </TableCell>
                          {/* <TableCell>
                            {bank.id === activeQuestionBankId ? (
                              <Badge className="flex items-center bg-green-500 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />{" "}
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline">Available</Badge>
                            )}
                          </TableCell> */}
                          {/* <TableCell className="text-right">
                            {bank.id !== activeQuestionBankId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setActiveQuestionBankById(bank.id)
                                }
                              >
                                Set Active
                              </Button>
                            )}
                          </TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <EditProfileModal open={editModalOpen} onOpenChange={setEditModalOpen} />
    </>
  );
};

export default Profile;
