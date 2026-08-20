import { Chart } from "./assets/Chart";
import { Table } from "./assets/Table";

const HISTORY_SCROLL_ID = "profile-history-scroll";

export const History = (props: any) => {
  return (
    <div className="flex flex-col rounded-2xl justify-start items-start mt-6 w-full bg-base-200 border border-base-300/60 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center w-full px-4 pt-4 sm:px-10 sm:pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-x-3">
          <Chart />
          <div className="flex flex-col">
            <span className="font-montserrat text-base text-neutral">Match History</span>
            <span className="text-xs text-neutral/60">Recent results and scores</span>
          </div>
        </div>
        <div className="hidden sm:flex text-xs text-neutral/60">Updated live</div>
      </div>
      <div
        id={HISTORY_SCROLL_ID}
        className="w-full min-h-[360px] h-[50vh] sm:h-[55vh] lg:h-[60vh] overflow-y-auto"
      >
        <Table props={props} scrollableTarget={HISTORY_SCROLL_ID} />
      </div>
    </div>
  );
};
