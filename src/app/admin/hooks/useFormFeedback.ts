"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type FormFeedbackMessage = {
  text: string;
  tone: "success" | "error";
  dismissibleError?: boolean;
};

export function getFeedbackAutoDismissMs(message: FormFeedbackMessage | null): number | null {
  if (!message) {
    return null;
  }

  if (message.tone === "success") {
    return 2500;
  }

  if (message.dismissibleError) {
    return 5000;
  }

  return null;
}

export function useFormFeedback() {
  const [message, setMessage] = useState<FormFeedbackMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const clearMessage = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (mountedRef.current) {
      setMessage(null);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const delay = getFeedbackAutoDismissMs(message);

    if (!delay) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setMessage(null);
      }

      timeoutRef.current = null;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [message]);

  return {
    message,
    setMessage,
    clearMessage,
  };
}
