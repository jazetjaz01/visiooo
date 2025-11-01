"use client";

import * as React from "react";

interface ToastProps {
  title: string;
  description?: string;
}

export function toast({ title, description }: ToastProps) {
  alert(`${title}${description ? " : " + description : ""}`);
}
