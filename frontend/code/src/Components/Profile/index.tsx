import { Pong } from "./assets/Pong";

import { History } from "./History";
import Hero from "./assets/Hero.gif";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Load } from "../Loading/";
import Newbie from "../Badges/Newbie.svg";
import Master from "../Badges/Master.svg";
import Ultimate from "../Badges/Ultimate.svg";
import { useUserStore } from "../../Stores/stores";
import {
  VscChromeClose,
  VscAdd,
  VscCheck,
  VscComment,
  VscEdit,
} from "react-icons/vsc";
import api from "../../Api/base";
import toast from "react-hot-toast";
import { createNewRoomCall } from "../Chat/Services/ChatServices";
import { useSocketStore } from "../Chat/Services/SocketsServices";
import {
  ChatType,
  useChatStore,
} from "../Chat/Controllers/RoomChatControllers";
import { More } from "../Chat/Components/tools/Assets";
import { useModalStore } from "../Chat/Controllers/LayoutControllers";

import { blockUserCall } from "../Chat/Services/FriendsServices";
import { AxiosError } from "axios";
import { InvitationWaiting } from "../Layout/Assets/Invitationacceptance";
import { classNames } from "../../Utils/helpers";
type FRIENDSHIP = "none" | "friend" | "sent" | "recive" | "blocked" | undefined;

const getAchievementLabel = (value?: number | null) => {
  if (value === null || value === undefined) return "Unranked";
  if (value >= 2) return "Ultimate";
  if (value >= 1) return "Master";
  return "Newbie";
};

