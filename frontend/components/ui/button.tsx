import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "cancel";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  className,
  children,
  ...props
}) => {
  const variantClass =
    variant === "ghost"
      ? "bg-transparent text-gray-700"
      : variant === "cancel"
        ? "bg-gray-300 text-black"
        : "bg-blue-500 text-white";
  return (
    <button
      className={`px-4 py-2 rounded ${className} ${variantClass}`}
      {...props}
    >
      {children}
    </button>
  );
};
