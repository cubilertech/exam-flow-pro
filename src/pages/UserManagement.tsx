
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, Shield, ShieldOff, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers, updateUserStatus, deleteUser } from '@/services/authService';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import { EditUserModal } from '@/components/admin/EditUserModal';
import { UserQuestionBankModal } from '@/components/admin/UserQuestionBankModal';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  country: string;
  gender: string;
  phone_number: string;
  city: string;
  status: 'active' | 'blocked' | 'suspended';
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [questionBankModalOpen, setQuestionBankModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      const mappedUsers = usersData.map((user: any) => ({
        ...user,
        status: user.status || 'active'
      }));
      setUsers(mappedUsers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await updateUserStatus(userId, newStatus);
      await fetchUsers();
      toast({
        title: "Success",
        description: `User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      await fetchUsers();
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleOpenQuestionBankModal = (user: UserProfile) => {
    setSelectedUser(user);
    setQuestionBankModalOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'blocked':
        return 'destructive';
      case 'suspended':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users and their access to question banks</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-lg">{user.username}</CardTitle>
                    <CardDescription>{user.full_name}</CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {user.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenQuestionBankModal(user)}
                    title="Manage Question Bank Access"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setEditModalOpen(true);
                    }}
                    title="Edit User"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusToggle(user.id, user.status)}
                    title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                  >
                    {user.status === 'active' ? (
                      <ShieldOff className="h-4 w-4" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" title="Delete User">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {user.username}? This action cannot be undone and will remove all their question bank access.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Country</p>
                  <p>{user.country || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p>{user.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p>{user.phone_number || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">City</p>
                  <p>{user.city || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onUserCreated={fetchUsers}
      />

      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUserUpdated={fetchUsers}
      />

      <UserQuestionBankModal
        isOpen={questionBankModalOpen}
        onClose={() => {
          setQuestionBankModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUpdated={fetchUsers}
      />
    </div>
  );
};

export default UserManagement;
