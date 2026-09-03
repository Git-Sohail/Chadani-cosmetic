import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { NotificationProvider } from "../context/NotificationContext";
import { ChatProvider } from "../context/ChatContext";
import ErrorBoundary from "../components/ErrorBoundary";
import { ToastProvider } from "../components/Toast";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Chadani Cosmetic | Premium Beauty & Cosmetics Boutique",
    template: "%s | Chadani Cosmetic",
  },
  description: "Curated luxury skincare remedies, professional cosmetics, and boutique beauty essentials with reliable flat Rs. 100 delivery across Dharan.",
  openGraph: {
    title: "Chadani Cosmetic | Premium Beauty & Cosmetics Boutique",
    description: "Curated luxury skincare remedies, professional cosmetics, and boutique beauty essentials with reliable flat Rs. 100 delivery across Dharan.",
    url: siteUrl,
    siteName: "Chadani Cosmetic",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: '/Logo.png',
    apple: '/Logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-brand-bg text-brand-text">
        <AuthProvider>
          <ChatProvider>
            <NotificationProvider>
              <CartProvider>
                <WishlistProvider>
                  <ToastProvider>
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </ToastProvider>
                </WishlistProvider>
              </CartProvider>
            </NotificationProvider>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
