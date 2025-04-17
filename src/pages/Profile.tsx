import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { supabase } from '@/integrations/supabase/client';
import { QuestionBank } from '@/features/questions/questionsSlice';
import { useQuestionBankSubscriptions } from '@/hooks/useQuestionBankSubscriptions';
import { MainLayout } from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User, Globe, Book, CheckCircle, Lock } from 'lucide-react';

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { subscriptions, subscribeToQuestionBank, activeQuestionBankId, setActiveQuestionBankById } = useQuestionBankSubscriptions();
  const [availableQuestionBanks, setAvailableQuestionBanks] = useState<QuestionBank[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAvailableQuestionBanks = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('question_banks')
          .select('*');

        if (error) throw error;

        const subscribedIds = subscriptions.map(sub => sub.id);
        const available = data.filter(bank => !subscribedIds.includes(bank.id));
        
        setAvailableQuestionBanks(available);
      } catch (error) {
        console.error('Error fetching available question banks:', error);
        toast.error('Failed to fetch available question banks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableQuestionBanks();
  }, [subscriptions]);

  const handleSubscribe = async (questionBankId: string) => {
    await subscribeToQuestionBank(questionBankId);
    setAvailableQuestionBanks(prev => prev.filter(bank => bank.id !== questionBankId));
    
    const dialogCloseButton = document.querySelector('[data-radix-dialog-close]') as HTMLButtonElement;
    if (dialogCloseButton) {
      dialogCloseButton.click();
    }
  };

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-24 text-muted-foreground">Country:</span>
                      <span className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        {user.country || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-muted-foreground">Gender:</span>
                      <span>{user.gender || 'Not specified'}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center">
                        <span className="w-24 text-muted-foreground">Phone:</span>
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.city && (
                      <div className="flex items-center">
                        <span className="w-24 text-muted-foreground">City:</span>
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
                      <Badge variant={user.isAdmin ? "destructive" : "default"}>
                        {user.isAdmin ? 'Admin' : 'Student'}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-muted-foreground">Subscriptions:</span>
                      <Badge variant="outline">{subscriptions.length} Question Banks</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="subscriptions">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subscriptions">My Subscriptions</TabsTrigger>
              <TabsTrigger value="available">Available Question Banks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscriptions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Book className="h-5 w-5 mr-2" />
                    Subscribed Question Banks
                  </CardTitle>
                  <CardDescription>
                    You are currently subscribed to {subscriptions.length} question bank(s).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {subscriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Lock className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground mb-4">You haven't subscribed to any question banks yet.</p>
                      <Button variant="outline" onClick={() => document.getElementById('available-tab-trigger')?.click()}>
                        Browse Available Question Banks
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscriptions.map((bank) => (
                          <TableRow key={bank.id}>
                            <TableCell className="font-medium">{bank.name}</TableCell>
                            <TableCell>{bank.description || 'No description available'}</TableCell>
                            <TableCell>
                              {bank.id === activeQuestionBankId ? (
                                <Badge className="flex items-center bg-green-500 text-white">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Active
                                </Badge>
                              ) : (
                                <Badge variant="outline">Subscribed</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {bank.id !== activeQuestionBankId && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setActiveQuestionBankById(bank.id)}
                                >
                                  Set Active
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="available" className="mt-4" id="available-tab">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Book className="h-5 w-5 mr-2" />
                    Available Question Banks
                  </CardTitle>
                  <CardDescription>
                    Subscribe to question banks to access their content.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <p>Loading available question banks...</p>
                    </div>
                  ) : availableQuestionBanks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <CheckCircle className="h-12 w-12 text-primary mb-2" />
                      <p className="text-muted-foreground">You've subscribed to all available question banks!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableQuestionBanks.map((bank) => (
                        <Card key={bank.id} className="border border-border">
                          <CardHeader>
                            <CardTitle className="text-lg">{bank.name}</CardTitle>
                            <CardDescription>
                              {bank.description || 'No description available'}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="flex justify-end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="default" size="sm">Subscribe</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Subscribe to {bank.name}</DialogTitle>
                                  <DialogDescription>
                                    You are about to subscribe to this question bank. This will give you access to all its content.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <p className="text-muted-foreground">{bank.description || 'No description available'}</p>
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button 
                                    onClick={() => handleSubscribe(bank.id)}
                                  >
                                    Confirm Subscription
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
