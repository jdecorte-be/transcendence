import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Loading } from "../../Loading/";
import { Logo } from "../../Layout/Assets/Logo";
import InfiniteScroll from "react-infinite-scroll-component";
import { NullPlaceHolder } from "../../Chat/Components/RoomChatHelpers";
import api from "../../../Api/base";
import toast from "react-hot-toast";
import { formatTime } from "../../Chat/Components/tools/utils";
import { useParams } from "react-router-dom";
const getColor = (v1: any, v2: any, id: string) => {
  if (v1.score > v2.score && id === v1.id) return "text-lime-400";
  if (v1.score < v2.score && id === v2.id) return "text-lime-400";
  if (v1.score > v2.score && id !== v1.id) return "text-red-400";
  if (v1.score < v2.score && id !== v2.id) return "text-red-400";
  return "text-gray-400";
};

const scoreHandler = (x: any, id: string) => {
  if (
    x.match.Player1.score > x.match.Player2.score &&
    x.match.Player1.id === id
  ) {
    return " +1 ";
  } else if (
    x.match.Player2.score > x.match.Player1.score &&
    x.match.Player2.id === id
  ) {
    return " +1 ";
  } else if (
    x.match.Player1.score > x.match.Player2.score &&
    x.match.Player1.id !== id
  ) {
    return " -1 ";
  } else if (
    x.match.Player2.score > x.match.Player1.score &&
    x.match.Player2.id !== id
  ) {
    return " -1 ";
  } else {
    return " 0 ";
  }
};

const getResultLabel = (x: any, id: string) => {
  const p1 = x.match.Player1;
  const p2 = x.match.Player2;
  if (p1.score === p2.score) return "Draw";
  const didWin = (p1.id === id && p1.score > p2.score) ||
    (p2.id === id && p2.score > p1.score);
  return didWin ? "Win" : "Loss";
};

export const Table = (props: any) => {
  const [history, setHistory] = useState<any | undefined>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState(true);
  const offset = useRef(0);
  const { id }: any = useParams();
  const skeletonRows = Array.from({ length: 3 }, (_, index) => (
    <div
      key={`skeleton-${index}`}
      className="bg-accent border border-base-300/60 rounded-2xl w-full px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between text-xs text-neutral/60">
        <div className="h-3 w-20 rounded-full bg-base-300/60 animate-pulse" />
        <div className="h-4 w-12 rounded-full bg-base-300/60 animate-pulse" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-base-300/60 animate-pulse" />
          <div className="h-4 w-24 rounded-full bg-base-300/60 animate-pulse" />
        </div>
        <div className="h-7 w-20 rounded-full bg-base-300/60 animate-pulse" />
        <div className="flex items-center gap-2 min-w-0 justify-end">
          <div className="h-10 w-10 rounded-xl bg-base-300/60 animate-pulse" />
          <div className="h-4 w-24 rounded-full bg-base-300/60 animate-pulse" />
        </div>
      </div>
    </div>
  ));
  const fetchData = async () => {
    try {
      const history: any = await api.get(`/game/history/${props.props.props}`, {
        params: { offset: offset.current, limit: 20 },
      });
      offset.current += 20;
      setHistory((prev: any) => [...prev, ...history.data]);
      setLoading(false);
      if (history.data.length < 20) setHasMore(false);
    } catch {
      toast.error("Error on loading match history");
    }
  };

  useEffect(() => {
    offset.current = 0;
    setHistory([]);
    setLoading(true);
    setHasMore(true);
    fetchData();
    // eslint-disable-next-line
  }, [props.props.props]);

  return history.length > 0 || loading === true ? (
    <div className="w-full h-full overflow-auto pb-6">
      <div className="hidden md:flex items-center justify-between px-2 sm:px-4 pb-2 text-xs text-neutral/60">
        <span className="w-32">Date</span>
        <span className="flex-1 text-center">Players</span>
        <span className="w-24 text-right">Result</span>
      </div>
      <InfiniteScroll
        hasMore={hasMore}
        loader={
          <div className="flex items-center w-full h-full justify-center py-6">
            <Logo className="sm:w-16 w-16" />
          </div>
        }
        dataLength={history.length}
        next={fetchData}
        className="overflow-auto pb-4 space-y-3 px-2 sm:px-4"
        scrollableTarget="scrollTarget"
        endMessage={
          <span className="flex justify-center items-center p-6 text-neutral font-montserrat">
            No more history
          </span>
        }
      >
        {!loading &&
          history.map((x: any, index: number) => {
            const result = getResultLabel(x, id);
            const resultClass =
              result === "Win"
                ? "text-lime-400 border-lime-400/40 bg-lime-400/10"
                : result === "Loss"
                  ? "text-red-400 border-red-400/40 bg-red-400/10"
                  : "text-neutral/70 border-base-300/60 bg-base-100/60";
            return (
              <div
                key={index}
                className="bg-accent border border-base-300/60 rounded-2xl w-full px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between text-xs text-neutral/70">
                  <span className="font-poppins">{formatTime(x.match.createdAt)}</span>
                  <div className={`px-3 py-1 rounded-full border text-[11px] font-semibold ${resultClass}`}>
                    {result}
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {x?.match?.Player1?.username ? (
                      <>
                        <Link to={`/Profile/${x.match.Player1.id}`} className="shrink-0">
                          <img
                            className="rounded-xl h-10 w-10 sm:h-11 sm:w-11"
                            src={x.match.Player1.avatar.medium}
                            alt="Avatar"
                          />
                        </Link>
                        <span className="text-sm font-poppins font-medium text-neutral truncate max-w-[110px] sm:max-w-[140px]">
                          {x.match.Player1.username}
                        </span>
                      </>
                    ) : (
                      <Loading props={"sm"} />
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center px-3">
                    <div className="flex flex-row items-center gap-x-2 justify-center px-3 py-1 rounded-full bg-base-100/70 text-neutral font-poppins text-sm font-semibold">
                      <span>{x.match.Player1.score}</span>
                      <span>:</span>
                      <span>{x.match.Player2.score}</span>
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${getColor(x.match.Player1, x.match.Player2, id)}`}>
                      {scoreHandler(x, id)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0 flex-1 justify-end text-right">
                    {x?.match?.Player2?.id ? (
                      <>
                        <span className="text-sm font-poppins font-medium text-neutral truncate max-w-[110px] sm:max-w-[140px]">
                          {x.match.Player2.username}
                        </span>
                        <Link to={`/Profile/${x.match.Player2.id}`} className="shrink-0">
                          <img
                            className="rounded-xl h-10 w-10 sm:h-11 sm:w-11"
                            src={x.match.Player2.avatar.medium}
                            alt="Avatar"
                          />
                        </Link>
                      </>
                    ) : (
                      <Loading props={"lg"} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        {loading && skeletonRows}
      </InfiniteScroll>
    </div>
  ) : (
    <div className="flex items-center justify-center w-full h-full font-montserrat text-neutral">
      <NullPlaceHolder message="No History Available" />
    </div>
  );
};
