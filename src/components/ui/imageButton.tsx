import { ReactNode } from "react";

const ImageButton = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-full bg-center px-4 py-6 text-3xl shadow-glow transition-all hover:scale-105"
      style={{ backgroundImage: "url(/ecosfera_baltica/lobby_bg.avif", backgroundPosition: "30% 50%" }}
    >
      {children}
    </button>
  );
};

export default ImageButton;
