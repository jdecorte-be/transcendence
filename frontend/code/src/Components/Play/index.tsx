import { useSocketStore } from "../Chat/Services/SocketsServices";
import toast from "react-hot-toast";
import { QueueWaitModal } from "./assets/queuemodal";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../../Utils/helpers";
export const Play = () => {
  useDocumentTitle("Play");
  const socketStore = useSocketStore();
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState("");
  const queueModalRef = useRef<HTMLDialogElement>(null);
  const subscribeToGame = async () => {
    try {
      socketStore.socket?.emit("startGame", { gameMode: "cassic" });
      setGameMode("cassic");
      queueModalRef.current?.showModal();
      toast.success(
        "Match making in Progress you can move until find opponent",
        {
          duration: 5000,
        },
      );
    } catch (error) {
      toast.error("can not start game");
    }
  };
  const subscribeToGameExtra = async () => {
    try {
      socketStore.socket?.emit("startGame", { gameMode: "extra" });
      setGameMode("extra");
      queueModalRef.current?.showModal();
      toast.success(
        "Match making in Progress you can move until find opponent",
        {
          duration: 5000,
        },
      );
    } catch (error) {
      toast.error("can not start game");
    }
  };
  const launchBotGame = () => {
    navigate("/Play/Bot");
  };
  const modes = [
    {
      key: "01",
      tag: "Ranked",
      icon: "🏆",
      title: "Classic",
      description: "Pure speed, no modifiers.",
      cta: "Start match",
      accent: "primary" as const,
      onClick: subscribeToGame,
    },
    {
      key: "02",
      tag: "Modifiers",
      icon: "⚡",
      title: "Custom",
      description: "Extra pressure and pace shifts.",
      cta: "Queue up",
      accent: "secondary" as const,
      onClick: subscribeToGameExtra,
    },
    {
      key: "03",
      tag: "Instant",
      icon: "🤖",
      title: "Vs Bot",
      description: "Warm up or practice.",
      cta: "Play now",
      accent: "primary" as const,
      onClick: launchBotGame,
    },
  ];

  const accentClasses = {
    primary: {
      border: "hover:border-primary/50",
      icon: "bg-primary/15 text-primary",
      cta: "text-primary",
      glow: "group-hover:shadow-[0_0_0_1px_rgba(124,92,250,0.25),0_20px_40px_-20px_rgba(124,92,250,0.45)]",
    },
    secondary: {
      border: "hover:border-secondary/60",
      icon: "bg-secondary/20 text-neutral",
      cta: "text-secondary",
      glow: "group-hover:shadow-[0_0_0_1px_rgba(75,75,87,0.4),0_20px_40px_-20px_rgba(75,75,87,0.5)]",
    },
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-base-300/60 bg-[radial-gradient(circle_at_top,_rgba(121,64,207,0.08),_rgba(43,59,251,0.04),_rgba(15,23,42,0.3))] p-8 sm:p-10">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl"></div>
          <div className="absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-secondary/15 blur-3xl"></div>
          <div className="relative flex flex-col gap-2 text-center animate-fade-in-up">
            <span className="font-lexend text-xs uppercase tracking-[0.35em] text-neutral/60">Play</span>
            <h2 className="font-lexend text-3xl font-bold text-neutral md:text-4xl">Choose Your Match</h2>
            <p className="mx-auto max-w-xl font-poppins text-sm text-neutral/70 md:text-base">Classic is ranked, Custom adds modifiers, and Vs Bot is instant.</p>
          </div>
          <div className="relative mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {modes.map((mode, index) => {
              const accent = accentClasses[mode.accent];
              return (
                <button
                  key={mode.key}
                  className={`group animate-fade-in-up rounded-2xl border border-base-300/60 bg-accent p-6 text-left transition duration-300 hover:-translate-y-1 ${accent.border} hover:bg-accent/80 shadow-sm ${accent.glow} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60`}
                  style={{ animationDelay: `${index * 120}ms` }}
                  onClick={mode.onClick}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-base-300/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral/70">{mode.tag}</span>
                    <span className="font-lexend text-sm font-semibold text-neutral/50">{mode.key}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-neutral">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-transform duration-300 group-hover:scale-110 ${accent.icon}`}>
                      {mode.icon}
                    </span>
                    <div className="flex flex-col">
                      <h3 className="font-lexend text-xl font-semibold">{mode.title}</h3>
                      <p className="text-sm font-poppins text-neutral/70">{mode.description}</p>
                    </div>
                  </div>
                  <div className={`mt-5 flex items-center gap-1.5 text-sm font-semibold ${accent.cta}`}>
                    {mode.cta}
                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.167 10h11.666M10.833 5l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <QueueWaitModal
        gameMode={gameMode}
        setGameMode={setGameMode}
        ref={queueModalRef}
      />
    </>
  );
};
