import React, { useState, useEffect } from "react";
import { X, Info } from "lucide-react";

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetch("/api/announcements/active")
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          const closedId = localStorage.getItem("karga_closed_ann");
          if (closedId !== String(data.id)) {
            setAnnouncement(data);
            setIsVisible(true);
          }
        }
      })
      .catch(e => console.error(e));
  }, []);

  if (!isVisible || !announcement) return null;

  const closeBanner = () => {
    localStorage.setItem("karga_closed_ann", String(announcement.id));
    setIsVisible(false);
  };

  return (
    <div className="bg-amber-100 border-b border-amber-200 text-amber-900 dark:bg-amber-900/30 dark:border-amber-900/50 dark:text-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm font-medium">
          <span className="flex items-center gap-1.5 font-bold">
            <Info size={16} className="text-amber-600 dark:text-amber-400" />
            {announcement.title}:
          </span>
          <span className="opacity-90">{announcement.content}</span>
        </div>
        <button onClick={closeBanner} className="p-1 hover:bg-amber-200/50 dark:hover:bg-amber-800/50 rounded-lg transition-colors flex-shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
