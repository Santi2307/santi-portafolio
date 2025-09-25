import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const LiveIndicator = () => {
  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    // Aquí deberías cambiar la URL por la de tu servidor de WebSockets.
    // Este es solo un ejemplo.
    const socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "live_visitors") {
        setVisitors(data.count);
      }
    };

    // Esto limpia la conexión cuando el componente se desmonta.
    return () => {
      socket.close();
    };
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez.

  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
      className="flex items-center gap-1 text-xs text-green-500 font-mono"
    >
      <span className="relative flex h-2 w-2">
        {/* El círculo que parpadea */}
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        {/* El círculo sólido */}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span>{visitors} Personitas</span>
    </motion.div>
  );
};
