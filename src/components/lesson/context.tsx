"use client";

import { createContext, useContext } from "react";

export const LessonContext = createContext<{ lessonId: string }>({ lessonId: "page" });

export function LessonProvider({ lessonId, children }: { lessonId: string; children: React.ReactNode }) {
  return <LessonContext.Provider value={{ lessonId }}>{children}</LessonContext.Provider>;
}

export const useLesson = () => useContext(LessonContext);
