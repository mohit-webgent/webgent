import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-indigo-400">
        <FileQuestion className="h-12 w-12" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">404 Error</span>
        <h2 className="text-3xl font-extrabold text-slate-100">Page Not Found</h2>
        <p className="text-sm text-slate-400">
          The page or resource you are looking for does not exist or has been relocated.
        </p>
      </div>

      <Link href="/">
        <Button variant="primary" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Return to Overview
        </Button>
      </Link>
    </div>
  );
}
