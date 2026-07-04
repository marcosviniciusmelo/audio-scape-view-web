import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "SoundScape 3D",
  description:
    "An immersive 3D audio visualizer powered by live microphone input, React Three Fiber, and Gemini context generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-white">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
