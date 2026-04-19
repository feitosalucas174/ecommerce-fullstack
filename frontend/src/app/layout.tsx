import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CarrinhoProvider } from "@/contexts/CarrinhoContext";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
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
      </body>
    </html>
  );
}
