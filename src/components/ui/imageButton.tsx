import { ReactNode } from "react";

const ImageButton = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => {
  return (
    <button
      onClick={onClick}
      className="shadow-glow w-full rounded-full bg-no-repeat px-4 py-6 text-3xl transition-all hover:scale-105"
      style={{
        backgroundImage: "url(/ecosfera_baltica/lobby_bg.avif",
        backgroundPosition: "25% 50%",
        backgroundSize: "240%",
      }}
    >
      {children}
    </button>
  );
};

export default ImageButton;
