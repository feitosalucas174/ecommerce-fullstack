import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CarrinhoProvider } from "@/contexts/CarrinhoContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShopFull — E-commerce Full-Stack",
  description: "Projeto de e-commerce completo com Next.js e Django REST Framework",
};

// Script inline que roda antes de qualquer render para evitar flash de tema errado
const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (t === 'dark' || (!t && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Anti-flash: define a classe dark ANTES do primeiro paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <CarrinhoProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    fontSize: "14px",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  },
                }}
              />
            </CarrinhoProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
