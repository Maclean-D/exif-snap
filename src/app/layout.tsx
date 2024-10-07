import "~/styles/globals.css";
import localFont from 'next/font/local';
import { Roboto } from 'next/font/google';
import { type Metadata } from "next";
import { ThemeProvider } from "~/components/theme-provider";

// Load the Caveat font
const caveatFont = localFont({
  src: '../../public/fonts/Caveat-VariableFont_wght.ttf',
  variable: '--font-caveat',
});

// Load Roboto font
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "exif-snap",
  description: "exif-snap description",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${caveatFont.variable} ${roboto.variable}`} suppressHydrationWarning>
      <body className={roboto.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
