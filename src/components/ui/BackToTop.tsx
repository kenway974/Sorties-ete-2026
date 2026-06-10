"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface BackToTopProps {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export default function BackToTop({ scrollContainerRef }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollContainerRef?.current ?? window;
    const onScroll = () => {
      const scrollY = scrollContainerRef?.current
        ? scrollContainerRef.current.scrollTop
        : window.scrollY;
      setVisible(scrollY > 320);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollContainerRef]);

  const scrollToTop = () => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Retour en haut"
      className="fixed bottom-20 right-4 md:bottom-6 z-30 w-10 h-10 rounded-full bg-brand-navy dark:bg-brand-gold shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform animate-fade-in"
    >
      <ArrowUp className="w-5 h-5 text-white dark:text-brand-navy" />
    </button>
  );
}
