"use client";

import { useState } from "react";

export default function ShareButton({
  title,
  url,
  className,
}: {
  title: string;
  url: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // Ignore user-cancelled share dialogs or clipboard permission errors.
    }
  }

  return (
    <button onClick={onShare} className={className} type="button">
      <span className="material-symbols-outlined text-[16px]">
        {copied ? "done" : "share"}
      </span>
      {copied ? "Kopyalandı" : "Paylaş"}
    </button>
  );
}

