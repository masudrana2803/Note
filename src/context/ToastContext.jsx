import React, { createContext, useContext, useCallback, useState } from "react";

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container (top-right) */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast px-4 py-2 rounded-md shadow-md text-white max-w-sm w-full ${
              t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : "bg-sky-600"
            }`}
            onClick={() => removeToast(t.id)}
            role="alert"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
