import { useState, useEffect, useCallback, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { Chart } from "./assets/Chart";
import { Trophy } from "./assets/Trophy";
import { Daimond } from "./assets/Daimond";
import { Logo } from "../Layout/Assets/Logo";

import { NullPlaceHolder } from "../Chat/Components/RoomChatHelpers";

import api from "../../Api/base";

const CLOUDINARY_BASE_URL =
  "https://res.cloudinary.com/ds2oaoirs/image/upload";

const buildAvatarUrl = (avatar?: string | null, size = 72) => {
  if (!avatar) return "";
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }
  return `${CLOUDINARY_BASE_URL}/c_thumb,h_${size},w_${size}/${avatar}`;
};

export const LeaderBoard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const page = useRef(0);
  const hasMoreItems = useRef(true);
  const [fetching, setFetching] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(
    "/leaderboard?offset=0&limit=20",
  );

  const fetchItems = useCallback(async () => {
    if (!nextPageUrl) return;
    if (fetching) return;

    setFetching(true);

    try {
      const newdata = await api.get(nextPageUrl);
      // End of pagination
      if (!newdata.data || newdata.data.length < 20) {
        newdata.data && setUsers((prev) => [...prev, ...newdata.data]);
        setNextPageUrl(null);
        // Update hasMoreItems state
        hasMoreItems.current = false;
        return;
      }
      // Prepare next page
      setUsers((prev) => [...prev, ...newdata.data]);
      setNextPageUrl(`/leaderboard?offset=${page.current + 20}&limit=20`);
      page.current += 20;
      // Update hasMoreItems state
      hasMoreItems.current = true;
    } catch (e) {
      toast.error("Can't get leaderboard");
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [fetching, nextPageUrl]);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, []);

  const podium = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="flex flex-col rounded-2xl justify-start items-start mt-6 sm:h-full h-full w-full bg-base-200 border border-base-300/60 shadow-sm">
      <div className="flex justify-between items-center w-full p-4 pb-0 md:p-8 md:pb-0">
        <div className="flex justify-start items-center gap-x-3">
          <Chart />
          <div className="flex flex-col">
            <span className="font-montserrat text-base sm:text-lg text-neutral">Leaderboard</span>
            <span className="text-xs text-neutral/60">Top ranked players</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral/60">
          <Trophy className="w-4 h-4" />
          Updated live
        </div>
      </div>

      {users.length > 0 || loading ? (
        <div className="w-full h-full p-4 md:p-8">
          <InfiniteScroll
            dataLength={users.length}
            next={fetchItems}
            loader={
              <div className="flex items-center justify-center w-full ">
                <Logo className="sm:w-12 w-12" />
              </div>
            }
            endMessage={
              <div className="p-4 flex justify-center items-center font-montserrat text-neutral">
                No more results!
              </div>
            }
            hasMore={hasMoreItems.current}
            scrollableTarget="scrollTarget"
            style={{ overflow: "auto", height: "100%" }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                {(loading ? Array.from({ length: 3 }) : podium).map(
                  (x: any, index: number) => (
                    <div
                      key={index}
                      className={`flex flex-col justify-between rounded-2xl border border-base-300/60 bg-accent/60 p-4 min-h-[140px] ${
                        index === 0 ? "shadow-md" : "shadow-sm"
                      }`}
                    >
                      {loading ? (
                        <div className="flex flex-col gap-3 animate-pulse">
                          <div className="h-4 w-20 rounded bg-base-300/70" />
                          <div className="h-10 w-10 rounded-full bg-base-300/70" />
                          <div className="h-4 w-32 rounded bg-base-300/70" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-xs text-neutral/60">
                            <span className="uppercase tracking-wide">#{index + 1}</span>
                            <Trophy className="w-4 h-4" />
                          </div>
                          <Link to={`/Profile/${x.userId}`}>
                            <div className="flex items-center gap-3 mt-3">
                              <img
                                className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
                                src={buildAvatarUrl(x?.avatar, 72)}
                                alt={x?.Username}
                              />
                              <div className="flex flex-col">
                                <span className="font-montserrat text-neutral font-semibold truncate max-w-[140px]">
                                  {x?.Username}
                                </span>
                                <span className="text-xs text-neutral/60">Wins</span>
                              </div>
                            </div>
                          </Link>
                          <div className="flex items-center gap-2 mt-4 text-neutral">
                            <Daimond className="w-4 h-4" />
                            <span className="font-montserrat font-semibold">
                              {x?.wins}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ),
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-neutral/60 px-2">
                  <span>Rank</span>
                  <span className="flex-1 ml-8">Player</span>
                  <span>Score</span>
                </div>
                {!loading &&
                  rest.map((x: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-accent rounded-xl px-4 py-3 border border-base-300/40"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-base-100/60 text-sm text-neutral">
                        {index + 4}
                      </div>
                      <Link to={`/Profile/${x.userId}`} className="flex-1">
                        <div className="flex items-center gap-3">
                          <img
                            className="w-9 h-9 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
                            src={buildAvatarUrl(x?.avatar, 72)}
                            alt={x?.Username}
                          />
                          <span className="font-montserrat text-neutral font-semibold truncate">
                            {x?.Username}
                          </span>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 text-neutral">
                        <Daimond className="w-4 h-4" />
                        <span className="font-montserrat font-semibold">
                          {x?.wins}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </InfiniteScroll>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <NullPlaceHolder message="No leaderboard available" />
        </div>
      )}
    </div>
  );
};
