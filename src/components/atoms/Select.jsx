import React from "react";
import { cn } from "@/utils/cn";

const Select = React.forwardRef(({
  className = "",
  label = "",
  error = "",
  required = false,
  options = null,
  placeholder = "",
  children,
  ...props
}, ref) => {
  const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
<select
        ref={ref}
        id={selectId}
        className={cn(
          "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "transition-colors duration-200",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      >
        {options ? (
          <>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option, index) => (
              <option key={`${option.value}-${index}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </>
        ) : (
          children
        )}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;