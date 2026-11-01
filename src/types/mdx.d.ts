declare module "*.mdx" {
  import type { ComponentType } from "react";
  const Content: ComponentType;
  export default Content;
  export const meta: import("@/lib/lesson-meta").LessonMeta;
}
