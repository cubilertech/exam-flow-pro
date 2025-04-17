
import { useState } from "react";
import { Link } from "react-router-dom";
import { Exam } from "@/pages/Exams";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteExamDialog } from "./DeleteExamDialog";
import { format } from "date-fns";

interface ExamsListProps {
  exams: Exam[];
  loading: boolean;
  onRefresh: () => void;
}

export function ExamsList({ exams, loading, onRefresh }: ExamsListProps) {
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (exam: Exam) => {
    setExamToDelete(exam);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Loading exams...
                </TableCell>
              </TableRow>
            ) : exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No exams found. Create a new exam to get started.
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>
                    {exam.description ? exam.description.slice(0, 100) + (exam.description.length > 100 ? '...' : '') : 'No description'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(exam.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/exams/${exam.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Link>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(exam)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteExamDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        exam={examToDelete}
        onConfirm={onRefresh}
      />
    </>
  );
}
