"use client";

import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const setOn = () => setOnline(true);
    const setOff = () => setOnline(false);
    window.addEventListener("online", setOn);
    window.addEventListener("offline", setOff);

    return () => {
      window.removeEventListener("online", setOn);
      window.removeEventListener("offline", setOff);
    };
  }, []);

  if (online) return null;

  return (
    <div className="bg-yellow-400 text-black text-center p-2">
      Offline — your changes are saved locally.
    </div>
  );
}
