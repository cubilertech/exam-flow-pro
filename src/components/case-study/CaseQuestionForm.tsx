import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RemirrorFields {
  question_text: string;
  correct_answer: string;
}
interface Question {
  id: string;
  question_text: string;
  correct_answer: string;
  explanation: string;
}

interface CaseQuestionFormProps {
  caseId: string;
  onFormSubmitted: () => void;
  initialData: Question | null;
}

export const CaseQuestionForm = ({
  caseId,
  onFormSubmitted,
  initialData,
}: CaseQuestionFormProps) => {
  const [formData, setFormData] = useState<RemirrorFields>({
    question_text: normalizeHTML(initialData?.question_text) || "",
    correct_answer: normalizeHTML(initialData?.correct_answer) || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const { toast } = useToast();

  function normalizeHTML(input: string) {
    try {
      const maybeParsed = JSON.parse(input);
      return typeof maybeParsed === "string" ? maybeParsed : input;
    } catch {
      return input;
    }
  }

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

  const questionEditor = useRemirror({
    extensions,
    content: formData.question_text,
    stringHandler: htmlToProsemirrorNode,
  });

  const answerEditor = useRemirror({
    extensions,
    content: formData.correct_answer,
    stringHandler: htmlToProsemirrorNode,
  });

  const handleRemirrorChange = (key: keyof RemirrorFields, html: string) => {
    setFormData((prev) => ({ ...prev, [key]: JSON.stringify(html) }));
  };

  const getStrippedTextLength = (html: string) => {
    try {
      const parsed = JSON.parse(html) as string;
      const text = parsed
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, "")
        .replace(/\s+/g, "") 
        .trim();
      return text.length;
    } catch {
      return 0;
    }
  };

  const validateForm = () => {
    const hasQuestion = formData.question_text.trim();
    const answerLength = getStrippedTextLength(formData.correct_answer);

    return hasQuestion && answerLength >= 2;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowErrors(true);
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted errors before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialData?.id) {
        // Update existing question
        await supabase
          .from("case_questions")
          .update({
            question_text: formData.question_text,
            correct_answer: formData.correct_answer,
            explanation: null,
          })
          .eq("id", initialData.id);
      } else {
        
        // Get the current number of questions for this case
        const { count, error: countError } = await supabase
          .from("case_questions")
          .select("*", { count: "exact", head: true })
          .eq("case_id", caseId);

        if (countError) {
          throw countError;
        }

        // Create new question with correct order_index
        await supabase.from("case_questions").insert({
          case_id: caseId,
          question_text: formData.question_text,
          correct_answer: formData.correct_answer,
          explanation: null, // formData.explanation
          order_index: count ?? 0, 
        });
      }

      setShowErrors(false);
      setFormData({
        question_text: "",
        correct_answer: "",
      });

      toast({
        title: "Success",
        description: initialData?.id
          ? "Question updated successfully"
          : "Question created successfully",
      });

      onFormSubmitted();
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
    setFormData({ question_text: "", correct_answer: "" });
    setShowErrors(false);
    onFormSubmitted(); // Call the callback to reset the form state
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {showErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please fill in all required fields before submitting.
          </AlertDescription>
        </Alert>
      )}

      {/* Question using Remirror */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Question *</h3>
        <ThemeProvider>
          <Remirror
            manager={questionEditor.manager}
            initialContent={questionEditor.state}
            onChange={({ helpers }) =>
              handleRemirrorChange("question_text", helpers.getHTML())
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

      {/* Answer using Remirror */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Answer *</h3>
        <ThemeProvider>
          <Remirror
            manager={answerEditor.manager}
            initialContent={answerEditor.state}
            onChange={({ helpers }) =>
              handleRemirrorChange("correct_answer", helpers.getHTML())
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

      {/* Buttons for submit/cancel */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
};
