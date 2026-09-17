import React from "react";
import { ChatClientView } from "@/features/chat/components/ChatClientView";

export const metadata = {
  title: "Online Chat | MamaBear",
  description: "Ngobrol dengan asisten MamaBear untuk rekomendasi produk ibu hamil dan menyusui.",
};

export default function ChatPage() {
  return <ChatClientView />;
}