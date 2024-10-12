import { LabelHTMLAttributes } from "react";

export const Label: React.FC<LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => {
  return (
    <label className="block font-semibold text-gray-700" {...props}>
      {children}
    </label>
  );
};
