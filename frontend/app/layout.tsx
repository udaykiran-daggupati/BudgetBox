import "./globals.css";
import OfflineBanner from "../components/OfflineBanner";

export const metadata = {
  title: "BudgetBox",
  description: "Offline-first budgeting app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <OfflineBanner />
        <div className="max-w-2xl mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}
