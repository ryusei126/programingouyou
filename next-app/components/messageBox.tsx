import React from "react";

// 共通メッセージコンポーネント
// props: type = "error" | "success", message: string
export default function MessageBox({ type, message }: { type: "error" | "success"; message: string }) {
  if (!message) return null;

  const bg = type === "error" ? "bg-red-200" : "bg-green-200";
  const text = type === "error" ? "text-red-800" : "text-green-800";

  return (
    <div className={`p-3 rounded-xl mt-2 ${bg} ${text} font-semibold`}> 
      {message}
    </div>
  );
}

// --- 使用例 -----------------------------
// import MessageBox from "../components/MessageBox";
//
// <MessageBox type="error" message={errorMessage} />
// <MessageBox type="success" message={successMessage} />
