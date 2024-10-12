import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost";
}

export const Button: React.FC<ButtonProps> = ({ variant = "default", children, ...props }) => {
  const className = variant === "ghost" ? "bg-transparent text-gray-700" : "bg-blue-500 text-white";
  return (
    <button className={`px-4 py-2 rounded ${className}`} {...props}>
      {children}
    </button>
  );
};
