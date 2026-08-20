import { createBrowserRouter, RouterProvider } from "react-router-dom";
const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => {
      let { Login } = await import("../Components/Login");
      return { Component: Login };
    },
  },
  {
    path: "/",
    lazy: async () => {
      let { Layout } = await import("../Components/Layout");
      return { Component: Layout };
    },
    children: [
      {
        path: "home",
        lazy: async () => {
          let { Home } = await import("../Components/Home");
          return { Component: Home };
        },
      },
      {
        path: "play",
        lazy: async () => {
          let { Play } = await import("../Components/Play");
          return { Component: Play };
        },
      },
      {
        path: "play/bot",
        lazy: async () => {
          let { BotGame } = await import("../Components/BotGame");
          return { Component: BotGame };
        },
      },
      {
        path: "settings",
        lazy: async () => {
          let { Setting } = await import("../Components/Settings");

          return { Component: Setting };
        },
      },

      {
        path: "profile/:id",
        lazy: async () => {
          let { Profile } = await import("../Components/Profile");
          return { Component: Profile };
        },
      },
      {
        path: "chat",
        lazy: async () => {
          let { Chat } = await import("../Components/Chat");
          return { Component: Chat };
        },
      },
      {
        path: "dm/:id",
        lazy: async () => {
          let { UserToUserChat } = await import(
            "../Components/Chat/Components/UserToUserChat"
          );
          return { Component: UserToUserChat };
        },
      },
      {
        path: "game/:id",
        lazy: async () => {
          let { Game } = await import("../Components/Game");
          return { Component: Game };
        },
      },
    ],
  },
  {
    path: "2fa/validate/:token",
    lazy: async () => {
      let { Validate2Fa } = await import("../Components/Validate2Fa");
      return { Component: Validate2Fa };
    },
  },
  {
    path: "*",
    lazy: async () => {
      let { Error } = await import("../Components/Error");
      return { Component: Error };
    },
  },
]);

export const AllRouters = () => {
  return <RouterProvider router={router} />;
};
