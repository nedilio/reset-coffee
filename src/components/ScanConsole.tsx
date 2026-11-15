"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { IconCamera, IconCameraOff, IconScan } from "@tabler/icons-react";
import type QrScanner from "qr-scanner";
import { toast } from "sonner";
import { addCoffeeByToken } from "@/actions/coffees";
import { undoCoffee, undoRedemption } from "@/components/AddCoffeeButton";
import CoffeeSVG from "@/components/Coffee";
import { COFFEES_TO_EXCHANGE } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Same code seen again within this window is ignored: scanner guns sometimes double-read and
// the camera keeps detecting the QR while it is in front of it.
const REPEAT_WINDOW_MS = 5000;

type Scanned = {
  id: string;
  name: string | null;
  coffees: number;
  redeemed: boolean;
};

export default function ScanConsole() {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const lastSeen = useRef<{ token: string; at: number } | null>(null);
  const [value, setValue] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [last, setLast] = useState<Scanned | null>(null);
  const [pending, startTransition] = useTransition();

  const undo = useCallback(async (scanned: Scanned) => {
    if (!(await (scanned.redeemed ? undoRedemption : undoCoffee)(scanned.id))) return;
    // Undoing a redemption puts the card back at 9; undoing a coffee removes one.
    setLast((cur) =>
      cur?.id === scanned.id
        ? {
            ...cur,
            redeemed: false,
            coffees: scanned.redeemed ? COFFEES_TO_EXCHANGE : cur.coffees - 1,
          }
        : cur
    );
  }, []);

  const submit = useCallback((raw: string) => {
    const token = raw.trim().toUpperCase();
    if (!token) return;
    const now = Date.now();
    const repeated =
      lastSeen.current?.token === token && now - lastSeen.current.at < REPEAT_WINDOW_MS;
    lastSeen.current = { token, at: now };
    if (repeated) return;

    startTransition(async () => {
      const result = await addCoffeeByToken(token);
      if ("error" in result) {
        toast.error(result.error);
        setLast(null);
        return;
      }
      const scanned = {
        id: result.id!,
        name: result.name ?? null,
        coffees: result.coffees ?? 0,
        redeemed: result.action === "redeemed",
      };
      setLast(scanned);
      navigator.vibrate?.(scanned.redeemed ? [80, 60, 80] : 80);
      toast.success(
        scanned.redeemed
          ? `Café gratis canjeado a ${scanned.name ?? "el cliente"}`
          : `Café sumado a ${scanned.name ?? "el cliente"}`,
        {
          action: { label: "Deshacer", onClick: () => undo(scanned) },
        }
      );
    });
  }, [undo]);

  // Scanner guns type the code + Enter into whatever has focus, so keep focus on the input.
  useEffect(() => {
    const refocus = () => {
      if (document.visibilityState === "visible") inputRef.current?.focus();
    };
    refocus();
    document.addEventListener("visibilitychange", refocus);
    return () => document.removeEventListener("visibilitychange", refocus);
  }, []);

  useEffect(() => {
    if (!cameraOn || !videoRef.current) return;
    let cancelled = false;
    // Loaded on demand: iOS Safari has no BarcodeDetector, qr-scanner decodes in a worker.
    import("qr-scanner").then(({ default: Scanner }) => {
      if (cancelled || !videoRef.current) return;
      const scanner = new Scanner(videoRef.current, (r) => submit(r.data), {
        preferredCamera: "environment",
        highlightScanRegion: true,
        maxScansPerSecond: 5,
        returnDetailedScanResult: true,
      });
      scannerRef.current = scanner;
      scanner.start().catch(() => {
        toast.error("No se pudo abrir la cámara. Revisa los permisos del navegador.");
        setCameraOn(false);
      });
    });
    return () => {
      cancelled = true;
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, [cameraOn, submit]);

  // Orange = a free coffee is involved: just redeemed, or the card just got full.
  const reward = last && (last.redeemed || last.coffees >= COFFEES_TO_EXCHANGE);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-resetGreen/15 bg-white p-4 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
            setValue("");
          }}
        >
          <label htmlFor="scan-input" className="mb-2 flex items-center gap-2 text-sm font-medium text-resetGreen">
            <IconScan className="size-4" aria-hidden="true" />
            {pending ? "Sumando café…" : "Listo para escanear"}
          </label>
          <input
            id="scan-input"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            // Keep focus for the scanner gun, but don't steal it from the camera button.
            onBlur={() => setTimeout(() => {
              if (!document.activeElement || document.activeElement === document.body) {
                inputRef.current?.focus();
              }
            }, 150)}
            inputMode="none"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="Escanea con la pistola o usa la cámara"
            className="h-12 w-full rounded-[10px] border border-resetGreen/30 px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-resetGreen"
          />
        </form>

        <button
          type="button"
          onClick={() => setCameraOn((on) => !on)}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-resetGreen/30 font-medium text-resetGreen hover:bg-resetGreen/5"
        >
          {cameraOn ? <IconCameraOff className="size-5" /> : <IconCamera className="size-5" />}
          {cameraOn ? "Cerrar cámara" : "Escanear con la cámara"}
        </button>
        {cameraOn && (
          <video ref={videoRef} className="mt-3 aspect-square w-full rounded-lg bg-black object-cover" muted playsInline />
        )}
      </div>

      {last && (
        <div
          className={cn(
            "rounded-xl p-5 text-center text-white shadow-sm",
            reward ? "bg-resetOrange" : "bg-resetGreen"
          )}
          aria-live="polite"
        >
          <p className="text-xs uppercase tracking-wider text-white/70">
            {last.redeemed ? "Café gratis canjeado" : "Café sumado"}
          </p>
          <p className="mt-1 line-clamp-2 text-2xl font-bold leading-tight">{last.name ?? "Cliente"}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <CoffeeSVG className="h-auto w-9 text-white" />
            <span className="text-4xl font-bold">
              {last.coffees}
              <span className="text-xl text-white/70"> / {COFFEES_TO_EXCHANGE}</span>
            </span>
          </div>
          {last.redeemed ? (
            <p className="mt-2 font-semibold">¡Café gratis entregado! La tarjeta vuelve a empezar.</p>
          ) : (
            reward && (
              <p className="mt-2 font-semibold">¡Completó la tarjeta! Su próximo café es gratis.</p>
            )
          )}
        </div>
      )}
    </div>
  );
}
