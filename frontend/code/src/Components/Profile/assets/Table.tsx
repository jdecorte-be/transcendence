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
    <div className="w-full h-full overflow-auto">
      <div className="hidden md:flex items-center justify-between px-6 pb-2 text-xs text-neutral/60">
        <span className="w-28">Date</span>
        <span className="flex-1 text-center">Players</span>
        <span className="w-20 text-right">Result</span>
      </div>
      <InfiniteScroll
        hasMore={hasMore}
        loader={
          <div className="flex items-center w-full h-full justify-center">
            <Logo className="sm:w-16 w-16" />
          </div>
        }
        dataLength={history.length}
        next={fetchData}
        className="overflow-auto"
        scrollableTarget="scrollTarget"
        endMessage={
          <span className="flex justify-center items-center p-8 text-neutral font-montserrat">
            No more history
          </span>
        }
      >
        <table className="table w-full ">
          <tbody className="flex flex-col justify-start items-center gap-y-2 md:gap-y-3">
            {!loading &&
              history.map((x: any, index: number) => (
                <tr
                  key={index}
                  className="bg-accent border border-base-300/60 grow-0 rounded-2xl w-11/12 flex justify-between px-3 md:px-6 items-center h-16 md:h-20"
                >
                  <td className="hidden md:w-28 md:flex md:justify-start">
                    <div className="flex justify-start items-center font-poppins text-xs text-neutral/70">
                      {formatTime(x.match.createdAt)}
                    </div>
                  </td>
                  <td className="flex justify-center items-center grow w-auto">
                    <div className="flex justify-center items-center gap-x-3 md:gap-x-6 w-full overflow-hidden">
                      {x?.match?.Player1?.username ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <Link to={`/Profile/${x.match.Player1.id}`}>
                            <img
                              className="rounded-xl h-8 w-8 md:h-10 md:w-10"
                              src={x.match.Player1.avatar.medium}
                              alt="Avatar"
                            />
                          </Link>
                          <span className="text-xs md:text-sm font-poppins font-medium text-neutral truncate max-w-[80px] md:max-w-[120px]">
                            {x.match.Player1.username}
                          </span>
                        </div>
                      ) : (
                        <Loading props={"sm"} />
                      )}

                      <div className="flex flex-row items-center gap-x-1 justify-center w-16 md:w-20 h-6 rounded-full bg-base-100/70 text-neutral font-poppins text-xs">
                        <span className="font-poppins font-medium">
                          {x.match.Player1.score}
                        </span>
                        <span className="font-poppins font-medium">:</span>
                        <span className="font-poppins font-medium">
                          {x.match.Player2.score}
                        </span>
                      </div>

                      {x?.match?.Player2?.id ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <Link to={`/Profile/${x.match.Player2.id}`}>
                            <img
                              className="rounded-xl h-8 w-8 md:h-10 md:w-10"
                              src={x.match.Player2.avatar.medium}
                              alt="Avatar"
                            />
                          </Link>
                          <span className="text-xs md:text-sm font-poppins font-medium text-neutral truncate max-w-[80px] md:max-w-[120px]">
                            {x.match.Player2.username}
                          </span>
                        </div>
                      ) : (
                        <Loading props={"lg"} />
                      )}
                    </div>
                  </td>
                  <td className="flex px-1 grow-0 justify-end items-center gap-x-2 w-20">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                        getResultLabel(x, id) === "Win"
                          ? "text-lime-400 border-lime-400/40"
                          : getResultLabel(x, id) === "Loss"
                            ? "text-red-400 border-red-400/40"
                            : "text-neutral/60 border-base-300/60"
                      }`}
                    >
                      {getResultLabel(x, id)}
                    </span>
                    <div className={`text-xs ${getColor(x.match.Player1, x.match.Player2, id)}`}>
                      {scoreHandler(x, id)}
                    </div>
                  </td>
                </tr>
              ))}
            {loading && <Loading size={"lg"} />}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  ) : (
    <div className="flex items-center justify-center w-full h-full font-montserrat text-neutral">
      <NullPlaceHolder message="No History Available" />
    </div>
  );
};
