import { TextareaHTMLAttributes } from "react";

export const Textarea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  return (
    <textarea
      className="border border-gray-300 rounded p-2 w-full"
      {...props}
    />
  );
};
