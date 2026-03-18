import { useSocketStore } from "../Chat/Services/SocketsServices";
import toast from "react-hot-toast";
import { QueueWaitModal } from "./assets/queuemodal";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
export const Play = () => {
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
  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-base-300/60 bg-[radial-gradient(circle_at_top,_rgba(121,64,207,0.08),_rgba(43,59,251,0.04),_rgba(15,23,42,0.3))] p-8 sm:p-10">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl"></div>
          <div className="absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-secondary/15 blur-3xl"></div>
          <div className="relative flex flex-col gap-2 text-center">
            <span className="font-lexend text-xs uppercase tracking-[0.35em] text-neutral/60">Play</span>
            <h2 className="font-lexend text-3xl font-bold text-neutral md:text-4xl">Choose Your Match</h2>
            <p className="mx-auto max-w-xl font-poppins text-sm text-neutral/70 md:text-base">Classic is ranked, Custom adds modifiers, and Vs Bot is instant.</p>
          </div>
          <div className="relative mt-8 grid gap-6 md:grid-cols-3">
          <button
            className="group rounded-2xl border border-base-300/60 bg-accent p-6 text-left transition hover:border-primary/50 hover:bg-accent/80 shadow-sm hover:shadow-md"
            onClick={subscribeToGame}
            type="button"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-base-300/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral/70">Ranked</span>
              <span className="font-lexend text-sm font-semibold text-neutral/50">01</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-neutral">
              <span className="text-lg">🏆</span>
              <div className="flex flex-col">
                <h3 className="font-lexend text-xl font-semibold">Classic</h3>
                <p className="text-sm font-poppins text-neutral/70">Pure speed, no modifiers.</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
              Start match
              <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
            </div>
          </button>
          <button
            className="group rounded-2xl border border-base-300/60 bg-accent p-6 text-left transition hover:border-secondary/50 hover:bg-accent/80 shadow-sm hover:shadow-md"
            onClick={subscribeToGameExtra}
            type="button"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-base-300/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral/70">Modifiers</span>
              <span className="font-lexend text-sm font-semibold text-neutral/50">02</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-neutral">
              <span className="text-lg">⚡</span>
              <div className="flex flex-col">
                <h3 className="font-lexend text-xl font-semibold">Custom</h3>
                <p className="text-sm font-poppins text-neutral/70">Extra pressure and pace shifts.</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-secondary">
              Queue up
              <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
            </div>
          </button>
          <button
            className="group rounded-2xl border border-base-300/60 bg-accent p-6 text-left transition hover:border-primary/50 hover:bg-accent/80 shadow-sm hover:shadow-md"
            onClick={launchBotGame}
            type="button"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-base-300/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral/70">Instant</span>
              <span className="font-lexend text-sm font-semibold text-neutral/50">03</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-neutral">
              <span className="text-lg">🤖</span>
              <div className="flex flex-col">
                <h3 className="font-lexend text-xl font-semibold">Vs Bot</h3>
                <p className="text-sm font-poppins text-neutral/70">Warm up or practice.</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
              Play now
              <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
            </div>
          </button>
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
