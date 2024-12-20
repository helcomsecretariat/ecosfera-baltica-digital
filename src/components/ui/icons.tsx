import clsx from "clsx";

export const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={clsx("h-6 w-6", className)} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 9h2v6H9V9zM10 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
  </svg>
);
