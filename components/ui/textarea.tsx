"use client";

import * as React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = (props) => {
  return (
    <textarea
      {...props}
      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className}`}
    />
  );
};
