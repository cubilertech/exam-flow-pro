import React, { useRef, useState } from "react";
import { useRemirrorContext, NodeViewComponentProps } from "@remirror/react";
import { Trash2 } from "lucide-react";

export const CustomImageComponent: React.FC<NodeViewComponentProps> = ({
  node,
  getPosition,
}) => {
  const { view } = useRemirrorContext();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDelete = () => {
    const pos = getPosition?.();
    if (typeof pos === "number") {
      const tr = view.state.tr.delete(pos, pos + node.nodeSize);
      view.dispatch(tr);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    const width = e.clientX - rect.left;

    const pos = getPosition?.();
    if (typeof pos === "number") {
      const tr = view.state.tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        width: Math.max(50, width),
      });
      view.dispatch(tr);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Bind mouse events
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="relative inline-block group"
      style={{ width: node.attrs.width || 300 }}
    >
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt}
        className="h-auto rounded block"
        style={{ width: node.attrs.width || 300 }}
      />

      {/* Delete button */}
      <button
        type="button"
        onClick={handleDelete}
        className="absolute top-1 right-1 bg-white rounded-full shadow p-1 z-10 hidden group-hover:block"
        title="Delete Image"
      >
        <Trash2 size={16} className="text-red-600" />
      </button>

      {/* Manual resizer handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute bottom-1 right-1 w-4 h-4 bg-blue-500 cursor-se-resize z-10 rounded"
        title="Resize"
        style={{
          touchAction: "none",
        }}
      ></div>
    </div>
  );
};
