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
import {
  Remirror,
  ThemeProvider,
  useRemirror,
} from "@remirror/react";
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
import { toast } from "@/hooks/use-toast";

interface RemirrorFields {
  question: string;
  answer: string;
  explanation: string;
}

interface CaseQuestionFormProps {
  caseId: string;
  onFormSubmitted: () => void;
}

export const CaseQuestionForm = ({ caseId, onFormSubmitted }: CaseQuestionFormProps) => {
  const [formData, setFormData] = useState<RemirrorFields>({
    question: "",
    answer: "",
    explanation: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

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
    content: formData.question,
    stringHandler: htmlToProsemirrorNode,
  });

  const answerEditor = useRemirror({
    extensions,
    content: formData.answer,
    stringHandler: htmlToProsemirrorNode,
  });

  const explanationEditor = useRemirror({
    extensions,
    content: formData.explanation,
    stringHandler: htmlToProsemirrorNode,
  });

  const handleRemirrorChange = (key: keyof RemirrorFields, html: string) => {
    setFormData((prev) => ({ ...prev, [key]: JSON.stringify(html) }));
  };

  const validateForm = () => {
    return (
      formData.question.trim() &&
      formData.answer.trim() &&
      formData.explanation.trim()
    );
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
      console.log("Form submitted:", formData);
      // Your Supabase save logic here
      // await supabase.from('case_questions').insert({
      //   case_id: caseId,
      //   question: formData.question,
      //   answer: formData.answer,
      //   explanation: formData.explanation,
      // });
      // Simulate a successful submission
      onFormSubmitted();
      setShowErrors(false);
      setFormData({ question: "", answer: "", explanation: "" });
    //  toast({
    //     title: "Success",
    //     description: initialData
    //       ? "Question updated successfully"
    //       : "Question created successfully",
    //   });   
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ question: "", answer: "", explanation: "" });
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
              handleRemirrorChange("question", helpers.getHTML())
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
              handleRemirrorChange("answer", helpers.getHTML())
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

      {/* Explanation using Remirror */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Explanation *</h3>
        <ThemeProvider>
          <Remirror
            manager={explanationEditor.manager}
            initialContent={explanationEditor.state}
            onChange={({ helpers }) =>
              handleRemirrorChange("explanation", helpers.getHTML())
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
