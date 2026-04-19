import React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gray-900 hover:bg-gray-800 active:bg-black text-white shadow-sm hover:shadow-md disabled:bg-gray-300",
  secondary:
    "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm disabled:opacity-60",
  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:bg-red-300",
  ghost:
    "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-150 focus:outline-none focus:ring-2
        focus:ring-gray-900/20 focus:ring-offset-2 disabled:cursor-not-allowed
        active:scale-[0.97]
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
