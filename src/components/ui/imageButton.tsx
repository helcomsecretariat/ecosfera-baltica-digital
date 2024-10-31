import { ReactNode } from "react";

const ImageButton = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-full bg-no-repeat px-2 py-3 text-3xl shadow-glow transition-all hover:scale-105 xl:px-4 xl:py-6"
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
