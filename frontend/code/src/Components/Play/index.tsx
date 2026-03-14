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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-3 text-center">
          <span className="font-lexend text-xs uppercase tracking-[0.4em] text-secondary">
            Playbook
          </span>
          <h2 className="font-lexend text-3xl font-extrabold text-neutral md:text-4xl">
            Choose your match
          </h2>
          <p className="mx-auto max-w-xl font-poppins text-sm text-neutral/70 md:text-base">
            Classic is ranked, Custom adds modifiers, and Vs Bot is instant.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
        <button
          className="group relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-[#0f172a] via-[#1f2937] to-[#0f172a] p-6 text-left transition-transform hover:-translate-y-1"
          onClick={subscribeToGame}
          type="button"
        >
          <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/30 blur-2xl"></div>
          <div className="absolute -bottom-16 left-4 h-24 w-24 rounded-full bg-secondary/30 blur-2xl"></div>
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-primary/40 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral/70">
              ranked
            </span>
            <span className="font-lexend text-sm font-semibold text-neutral/60">
              01
            </span>
          </div>
          <h3 className="mt-6 font-lexend text-2xl font-bold text-neutral">
            Classic
          </h3>
          <p className="mt-3 font-poppins text-sm text-neutral/70">
            Precision first. Pure speed, no tricks, full focus.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-secondary">
            Start match
            <span className="transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </div>
        </button>
        <button
          className="group relative overflow-hidden rounded-3xl border border-secondary/40 bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#0b1120] p-6 text-left transition-transform hover:-translate-y-1"
          onClick={subscribeToGameExtra}
          type="button"
        >
          <div className="absolute -left-16 top-8 h-28 w-28 rounded-full bg-secondary/30 blur-2xl"></div>
          <div className="absolute bottom-6 right-6 h-20 w-20 rounded-2xl border border-secondary/30"></div>
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-secondary/40 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral/70">
              modifiers
            </span>
            <span className="font-lexend text-sm font-semibold text-neutral/60">
              02
            </span>
          </div>
          <h3 className="mt-6 font-lexend text-2xl font-bold text-neutral">
            Custom
          </h3>
          <p className="mt-3 font-poppins text-sm text-neutral/70">
            Accelerated rallies, shifting pace, and extra pressure.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-secondary">
            Queue up
            <span className="transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </div>
        </button>
        <button
          className="group relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#1f2937] p-6 text-left transition-transform hover:-translate-y-1"
          onClick={launchBotGame}
          type="button"
        >
          <div className="absolute -right-12 bottom-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl"></div>
          <div className="absolute right-8 top-10 h-10 w-10 rounded-full border border-primary/40"></div>
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-primary/40 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral/70">
              instant
            </span>
            <span className="font-lexend text-sm font-semibold text-neutral/60">
              03
            </span>
          </div>
          <h3 className="mt-6 font-lexend text-2xl font-bold text-neutral">
            Vs Bot
          </h3>
          <p className="mt-3 font-poppins text-sm text-neutral/70">
            Warm up, test patterns, and crush the machine.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-secondary">
            Play now
            <span className="transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
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
