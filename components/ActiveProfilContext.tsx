"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Profile {
  type: "user" | "channel";
  id: string;
  name: string;
  avatar_url: string | null;
  handle?: string;
}

interface ActiveProfileContextValue {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

const ActiveProfileContext = createContext<ActiveProfileContextValue | undefined>(undefined);

export function ActiveProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);

  return (
    <ActiveProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ActiveProfileContext.Provider>
  );
}

export function useActiveProfile() {
  const context = useContext(ActiveProfileContext);
  if (!context) {
    throw new Error("useActiveProfile must be used within ActiveProfileProvider");
  }
  return context;
}
