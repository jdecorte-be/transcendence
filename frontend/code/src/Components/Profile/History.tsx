import { Chart } from "./assets/Chart";
import { Table } from "./assets/Table";
export const History = (props: any) => {
  return (
    <div className="flex flex-col rounded-2xl justify-start items-start mt-6 sm:h-full h-full w-full bg-base-200 border border-base-300/60 shadow-sm">
      <div className="flex justify-between items-center w-full px-4 pt-4 sm:px-10 sm:pt-8 pb-4">
        <div className="flex items-center gap-x-3">
          <Chart />
          <div className="flex flex-col">
            <span className="font-montserrat text-base text-neutral">Match History</span>
            <span className="text-xs text-neutral/60">Recent results and scores</span>
          </div>
        </div>
        <div className="hidden sm:flex text-xs text-neutral/60">Updated live</div>
      </div>
      <Table props={props} />
    </div>
  );
};
