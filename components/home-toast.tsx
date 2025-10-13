"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export function HomeToast() {
  useEffect(() => {
    const features = [
      "🤖 AI Project Generator - Auto-create from GitHub",
      "✨ AI Bio Writer - Professional bios in seconds",
      "📝 AI Blog Assistant - Outlines, tags & improvements",
      "💬 AI Developer Chatbot - Ask about any developer",
    ];

    let delay = 2000;
    features.forEach((feature, index) => {
      setTimeout(() => {
        toast(feature, {
          duration: 3500,
          position: "top-center",
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontSize: "15px",
            fontWeight: "500",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(102, 126, 234, 0.4)",
          },
        });
      }, delay + index * 4000);
    });
  }, []);

  return null;
}
