import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSettings, settingsToCssVars } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: settings.directoryName,
      template: `%s | ${settings.directoryName}`,
    },
    description: settings.tagline,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  let industries: { name: string; slug: string }[] = [];
  try {
    industries = await prisma.industry.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    });
  } catch {
    industries = [];
  }

  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased`} style={settingsToCssVars(settings)}>
        <Header settings={settings} industries={industries} />
        <main>{children}</main>
        <Footer settings={settings} industries={industries} />
      </body>
    </html>
  );
}
