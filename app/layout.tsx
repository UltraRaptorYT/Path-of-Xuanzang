import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "玄奘之路 · Path of Xuanzang",
  description:
    "An interactive journey from Journey to the West to the true story of Master Xuanzang.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hans" className="h-full">
      <body>{children}</body>
    </html>
  );
}
