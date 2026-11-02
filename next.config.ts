import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  async headers() {
    return [
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm", "remark-math"],
    rehypePlugins: [["rehype-katex", { strict: false }]],
  },
});

export default withMDX(nextConfig);
