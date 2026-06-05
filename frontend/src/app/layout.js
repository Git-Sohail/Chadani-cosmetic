import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { NotificationProvider } from "../context/NotificationContext";
import { ChatProvider } from "../context/ChatContext";
import ErrorBoundary from "../components/ErrorBoundary";
import { ToastProvider } from "../components/Toast";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Chadani Cosmetic | Premium Beauty & Jewelry Store",
  description: "Treat your skin with the best organic treatment, professional makeup, and exquisite traditional bangles.",
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
      className={`${playfair.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-pink-50/10">
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
