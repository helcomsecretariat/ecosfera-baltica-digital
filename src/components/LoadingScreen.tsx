import { useTranslation } from "react-i18next";

interface LoadingScreenProps {
  progress: number;
  overlay?: boolean;
}

const LoadingScreen = ({ progress, overlay = false }: LoadingScreenProps) => {
  const { t } = useTranslation();
  const percent = Math.round(progress * 100);

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center bg-cover bg-center p-4 ${
        overlay ? "fixed inset-0 z-50" : ""
      }`}
      style={{ backgroundImage: "url(/ecosfera_baltica/lobby_bg.avif)" }}
    >
      <div className="flex w-full max-w-md flex-col items-center space-y-4 rounded-lg p-6 text-white backdrop-blur-[3px]">
        <span className="text-xl lg:text-2xl">{t("lobby.loading")}</span>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-white/25"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-white transition-[width] duration-200 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-sm tabular-nums lg:text-base">{percent}%</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
