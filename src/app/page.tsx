import Link from "next/link";
import CameraView from "@/components/CameraView";

export default function ScanPage() {
  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-museo-purple via-museo-pink to-museo-gold bg-clip-text text-transparent">
              Museo
            </span>
          </h1>
          <p className="text-xs text-white/40">Scan · Collect · Level Up</p>
        </div>
        <Link
          href="/demo"
          className="rounded-full bg-museo-purple/20 px-3 py-1 text-xs font-bold text-museo-purple"
        >
          Demo
        </Link>
      </header>
      <div className="flex-1 overflow-hidden rounded-t-3xl">
        <CameraView />
      </div>
    </div>
  );
}
