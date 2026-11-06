import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { NotFoundScene } from "@/components/home/not-found-scene";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you are looking for does not exist or has moved.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFoundPage() {
  return (
    <section className="relative isolate flex min-h-[78vh] items-center overflow-hidden">
      <NotFoundScene />
      <div className="wrap relative py-20 text-center">
        <p className="eyebrow">Page Not Found</p>
        <h1 className="display-xl mt-6">
          This page hasn&apos;t <span className="font-serif font-normal italic text-accent">assembled.</span>
        </h1>
        <p className="lede mx-auto mt-6 max-w-xl">It may have moved, or the link might be out of date.</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to home</span>
          </Link>
          <Link href="/work" className="btn btn-secondary">
            <span>See the work</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="btn btn-secondary">
            <span>Contact</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
