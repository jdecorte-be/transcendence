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
        <div className="flex flex-col gap-2 text-center">
          <span className="font-lexend text-xs uppercase tracking-[0.35em] text-neutral/60">Play</span>
          <h2 className="font-lexend text-3xl font-bold text-neutral md:text-4xl">Choose Your Match</h2>
          <p className="mx-auto max-w-xl font-poppins text-sm text-neutral/70 md:text-base">Classic is ranked, Custom adds modifiers, and Vs Bot is instant.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <button
            className="group rounded-2xl border border-base-300/60 bg-accent p-6 text-left transition hover:border-primary/50 hover:bg-accent/80"
            onClick={subscribeToGame}
            type="button"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-base-300/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral/70">Ranked</span>
              <span className="font-lexend text-sm font-semibold text-neutral/50">01</span>
            </div>
            <h3 className="mt-5 font-lexend text-2xl font-semibold text-neutral">Classic</h3>
            <p className="mt-2 font-poppins text-sm text-neutral/70">Pure speed, no modifiers.</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
              Start match
              <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
            </div>
          </button>
          <button
            className="group rounded-2xl border border-base-300/60 bg-accent p-6 text-left transition hover:border-secondary/50 hover:bg-accent/80"
            onClick={subscribeToGameExtra}
            type="button"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-base-300/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral/70">Modifiers</span>
              <span className="font-lexend text-sm font-semibold text-neutral/50">02</span>
            </div>
            <h3 className="mt-5 font-lexend text-2xl font-semibold text-neutral">Custom</h3>
            <p className="mt-2 font-poppins text-sm text-neutral/70">Extra pressure and pace shifts.</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-secondary">
              Queue up
              <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
            </div>
          </button>
          <button
            className="group rounded-2xl border border-base-300/60 bg-accent p-6 text-left transition hover:border-primary/50 hover:bg-accent/80"
            onClick={launchBotGame}
            type="button"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-base-300/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral/70">Instant</span>
              <span className="font-lexend text-sm font-semibold text-neutral/50">03</span>
            </div>
            <h3 className="mt-5 font-lexend text-2xl font-semibold text-neutral">Vs Bot</h3>
            <p className="mt-2 font-poppins text-sm text-neutral/70">Warm up or practice.</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
              Play now
              <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
            </div>
          </button>
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
