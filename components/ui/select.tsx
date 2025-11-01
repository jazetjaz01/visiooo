"use client";

import * as React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  children,
  value,
  onValueChange,
  className,
  ...props
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};
