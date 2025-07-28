import { useState, useEffect } from "react";
import {
  BoldExtension,
  CodeExtension,
  HeadingExtension,
  BlockquoteExtension,
  NodeFormattingExtension,
  BulletListExtension,
  TableExtension,
} from "remirror/extensions";
import { Remirror, ThemeProvider, useRemirror } from "@remirror/react";
import { htmlToProsemirrorNode } from "remirror";
import {
  ToggleCodeButton,
  ToggleBoldButton,
  HeadingLevelButtonGroup,
  IndentationButtonGroup,
  TextAlignmentButtonGroup,
  Toolbar,
} from "@remirror/react-ui";
import { i18nFormat } from "@remirror/i18n";
import { Box } from "@mui/material";
import { UploadImageButton } from "../remirror-extensions/UploadImageButton";
import { TableDropdown } from "../remirror-extensions/TableButton";
import { imageExtension, reactComponentExtension } from "@/lib/image-extension";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";

interface RemirrorFields {
  title: string;
  scenario: string;
}

interface Case {
  id: string;
  title: string;
  scenario: string;
}

interface CaseQuestionFormProps {
  subjectId: string;
  onsuccess : ()=> void;
  initialData?: Case | null;
}

function normalizeHTML(input: string) {
  try {
    const maybeParsed = JSON.parse(input);
    return typeof maybeParsed === "string" ? maybeParsed : input;
  } catch {
    return input;
  }
}

export const CreateCaseStudyCaseForm = ({
  subjectId,
  onsuccess,
  initialData,
}: CaseQuestionFormProps) => {
  const [formData, setFormData] = useState<RemirrorFields>({
    title: initialData?.title || "",
    scenario: normalizeHTML(initialData?.scenario || "") || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const { toast } = useToast();


  const extensions = () => [
    new HeadingExtension({ levels: [1, 2, 3, 4, 5] }),
    new CodeExtension(),
    new BoldExtension({}),
    new BlockquoteExtension(),
    new NodeFormattingExtension({}),
    new BulletListExtension({}),
    new TableExtension(),
    imageExtension(),
    reactComponentExtension(),
  ];

  const scenarioEditor = useRemirror({
    extensions,
    content: formData.scenario,
    stringHandler: htmlToProsemirrorNode,
  });

  const handleRemirrorChange = (key: keyof RemirrorFields, html: string) => {
    setFormData((prev) => ({ ...prev, [key]: JSON.stringify(html) }));
  };

   const getStrippedTextLength = (html: string) => {
  try {
    const parsed = JSON.parse(html) as string;
    const text = parsed
      .replace(/<[^>]+>/g, "")   // Remove HTML tags
      .replace(/&nbsp;/g, "")    // Remove &nbsp;
      .replace(/\s+/g, "")       // Remove all spaces
      .trim();
    return text.length;
  } catch {
    return 0;
  }
};


  const validateForm = () => {
    const hasTitle = formData.title.trim();
    const scenarioLength = getStrippedTextLength(formData.scenario);
    return hasTitle && scenarioLength >= 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowErrors(true);
      console.error("fill the inputs")
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        // Edit existing case
        const { error } = await supabase
          .from("cases")
          .update({
            title: formData.title.trim(),
            scenario: formData.scenario.trim(),
          })
          .eq("id", initialData.id);

        if (error) throw error;

        toast({ title: "Success", description: "Case updated successfully" });
      } else {
        // Create new case
        const { error } = await supabase.from("cases").insert({
          subject_id: subjectId,
          title: formData.title.trim(),
          scenario: formData.scenario.trim(),
        });

        

        if (error) throw error;

        toast({ title: "Success", description: "Case created successfully" });
      }

      setFormData({ title: "", scenario: "" });
      setShowErrors(false);
      onsuccess()

      // onFormSubmitted();
    } catch (err) {
      console.error("Submit error:", err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", scenario: "" });
    setShowErrors(false);
    onsuccess();
    console.log("Cancel")
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {showErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please fill in all required fields of Case before submitting.
          </AlertDescription>
        </Alert>
      )}

      {/* Title */}
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

      {/* Scenario */}
      <div className="editorWrapper">
        <h3 className="font-semibold text-lg mb-2">Scenario *</h3>
        <ThemeProvider>
          <Remirror
            manager={scenarioEditor.manager}
            initialContent={scenarioEditor.state}
            onChange={({ helpers }) =>
              handleRemirrorChange("scenario", helpers.getHTML())
            }
            autoRender="end"
            i18nFormat={i18nFormat}
          >
            <Toolbar>
              <Box sx={{ display: "flex" }}>
                <ToggleBoldButton />
                <HeadingLevelButtonGroup />
                <ToggleCodeButton />
                <TextAlignmentButtonGroup />
                <IndentationButtonGroup />
                <UploadImageButton />
                <TableDropdown />
              </Box>
            </Toolbar>
          </Remirror>
        </ThemeProvider>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} >
          
          {isSubmitting
            ? initialData
              ? "Updating..."
              : "Submitting..."
            : initialData
            ? "Update Case"
            : "Submit"}
        </Button>
      </div>
    </form>
  );
};











