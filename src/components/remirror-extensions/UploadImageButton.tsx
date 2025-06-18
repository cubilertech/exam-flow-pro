import { useCommands } from "@remirror/react";
import { useRef } from "react";
import { Image } from "lucide-react";
import { IconButton } from "@mui/material";

export const UploadImageButton: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { insertImage } = useCommands();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const base64 = await convertToBase64(file);
    insertImage({
      src: base64,
      alt: file.name,
      title: file.name,
    });
    event.target.value = "";
  };

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  return (
    <>
      <IconButton
        size="small"
        sx={{
          border: "1px solid #ccc",
          borderRadius: 1,
          padding: "6px 12px",
          margin: "0px !important",
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Image size={16} />
      </IconButton>
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </>
  );
};
