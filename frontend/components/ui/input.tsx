import { InputHTMLAttributes } from "react";

export const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input
      className="border border-gray-300 rounded p-2 w-full"
      {...props}
    />
  );
};
