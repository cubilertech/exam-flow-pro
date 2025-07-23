import { CSS } from "@dnd-kit/utilities";
import { Edit, GripVertical, Trash2 } from "lucide-react";
import { CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { useSortable } from "@dnd-kit/sortable";

interface Question {
  id: string;
  question_text: string;
  case_id: number;
  correct_answer: string;
  explanation: string;
  order_index: number;
}

export const SortableItem = ({
  selectedQuestion,
  onDelete,
  onEdit,
}: {
  selectedQuestion: Question;
  onDelete: (question: Question) => void;
  onEdit: (question: Question) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: selectedQuestion.id });
  const customListeners = {
    ...listeners,
    onPointerDown: (event: React.PointerEvent) => {
      const isNoDrag = (event.target as HTMLElement)?.closest("[data-no-drag]");
      if (isNoDrag) {
        return; // Block drag
      }
      listeners?.onPointerDown?.(event); // Call original
    },
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function normalizeHTML(input: string): string {
    try {
      const maybeParsed = JSON.parse(input);
      input = typeof maybeParsed === "string" ? maybeParsed : input;
    } catch {
      // do nothing
    }

    return input
      .replace(/<\/?(div|p|br|h[1-6]|ul|li)[^>]*>/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }


  return (
    <div ref={setNodeRef} style={style} {...attributes} {...customListeners}>
      <div className="flex min-h-full">
        {/* Drag Handle */}
        <div className="w-12 cursor-move bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center rounded-l-lg border-r">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Question Content */}
        <CardHeader
          className="pb-3 p-4 bg-gray-100 flex-1 group rounded-r-lg"
          data-no-drag
        >
          <div style={{ display: "flex" }}>
            <div className="w-full rounded-xl shadow-md p-4 relative">

              {/* Edit/Delete Buttons - now top-right positioned */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-100 pointer-events-auto md:opacity-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto transition-all duration-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors px-2 md:px-3"
                  onClick={() => onEdit(selectedQuestion)}
                >
                  <Edit className="w-2 h-2" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors px-2 md:px-3"
                  onClick={() => onDelete(selectedQuestion)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              {/* Question Content */}
              <div className="flex items-center gap-2 text-sm md:text-base w-full overflow-hidden">
                <span className="font-bold shrink-0">
                  Q: {selectedQuestion.order_index + 1}
                </span>
                {
                  (() => {
                    const html = normalizeHTML(selectedQuestion.question_text);
                    const imgMatch = html.match(/^<img[^>]*src="([^"]+)"[^>]*>/i);
                    const imgSrc = imgMatch ? imgMatch[1] : '';
                    const textWithoutImg = html.replace(/^<img[^>]*>/i, '').trim();

                    return (
                      <div className="flex items-center gap-2 w-full overflow-hidden text-ellipsis">
                        {imgSrc && (
                          <img
                            src={imgSrc}
                            alt=""
                            className="w-[100%] h-6 object-fit shrink-0"
                          />
                        )}
                        <span
                          className="w-[100%] h-6 object-fit shrink-0 text-ellipsis"
                          dangerouslySetInnerHTML={{ __html: textWithoutImg }}
                        />
                      </div>
                    );
                  })()
                }
              </div>
            </div>
          </div>

        </CardHeader>
      </div>
      {/* </Card> */}
    </div>
  );
};
