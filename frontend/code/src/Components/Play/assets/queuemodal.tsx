import { forwardRef } from "react";
import { useSocketStore } from "../../Chat/Services/SocketsServices";

export const QueueWaitModal = forwardRef<HTMLDialogElement, any>(
  (props, ref) => {
    const socketStore = useSocketStore();
    return (
      <dialog ref={ref} id="queue_modal" className="modal backdrop:bg-[color:var(--black)]/70">
        <div className="modal-box rounded-2xl border border-base-300/60 bg-base-200 text-center">
          <div className="modal-action mt-0 flex flex-col items-center gap-6">
            <span className="relative flex h-14 w-14 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30" />
              <span className="relative inline-flex h-6 w-6 rounded-full bg-primary animate-pulse-glow" />
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-lexend text-lg font-semibold text-neutral">Finding an opponent</span>
              <span className="font-poppins text-sm text-neutral/60">
                Hang tight, you can start moving as soon as a match is found.
              </span>
            </div>
            <form method="dialog" className="w-full">
              <button
                className="w-full rounded-xl border border-base-300/60 bg-accent px-4 py-2.5 font-poppins text-sm font-semibold text-neutral transition hover:border-error/50 hover:text-error"
                onClick={() => {
                  socketStore.socket?.emit("quitQueue", {
                    gameMode: props.gameMode,
                  });
                  props.setGameMode("");
                }}
              >
                Cancel search
              </button>
            </form>
          </div>
        </div>
      </dialog>
    );
  },
);
