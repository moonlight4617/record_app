import { TextareaHTMLAttributes } from "react";

export const Textarea: React.FC<
  TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ className, ...props }) => {
  const defaultClasses = "border border-gray-300 rounded p-2 w-full";
  const combinedClasses = className
    ? `${defaultClasses} ${className}`
    : defaultClasses;

  return <textarea className={combinedClasses} {...props} />;
};
