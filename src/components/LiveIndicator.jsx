import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const LiveIndicator = () => {
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Simulates a real-time connection status
    const interval = setInterval(() => {
      setIsLive(p => !p);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full">
      <motion.div
        className="w-2 h-2 rounded-full bg-green-500"
        initial={{ scale: 0.5 }}
        animate={{ scale: isLive ? 1 : 0.5 }}
        transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
      />
      <span className="text-xs text-green-500 font-medium">Live</span>
    </div>
  );
};
