import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, Inter, Roboto } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const robotoHeading = Roboto({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const bodyFont = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Image Processor — AI-Powered Image Metadata",
  description: "Generate SEO-optimized filenames, alt text, and metadata for your images using Claude vision AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, robotoHeading.variable)} suppressHydrationWarning>
      <body className={`${displayFont.variable} ${bodyFont.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ClerkProvider>
            <header className="fixed top-0 right-0 z-[100] flex items-center gap-3 p-4">
              <ThemeToggle />
              <Show when="signed-out">
                <SignInButton>
                  <Button variant="outline" className="rounded-full">
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button className="rounded-full">
                    Sign up
                  </Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </header>
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
