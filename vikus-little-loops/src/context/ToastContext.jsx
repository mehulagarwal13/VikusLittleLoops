import { createContext, useContext, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheckCircle, FiInfo, FiHeart } from "react-icons/fi";

const ToastContext = createContext(null);

let id = 0;
const icons = {
  success: <FiCheckCircle className="text-olive" />,
  info: <FiInfo className="text-blush-500" />,
  wish: <FiHeart className="fill-blush-500 text-blush-500" />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success") => {
    const tid = ++id;
    setToasts((t) => [...t, { id: tid, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== tid)), 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[120] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-blush-200/60 bg-cream/95 px-5 py-3.5 shadow-lift backdrop-blur"
            >
              <span className="text-lg">{icons[t.type] || icons.info}</span>
              <span className="font-serif text-base text-ink">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
