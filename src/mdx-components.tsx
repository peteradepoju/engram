import type { MDXComponents } from "mdx/types";
import { Step, Key, Callout, Bridge, Figure, Colab, Reading, WatchList } from "@/components/lesson/blocks";
import { PyCell } from "@/components/lesson/pycell";
import { Quiz } from "@/components/lesson/quiz";
import { Derivation, Prove } from "@/components/lesson/derivation";
import { Video } from "@/components/lesson/video";
import { Flashcards } from "@/components/lesson/flashcards";
import { Predict } from "@/components/lesson/predict";
import { JournalPrompt } from "@/components/lesson/journal";
import * as Figures from "@/components/figures";

const components: MDXComponents = {
  Step, Key, Callout, Bridge, Figure, Colab, Reading, WatchList,
  PyCell, Quiz, Derivation, Prove, Video, Flashcards, Predict, JournalPrompt,
  ...Figures,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
