import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-[88px] lg:pb-0">
      <Navbar />
      {children}
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
}
