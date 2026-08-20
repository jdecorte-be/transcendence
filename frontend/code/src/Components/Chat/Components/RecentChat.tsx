import { useEffect, useState } from "react";
import { ChatType, useChatStore } from "../Controllers/RoomChatControllers";
import { ChatPaceHolderProps } from "./Conversation";
import {
  ChatIcon,
  DmRoom,
  Explore,
  GroupChat,
  NullUser,
  RoomMember,
  RoomsIcon,
  check,
} from "./tools/Assets";

import { NullPlaceHolder } from "./RoomChatHelpers";
import { useModalStore } from "../Controllers/LayoutControllers";
import {
  createNewRoomCall,
  fetchDmsCall,
  getFriendsCall,
} from "../Services/ChatServices";
import { formatTime } from "./tools/utils";
import { useSocketStore } from "../Services/SocketsServices";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import { Spinner, Skeleton, Dots, Img } from "../../Loading";

export const RecentConversations = () => {
  const [isLoading, setLoading] = useState(false);
  const ChatRoomsState = useChatStore((state) => state);

  const [ref, inView] = useInView();
  const [EndOfFetching, setEndOfFetching] = useState(false);

  const fetchDms = (force?: boolean) => {
    if (!force && EndOfFetching) return;

    const recentDms = force ? [] : ChatRoomsState.recentDms;
    const offset = recentDms.length;

    offset === 0 && setLoading(true);

    fetchDmsCall(offset, 7)
      .then((res) => {
        if (res?.status !== 200 && res?.status !== 201) {
        } else {
          const rooms: DmRoom[] = [];
          res.data.forEach(
            (room: {
              secondMemberId: string;
              id: string;
              last_message?: {
                content?: string;
                createdAt?: string;
              };
              name: string;

              avatar: {
                thumbnail: string;
                medium: string;
                large: string;
              };
              bio: string;
            }) => {
              // to check if not exist
              rooms.push({
                secondUserId: room.secondMemberId,
                id: room.id,
                name: room.name,
                avatar: room.avatar,
                last_message: {
                  content: room.last_message?.content,
                  createdAt: room.last_message?.createdAt,
                },
                bio: room.bio,
              });
            },
          );

          if (res.data.length > 0) {
            ChatRoomsState.fillRecentDms([
              ...ChatRoomsState.recentDms,
              ...rooms,
            ]);
          } else {
            setEndOfFetching(true);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDms();
    // eslint-disable-next-line
  }, [inView]);

  return (
    <div className="h-full flex flex-col ">
      <OnlineNowUsers />
      {ChatRoomsState.recentDms.length > 0 ? (
        <div className="flex-grow overflow-y-auto no-scrollbar bg-accent">
          {ChatRoomsState.recentDms.map((friend, index) => (
            <div
              key={friend.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
            <ChatPlaceHolder
              bio={friend?.bio}
              secondUserId={friend.secondUserId}
              id={friend.id}
              username={friend.name}
              message={friend.last_message?.content ?? "No Messages*"}
              time={friend.last_message?.createdAt}
              isMe={true}
              isRead={true}
              userImage={friend.avatar.medium}
            />
            </div>
          ))}
          {!EndOfFetching && (
            <div
              ref={ref}
              className="flex justify-center items-center h-2 py-5"
            >
              <Dots size="sm" className="text-gray-400" />
            </div>
          )}
          {EndOfFetching && (
            <div
              ref={ref}
              className="flex justify-center items-center h-2 py-5"
            >
              <span className="text-xs font-light font-poppins text-gray-400">
                No more dm...{" "}
                <span
                  className="underline decoration-dashed cursor-pointer"
                  onClick={() => {
                    setEndOfFetching(false); // Reset
                    ChatRoomsState.fillRecentDms([]); // Reset
                    setTimeout(() => fetchDms(true), 100);
                  }}
                >
                  Refresh!
                </span>
              </span>
            </div>
          )}
        </div>
      ) : (
        <>
          {isLoading === true ? (
            <div className="text-center">
              <Spinner size="lg" className="text-primary" />
            </div>
          ) : (
            <NullPlaceHolder message="No Conversation Yet!, Be The First" />
          )}
        </>
      )}
    </div>
  );
};

export const ChatPlaceHolder = ({
  username,
  message,
  time,
  isRead,
  userImage,
  id,
  secondUserId,
  bio,
}: ChatPaceHolderProps) => {
  const selectNewChat = useChatStore((state) => state.selectNewChatID);
  const selectedChatID = useChatStore((state) => state.selectedChatID);
  const chatState = useChatStore((state) => state);

  return (
    <div
      onClick={() => {
        if (selectedChatID !== id) {
          selectNewChat(id);
        }
        chatState.setCurrentDmUser({
          bio: bio,
          secondUserId: secondUserId,
          id: id,
          name: username,
          avatar: {
            thumbnail: userImage,
            medium: userImage,
            large: userImage,
          },
        });
      }}
      className={`message-container flex   px-4 py-5 transition-colors duration-200 hover:bg-base-300 items-center  ${
        selectedChatID === id ? "bg-base-300" : "bg-accent"
      }`}
    >
      <div className="user-image flex-shrink-0 mr-2">
        <Img
          className="user-image h-10 w-10 rounded-full transition-transform duration-200 hover:scale-110"
          src={userImage}
          alt={`second's Profile`}
        />
      </div>
      <div className="message-colum align-middle flex flex-col flex-grow">
        <div className="message-row flex flex-row justify-between">
          <p className="text-white font-poppins text-sm md:text-base font-normal leading-normal line-clamp-1">
            {username}
          </p>
          <p className="text-gray-400 font-poppins text-xs font-light leading-normal whitespace-nowrap">
            {time ? formatTime(time!) : ""}
          </p>
        </div>
        <div className=" flex flex-row justify-between">
          <p className="text-gray-400 font-poppins text-sm font-medium leading-normal max-w-[80px] md:max-w-[180px]  truncate hidden md:block ">
            {message ?? "h"}
          </p>
          {isRead === false ? (
            <div className="messages-dot relative inline-flex">
              <div className="w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center">
                <span className="text-xs  font-medium">5</span>
              </div>
            </div>
          ) : (
            <img alt="" className="hidden md:block" src={check} />
          )}
        </div>
      </div>
    </div>
  );
};

export const OnlineNowUsers = () => {
  const selectedChatType = useChatStore((state) => state.selectedChatType);
  const changeChatType = useChatStore((state) => state.changeChatType);
  const chatState = useChatStore((state) => state);
  const socketStore = useSocketStore();
  const navigate = useNavigate();
  const [Users, setUsers] = useState<RoomMember[]>([]);

  const modalState = useModalStore();

  const handleListOfOnline = (ids: string[]) => {
    ids.forEach((id) => {
      if (
        !chatState.onlineFriendsIds.includes(id) &&
        Users.find((u) => u.id === id)
      ) {
        chatState.addOnlineFriend(id);
      }
    });
  };

  useEffect(() => {
    const fetchFriends = async () => {
      await getFriendsCall(0, 20).then((res) => {
        if (res?.status === 200 || res?.status === 201) {
          const friends: RoomMember[] = [];
          res.data.forEach(
            (friend: {
              userId: string;
              firstname: string;
              lastname: string;
              avatar: {
                thumbnail: string;
                medium: string;
                large: string;
              };
            }) => {
              friends.push({
                id: friend.userId,
                firstname: friend.firstname,
                lastname: friend.lastname,
                // to inject it with the real images later
                avatar: friend.avatar,
              } as RoomMember);
            },
          );

          setUsers(friends);
        } else {
        }
      });
    };
    socketStore.socket?.on("onlineFriends", handleListOfOnline);
    fetchFriends();
    // eslint-disable-next-line
  }, [chatState.onlineFriendsIds.length]);

  return (
    <>
      <div className="online-now-container    p-5 bg-accent">
        <div className="messages-header flex flex-row justify-between pb-2">
          <p className="text-purple-500 font-poppins text-sm md:text-lg font-medium leading-normal ">
            Messages
          </p>

          <div className="icons-row flex flex-row items-center gap-2">
            <button
              type="button"
              aria-label="Create room"
              onClick={() => modalState.setShowCreateChatRoomModal(true)}
            >
              <img className="w-[80%]" alt="" src={GroupChat} />
            </button>
            <button
              type="button"
              aria-label="Explore rooms"
              onClick={() => modalState.setShowExploreModal(true)}
            >
              <img className="w-[100%]" alt="" src={Explore} />
            </button>
          </div>
        </div>
        <div className="Message-Type-Buttons flex flex-row pt-2 pb-2 justify-between ">
          <button
            onClick={() => changeChatType(ChatType.Chat)}
            className={`${
              selectedChatType === ChatType.Chat ? "bg-base-300" : ""
            } flex-1 p-2 rounded`}
          >
            <div className=" flex flex-row justify-center ">
              <p className="text-gray-300 font-poppins text-base font-medium leading-normal pr-3 hidden md:block ">
                Chat
              </p>
              <img alt="" src={ChatIcon}></img>
            </div>
          </button>
          <button
            onClick={() => changeChatType(ChatType.Room)}
            className={`${
              selectedChatType === ChatType.Room ? "bg-base-300" : ""
            } flex-1 p-2 rounded  `}
          >
            <div className="flex flex-row justify-center">
              <p className="text-gray-300 font-poppins text-base font-medium leading-normal pr-3 hidden md:block">
                Rooms
              </p>
              <img alt="" src={RoomsIcon}></img>
            </div>
          </button>
        </div>
        {chatState.onlineFriendsIds.length > 0 && (
          <div className="hidden md:block">
            <div className="message-row flex flex-row pt-2 justify-between">
              <p className="text-gray-400 font-poppins text-xs font-medium leading-normal ">
                Online Now
              </p>
            </div>

            <div className="users-images flex flex-row justify-between pt-3   ">
              {chatState.onlineFriendsIds
                .filter((user) => Users.find((u) => u.id === user))
                .map((user) => (
                  <div key={user} className="flex flex-col ">
                    <button
                      onClick={async () => {
                        await createNewRoomCall("", "dm", undefined, user).then(
                          (res) => {
                            if (res?.status === 200 || res?.status === 201) {
                              chatState.changeChatType(ChatType.Chat);

                              chatState.setCurrentDmUser({
                                secondUserId: user,
                                id: res?.data?.id,
                                name: ((Users.find((u) => u.id === user)
                                  ?.firstname as string) +
                                  " " +
                                  Users.find((u) => u.id === user)
                                    ?.lastname) as string,
                                avatar: Users.find((u) => u.id === user)
                                  ?.avatar as {
                                  thumbnail: string;
                                  medium: string;
                                  large: string;
                                },
                                bio: Users.find((u) => u.id === user)
                                  ?.bio as string,
                              });
                              chatState.selectNewChatID(res?.data?.id);
                              navigate(`/dm/${res?.data.id}`);
                            } else {
                              toast.error(
                                "You Can't Send Message To this User For Now, try Again later",
                              );
                            }
                          },
                        );
                      }}
                    >
                      <div className="relative inline-block">
                        <Img
                          className="user-image h-11 w-11 rounded-full"
                          src={
                            Users.find((u) => u.id === user)?.avatar.medium ??
                            NullUser
                          }
                          alt={`second's Profile`}
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="text-center mt-1 font-poppins text-sm truncate max-w-[48px]">
                        {Users.find((u) => u.id === user)?.firstname}
                      </div>
                    </button>
                  </div>
                ))}
              {Array.from({
                length: 5 - chatState.onlineFriendsIds.length,
              }).map((_, index) => (
                <div key={`skeleton-${index}`} className=" flex flex-col">
                  {skeleton()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export const skeleton = () => {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Skeleton className="w-12 h-12 rounded-full" />
      <Skeleton className="h-2.5 w-8 rounded-full" />
    </div>
  );
};
