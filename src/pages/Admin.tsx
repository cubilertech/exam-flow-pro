import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MakeAdminForm } from "@/components/admin/MakeAdminForm";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("questions");

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="questions">Question Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions">
          <div className="grid gap-6">
            <h2 className="text-xl font-semibold">Question Management</h2>
            {/* Question management components will go here */}
            <p className="text-muted-foreground">Question management functionality coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="grid gap-6">
            <h2 className="text-xl font-semibold">User Management</h2>
            <MakeAdminForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
