import { LabelHTMLAttributes } from "react";

export const Label: React.FC<LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => {
  return (
    <label className="block font-semibold text-gray-600" {...props}>
      {children}
    </label>
  );
};
