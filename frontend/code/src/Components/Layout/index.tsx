import { Logo } from "./Assets/Logo";
import { Alert } from "./Assets/Alert";
import { Avatar } from "./Assets/Avatar";
import { Search } from "./Assets/Search";
import { Dash } from "./Assets/Dash";
import { Game } from "./Assets/Game";
import { Message } from "./Assets/Message";
import { Profile } from "./Assets/Profile";
import { Settings } from "./Assets/Settings";
import { Out } from "./Assets/Out";
import {
  FC,
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { Outlet } from "react-router";
import { matchRoutes, useLocation } from "react-router-dom";
import { useUserStore } from "../../Stores/stores";
import { useNavigate } from "react-router-dom";
import { FirstLogin } from "../FirstLogin";
import { useSocketStore } from "../Chat/Services/SocketsServices";
import {
  BlockedUsersModal,
  FriendsListModal,
  ShowLogoModal,
} from "../Chat/Components/RoomChatHelpers";
import { Modal } from "./Assets/Modal";

import { InvitationGame } from "./Assets/Invitationmodale";
import { useGameState } from "../Game/States/GameState";
import { useModalStore } from "../Chat/Controllers/LayoutControllers";
const routes = [
  { path: "profile/:id" },
  { path: "dm/:id" },
  { path: "settings" },
  { path: "home" },
  { path: "chat" },
  { path: "play" },
  { path: "play/bot" },
  { path: "Pure" },
  { path: "game/:id" },
];

const useCurrentPath = () => {
  const location = useLocation();
  const [{ route }]: any = matchRoutes(routes, location);
  return route.path;
};

export const Layout: FC<PropsWithChildren> = (): JSX.Element => {
  const gameStore = useGameState();
  const user = useUserStore();
  const navigate = useNavigate();
  const socketStore = useSocketStore();
  const invitationGameRef = useRef<HTMLDialogElement>(null);
  const path: string = useCurrentPath();
  const location = useLocation();
  const isPlayRoute = path === "play" || path === "play/bot";

  const modalState = useModalStore();

  useEffect(() => {
    if (gameStore.end === false && path !== "game/:id") {
      socketStore.socket?.emit("leave");
      gameStore.setEnd(true);
    }
    return () => {
      socketStore.socket?.off("leave");
    };
    // eslint-disable-next-line
  }, [path]);
  useLayoutEffect(() => {
    // Prevent ESC key
    const preventEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    document.addEventListener("keydown", preventEsc, false);

    const log = async () => {
      try {
        await user.login();
      } catch (e: any) {
        if (
          e?.response?.status !== 403 &&
          e?.response?.data?.message !== "Please complete your profile"
        ) {
          navigate("/");
          user.logout();
        }
      }
    };

    socketStore.socket = socketStore.setSocket();

    log();
    socketStore.socket?.on("invitedToGame", (data: any) => {
      user.setGameInvitation(data);
      invitationGameRef.current?.showModal();
    });
    return () => {
      document.removeEventListener("keydown", preventEsc, false);
      socketStore.socket?.off("invitedToGame");
    };
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {user.profileComplet === false && user.isLogged ? (
        <FirstLogin />
      ) : (
        <div
          data-theme="mytheme"
          className={`relative h-screen max-h-screen overflow-x-hidden bg-base-100 ${
            !user.profileComplet ? "blur-lg" : ""
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-primary/25 blur-[120px] animate-float" />
            <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-[140px] animate-float [animation-delay:1.5s]" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-info/10 blur-[120px] animate-float [animation-delay:3s]" />
          </div>
          <Modal />
          <header className="relative z-40 flex flex-row w-full h-16 min-h-16 bg-base-200/70 backdrop-blur-xl border-b border-base-300/60">
            <div className="flex justify-start items-center z-50 h-full w-full">
              <ShowLogoModal />
              {modalState.showBlockedListModal && <BlockedUsersModal />}
              {modalState.showFriendsListModal && <FriendsListModal />}
              <Logo className="sm:w-30 w-20" />
            </div>
            <div className="flex items-center  justify-end pr-6 gap-6 h-full w-full">
              <Search />
              <Alert />
              <Avatar picture={`${user?.picture?.medium}`} />
            </div>
          </header>
          <div className="relative flex h-[calc(100vh-4rem)]">
            <nav
              aria-label="Primary"
              className="sm:flex flex-col hidden justify-around items-stretch h-full bg-base-200/60 backdrop-blur-xl border-r border-base-300/60 md:pt-20 w-20 min-w-[5.5rem] max-w-[6rem]"
            >
              <div className="flex flex-col justify-evenly content-start gap-y-10 pb-44">
                <Dash selected={path === "home"} className="mx-auto" />
                <Game selected={isPlayRoute} className="mx-auto" />
                <Message selected={path === "chat"} className="mx-auto" />
                <Profile
                  selected={path === "profile/:id"}
                  className="mx-auto"
                />
                <Settings selected={path === "settings"} className="mx-auto" />
              </div>
              <div className="flex flex-col justify-start">
                <Out className="mx-auto" />
              </div>
            </nav>
            <nav
              aria-label="Mobile"
              className=" h-[8vh] fixed bottom-0 sm:hidden btm-nav bg-base-200/70 backdrop-blur-xl border-t border-base-300/60 flex justify-end z-50"
            >
              <Dash selected={path === "home"} />
              <Game selected={isPlayRoute} />
              <Message selected={path === "chat"} />
              <Profile selected={path === "profile/:id"} />
              <Settings selected={path === "settings"} />
            </nav>
            <main
              className="flex-1 min-w-0 w-full z-10 h-full bg-accent/85 backdrop-blur-md sm:rounded-tl-2xl overflow-auto no-scrollbar"
              id="scrollTarget"
            >
              <div key={location.pathname} className="h-full animate-fade-in">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      )}
      <InvitationGame ref={invitationGameRef} />
    </>
  );
};
