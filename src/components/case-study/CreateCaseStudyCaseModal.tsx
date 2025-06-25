import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateCaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  // onSuccess: () => void;
}

export const CreateCaseStudyCaseModal = ({
  open,
  onOpenChange,
  subjectId,
  // onSuccess,
}: CreateCaseModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    scenario: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a case name");
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase.from("cases").insert({
        subject_id: subjectId,
        title: formData.title.trim(),
        scenario: formData.scenario.trim() || null,
      });

      if (error) throw error;

      toast.success("Case created successfully");
      setFormData({ title: "", scenario: "" });
      onOpenChange(false);
      // onSuccess();
    } catch (error) {
      console.error("Error creating case:", error);
      toast.error("Failed to create case");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: "", scenario: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Case</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Case Name *</Label>
            <Input
              id="name"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter case name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Scenario</Label>
            <Textarea
              id="description"
              value={formData.scenario}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  scenario: e.target.value,
                }))
              }
              placeholder="Enter case description (optional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Case"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
