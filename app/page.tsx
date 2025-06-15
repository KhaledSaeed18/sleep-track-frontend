"use client";

import { useState } from "react";

export default function Home() {
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  return (

    <div className="h-screen flex flex-col space-y-2 items-center justify-center">
      <h1>
        Next.js app with daisyUI
      </h1>
      <button className="btn btn-primary" onClick={showToast}>
        Test
      </button>
      <div className={`toast toast-bottom toast-right ${toastVisible ? "visible" : "invisible"}`}>
        <div className="alert alert-info">
          <span>daisyUI retro theme</span>
        </div>
      </div>

    </div>
  );
}
