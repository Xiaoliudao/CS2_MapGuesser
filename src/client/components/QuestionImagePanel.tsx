import type { SyntheticEvent } from "react";

export function QuestionImagePanel({
  src,
  alt,
  className = "",
  loading = false,
  showScanline = false,
  onLoad,
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: boolean;
  showScanline?: boolean;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
}) {
  return (
    <div className={`question-image-panel ${className}`.trim()} data-image-fit="contain">
      {loading && <div className="image-skeleton"><span>LOADING INTEL…</span></div>}
      <img
        className="question-image-panel-image"
        src={src}
        alt={alt}
        onLoad={onLoad}
        style={{ opacity: loading ? 0 : 1 }}
      />
      {showScanline && <div className="scanline" />}
    </div>
  );
}