export const Profile = () => {
  const user = useUserStore();
  const params = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<FRIENDSHIP>(undefined);
  const [disabled, setDisabled] = useState("");
  const [profile, setProfile] = useState<null | any>(undefined);
  const [avatarSrc, setAvatarSrc] = useState<string>("");
  const ChatState = useChatStore();
  const LayoutState = useModalStore();
  const socketStore = useSocketStore();
  const [onlineStatus, setOnlineStatus] = useState<string>("offline");
  const isSelf = params.id === "me" || params.id === user.id;
  const isLoadingProfile = !profile;

  const inviteWaitingModalRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`profile/${params.id}`);
        setProfile(res.data);
        res.data.friendship.length === 0 && setStatus("none");
        res.data.friendship.length > 0 &&
          res.data.friendship[0].accepted &&
          setStatus("friend");
        res.data.friendship.length > 0 &&
          !res.data.friendship[0].accepted &&
          res.data.friendship[0].fromId === user.id &&
          setStatus("sent");
        res.data.friendship.length > 0 &&
          !res.data.friendship[0].accepted &&
          res.data.friendship[0].fromId !== user.id &&
          setStatus("recive");
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error?.response?.status !== 401) {
            toast.error("The user does not exist or has blocked you");
            navigate("/home", { replace: true });
          }
        }
      }
    };
    if (params.id !== user.id || params.id !== "me") fetchUser();
    else setProfile(user);

    // eslint-disable-next-line
  }, [params, user]);

  useEffect(() => {
    if (!profile) return;
    if (profile?.picture?.large) {
      setAvatarSrc(profile.picture.large);
      return;
    }
    const first = profile?.name?.first ?? "Player";
    const last = profile?.name?.last ?? "";
    const fallbackName = encodeURIComponent(`${first} ${last}`.trim());
    setAvatarSrc(
      `https://ui-avatars.com/api/?name=${fallbackName}&background=7940CF&color=fff`,
    );
  }, [profile]);

  useEffect(() => {
    if (params.id === "me" || params.id === user.id) {
      return;
    }
    socketStore?.socket?.emit(
      "status",
      { userId: params.id },
      (data: { status: string; inGame: boolean }) => {
        if (data.status === "online" && !data.inGame) {
          setOnlineStatus("online");
        } else if (data.status === "online" && data.inGame) {
          setOnlineStatus("inGame");
        } else {
          setOnlineStatus("offline");
        }
      },
    );
  }, [params.id, socketStore?.socket, user.id]);

  const sendRequest = async () => {
    setDisabled("btn-disabled");
    const fetchFunc = async () => {
      await api.post("friends/add", { friendId: profile.id });
      setStatus("sent");
      setDisabled("");
    };
    toast.promise(fetchFunc(), {
      loading: `Sending friend request`,
      success: `request sent to ${profile.name.first}`,
      error: "could not send friend request",
    });
  };
  const cancelRequest = async () => {
    setDisabled("btn-disabled");
    const fetchFunc = async () => {
      await api.post("friends/unfriend", { friendId: profile.id });
      setStatus("none");
      setDisabled("");
    };
    toast.promise(fetchFunc(), {
      loading: `Cancling friend request`,
      success: `cancel ${profile.name.first} friend request`,
      error: "could not cancel friend request",
    });
  };
  const acceptRequest = async () => {
    setDisabled("btn-disabled");
    const fetchFunc = async () => {
      await api.post("/friends/accept", { friendId: profile.id });
      setStatus("friend");
      setDisabled("");
    };
    toast.promise(fetchFunc(), {
      loading: `Accepting friend request`,
      success: `${profile.name.first} friend request accepted`,
      error: "could not accept friend request",
    });
  };
  const rejectRequest = async () => {
    setDisabled("btn-disabled");
    const fetchFunc = async () => {
      await api.post("/friends/reject", { friendId: profile.id });
      setStatus("none");
      setDisabled("");
    };
    toast.promise(fetchFunc(), {
      loading: `rejecting friend request`,
      success: `${profile.name.first} friend request rejected`,
      error: "could not reject friend request",
    });
  };

  return (
    <>
      <div className=" flex flex-col items-center h-full bg-accent">
        <div className="relative pt-12 h-auto max-h-[30vh] min-h-[16vh] md:min-h-[28vh] xl:min-h-[33vh] w-[85vw]">
          <div className="relative h-full w-full md:px-32 bg-[#2b3bfb] rounded-t-3xl">
            <img
              className="flex-1  w-full h-auto object-scale-down md:object-top object-bottom"
              src={Hero}
              alt="bg hero"
            ></img>
            <div className=" absolute  bg-black top-0 left-0  object-scale-down object-top  opacity-40 h-full w-full rounded-t-3xl  z-10"></div>
            <Pong />
          </div>


          <div className="avatar absolute z-40 -bottom-6 sm:-bottom-8 md:-bottom-10 left-6 sm:left-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full ring ring-neutral flex justify-center items-center ring-offset-base-100 ring-offset-1">
              {isLoadingProfile ? (
                <div className="w-full h-full rounded-full bg-base-300/70 animate-pulse" />
              ) : avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="profile avatar"
                  onError={() => {
                    const first = profile?.name?.first ?? "Player";
                    const last = profile?.name?.last ?? "";
                    const fallbackName = encodeURIComponent(
                      `${first} ${last}`.trim(),
                    );
                    setAvatarSrc(
                      `https://ui-avatars.com/api/?name=${fallbackName}&background=7940CF&color=fff`,
                    );
                  }}
                />
              ) : (
                <div className=" top-14">
                  <Load />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-4 sm:gap-6 px-4 sm:px-8 pl-24 sm:pl-28 lg:pl-8 text-neutral font-montserrat bg-base-200 justify-between items-start min-h-[25%] rounded-b-3xl w-full max-w-[1100px] pt-12 pb-6 mx-auto">
          <div className="flex flex-col gap-4">
            {isLoadingProfile ? (
              <div className="flex flex-col gap-3">
                <div className="h-5 w-32 rounded-full bg-base-300/70 animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-7 w-20 rounded-full bg-base-300/70 animate-pulse" />
                  <div className="h-7 w-20 rounded-full bg-base-300/70 animate-pulse" />
                  <div className="h-7 w-24 rounded-full bg-base-300/70 animate-pulse" />
                </div>
                <div className="h-20 w-full max-w-2xl rounded-2xl bg-base-300/70 animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-lg sm:text-xl font-poppins font-bold">
                    {profile?.name?.first} {profile.name.last}
                  </div>
                  {params.id !== "me" &&
                    params.id !== user.id &&
                    status === "friend" && (
                      <span
                        className={classNames(
                          "px-2 py-1 font-light text-xs border rounded-full",
                          onlineStatus === "online"
                            ? "text-green-500 border-green-500"
                            : onlineStatus === "inGame"
                              ? "text-yellow-500 border-yellow-500"
                              : "text-red-500 border-red-500",
                        )}
                      >
                        {onlineStatus}
                      </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral/70">
                  <span className="px-2 py-1 rounded-full border border-base-300/60 bg-base-100/60">
                    @{profile?.username ?? "unknown"}
                  </span>
                  <span className="px-2 py-1 rounded-full border border-base-300/60 bg-base-100/60">
                    {isSelf
                      ? "You"
                      : onlineStatus === "inGame"
                        ? "In game"
                        : onlineStatus}
                  </span>
                  <span className="px-2 py-1 rounded-full border border-base-300/60 bg-base-100/60">
                    {getAchievementLabel(profile?.achievement)} tier
                  </span>
                </div>

                <div className="rounded-2xl border border-base-300/50 bg-accent/70 p-4 text-sm text-neutral/90 max-w-2xl">
                  {profile?.bio?.trim()
                    ? profile.bio
                    : "No bio yet. Add one from settings."}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {isLoadingProfile && (
                <div className="flex flex-col gap-3">
                  <div className="h-10 w-full rounded-xl bg-base-300/70 animate-pulse" />
                  <div className="h-10 w-full rounded-xl bg-base-300/70 animate-pulse" />
                </div>
              )}
              {params.id !== "me" &&
                params.id !== user.id &&
                status === "none" && (
                  <div className="flex items-center gap-3">
                    <button
                      className={`btn flex-1 btn-primary text-neutral ${disabled}`}
                      onClick={sendRequest}
                    >
                      <VscAdd />
                      Send request
                    </button>
                    <div className="dropdown">
                      <label tabIndex={0} className="">
                        <summary className="list-none p-3 cursor-pointer ">
                          <img src={More} alt="More" />
                        </summary>
                      </label>
                      <ul
                        tabIndex={0}
                        className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52 absolute"
                      >
                        <span className="hover:bg-[#7940CF] hover:rounded">
                          <li
                            onClick={() => {
                              ChatState.setIsLoading(true);
                              blockUserCall(profile.id).then((res) => {
                                ChatState.setIsLoading(false);
                                if (
                                  res?.status === 200 ||
                                  res?.status === 201
                                ) {
                                  toast.success("User Blocked");
                                  navigate("/chat", { replace: true });
                                } else {
                                  toast.error("Could Not Block User");
                                }
                              });
                            }}
                          >
                            <div>Block</div>
                          </li>
                        </span>
                      </ul>
                    </div>
                  </div>
                )}
              {params.id !== "me" &&
                params.id !== user.id &&
                status === "sent" && (
                  <div className=" flex items-center gap-3">
                    <button
                      className={`btn flex-1 btn-primary text-neutral ${disabled}`}
                      onClick={cancelRequest}
                    >
                      <VscChromeClose />
                      Cancel request
                    </button>
                  </div>
                )}
              {params.id !== "me" &&
                params.id !== user.id &&
                status === "recive" && (
                  <div className=" flex items-center gap-3">
                    <button
                      className={`btn flex-1 btn-primary text-neutral ${disabled}`}
                      onClick={acceptRequest}
                    >
                      <VscCheck />
                      <p>Accept</p>
                    </button>
                    <button
                      className={`btn flex-1 btn-primary text-neutral ${disabled}`}
                      onClick={rejectRequest}
                    >
                      <VscChromeClose />
                      <p>Reject</p>
                    </button>
                  </div>
                )}
              {params.id !== "me" &&
                params.id !== user.id &&
                status === "friend" && (
                  <div className=" flex flex-col gap-3">
                    <button
                      className={`btn btn-primary text-neutral ${disabled}`}
                      onClick={async () => {
                        ChatState.setIsLoading(true);
                        await createNewRoomCall(
                          "",
                          "dm",
                          undefined,
                          params.id,
                        ).then((res) => {
                          ChatState.setIsLoading(false);
                          if (res?.status === 200 || res?.status === 201) {
                            ChatState.changeChatType(ChatType.Chat);
                            ChatState.selectNewChatID(res?.data?.id);
                            ChatState.setCurrentDmUser({
                              secondUserId: profile.id,
                              id: profile.id,
                              name: `${profile.name.first} `,
                              avatar: profile?.picture,
                              bio: profile?.bio,
                            });
                            navigate(`/Dm/${res?.data.id}`);
                          } else {
                            toast.error(
                              "You Can't Send Message To this User For Now, try Again later",
                            );
                          }
                        });
                      }}
                    >
                      <VscComment />
                      Message
                    </button>
                    <div className="dropdown">
                      <label tabIndex={0} className="">
                        <summary className="list-none p-3 cursor-pointer ">
                          <img src={More} alt="More" />
                        </summary>
                      </label>
                      <ul
                        tabIndex={0}
                        className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52 absolute"
                      >
                        <li
                          className="hover:bg-[#7940CF] hover:rounded"
                          onClick={() => {
                            socketStore?.socket?.emit(
                              "inviteToGame",
                              {
                                inviterId: user.id,
                                opponentId: profile.id,
                                gameMode: "cassic",
                              },
                              (data: {
                                error: string | null;
                                gameId: string;
                              }) => {
                                if (data.error) {
                                  toast.error(data.error);
                                  return;
                                }
                                user.setGameWaitingId(data.gameId);
                                inviteWaitingModalRef.current?.showModal();
                              },
                            );
                          }}
                        >
                          <span>Invite to a classic game</span>
                        </li>
                        <li
                          className="hover:bg-[#7940CF] hover:rounded"
                          onClick={() => {
                            socketStore?.socket?.emit(
                              "inviteToGame",
                              {
                                inviterId: user.id,
                                opponentId: profile.id,
                                gameMode: "extra",
                              },
                              (data: {
                                error: string | null;
                                gameId: string;
                              }) => {
                                if (data.error) {
                                  toast.error(data.error);
                                  return;
                                }
                                user.setGameWaitingId(data.gameId);
                                inviteWaitingModalRef.current?.showModal();
                              },
                            );
                          }}
                        >
                          <span>Invite to a custom game</span>
                        </li>
                        <span className="hover:bg-[#7940CF] hover:rounded">
                          <li
                            onClick={async () => {
                              ChatState.setIsLoading(true);
                              await blockUserCall(profile.id).then((res) => {
                                ChatState.setIsLoading(false);
                                if (
                                  res?.status === 200 ||
                                  res?.status === 201
                                ) {
                                  toast.success("User Blocked");
                                  navigate("/chat", { replace: true });
                                } else {
                                  toast.error("Could Not Block User");
                                }
                              });
                            }}
                          >
                            <div>Block</div>
                          </li>
                        </span>
                        <span className="hover:bg-[#7940CF] hover:rounded">
                          <li
                            onClick={() => {
                              cancelRequest();
                            }}
                          >
                            <div>Unfriend</div>
                          </li>
                        </span>
                      </ul>
                    </div>
                  </div>
                )}
              {isSelf && (
                <div className=" flex items-center gap-3">
                  <Link to={"/Settings"} className="flex-1">
                    <button
                      className={`btn btn-primary text-neutral ${disabled} flex-row flex-nowrap whitespace-nowrap w-full`}
                    >
                      <VscEdit />
                      Edit Profile
                    </button>
                  </Link>
                  <div className="dropdown">
                    <label tabIndex={0} className="">
                      <summary className="list-none p-3 cursor-pointer ">
                        <img src={More} alt="More" />
                      </summary>
                    </label>
                    <ul
                      tabIndex={0}
                      className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52 absolute bottom-16"
                    >
                      <li
                        onClick={() =>
                          LayoutState.setShowFriendsListModal(true)
                        }
                      >
                        <span className="hover:bg-[#7940CF]">
                          <a href="#friends-list-modal" className="pr-2">
                            <div>See Friends List</div>
                          </a>
                        </span>
                      </li>
                      <li
                        onClick={() =>
                          LayoutState.setShowBlockedListModal(true)
                        }
                      >
                        <span className="hover:bg-[#7940CF]">
                          <a href="#blocked-users-modal" className="pr-2">
                            <div>See Blocked List</div>
                          </a>
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 bg-accent/70 border border-base-300/50 rounded-2xl p-3 justify-center">
              {isLoadingProfile ? (
                <>
                  <div className="h-16 w-16 rounded-xl bg-base-300/70 animate-pulse" />
                  <div className="h-16 w-16 rounded-xl bg-base-300/70 animate-pulse" />
                  <div className="h-16 w-16 rounded-xl bg-base-300/70 animate-pulse" />
                </>
              ) : (
                <>
                  <img
                    className={`h-16 sm:h-20 ${
                      profile?.achievement !== null && profile?.achievement >= 0
                        ? ""
                        : "opacity-30"
                    }`}
                    src={Newbie}
                    alt="newbie badge"
                  />
                  <img
                    className={`h-16 sm:h-20 ${
                      profile?.achievement !== null && profile?.achievement >= 1
                        ? ""
                        : "opacity-30"
                    }`}
                    src={Master}
                    alt="Master badge"
                  />
                  <img
                    className={`h-16 sm:h-20 ${
                      profile?.achievement !== null && profile?.achievement >= 2
                        ? ""
                        : "opacity-30"
                    }`}
                    src={Ultimate}
                    alt="Ultimate badge"
                  />
                </>
              )}
            </div>
          </div>
        </div>
        <div className="relative flex w-full max-w-[1100px] justify-center h-auto overflow-hidden px-4 sm:px-0">
          <History props={params.id} />
        </div>
      </div>
      <InvitationWaiting
        ref={inviteWaitingModalRef}
        oppenent={profile}
        user={user}
      />
    </>
  );
};
