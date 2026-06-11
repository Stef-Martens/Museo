"use client";

interface ScanOverlayProps {
  isScanning: boolean;
  statusText?: string;
}

export default function ScanOverlay({
  isScanning,
  statusText,
}: ScanOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-8 scan-frame rounded-2xl">
        {/* Corner brackets */}
        {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map(
          (pos) => (
            <div
              key={pos}
              className={`absolute ${pos} h-6 w-6 border-museo-purple`}
              style={{
                borderTopWidth: pos.includes("top") ? 3 : 0,
                borderBottomWidth: pos.includes("bottom") ? 3 : 0,
                borderLeftWidth: pos.includes("left") ? 3 : 0,
                borderRightWidth: pos.includes("right") ? 3 : 0,
              }}
            />
          )
        )}

        {isScanning && (
          <div className="absolute inset-x-0 top-0 h-1 overflow-hidden">
            <div className="h-full w-full animate-scan bg-gradient-to-r from-transparent via-museo-pink to-transparent opacity-80" />
          </div>
        )}
      </div>

      {isScanning && statusText && (
        <div className="absolute inset-x-0 bottom-24 flex justify-center">
          <div className="animate-pulse-glow rounded-full bg-museo-dark/80 px-6 py-3 backdrop-blur-sm">
            <p className="text-sm font-medium text-museo-gold">{statusText}</p>
          </div>
        </div>
      )}

      {!isScanning && (
        <div className="absolute inset-x-0 top-12 flex justify-center">
          <p className="rounded-full bg-black/40 px-4 py-1.5 text-xs text-white/70 backdrop-blur-sm">
            Point at artwork &amp; tap capture
          </p>
        </div>
      )}
    </div>
  );
}
