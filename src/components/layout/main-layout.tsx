import { Header } from "./header";
import { Footer } from "./footer";

export interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">{children}</main>
      <Footer />
    </div>
  );
}
