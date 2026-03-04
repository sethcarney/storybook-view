import React from "react";

interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  className?: string;
  variant?: "default" | "outlined" | "elevated";
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  showFooter = true,
  footerContent,
  className = "",
  variant = "default"
}) => {
  const baseClasses = "rounded-lg overflow-hidden";

  const variantClasses = {
    default: "bg-white border border-gray-200",
    outlined: "bg-white border-2 border-gray-300",
    elevated: "bg-white shadow-lg border border-gray-100"
  };

  const classes =
    `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <div className={classes}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 text-sm mb-4">{description}</p>
        )}
        {children}
      </div>

      {showFooter && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          {footerContent || (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Card footer</span>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Action
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
