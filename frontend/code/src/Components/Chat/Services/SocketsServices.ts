import { io } from "socket.io-client";
import { create } from "zustand";

interface SocketStore {
  socket: any;
  connected: boolean;

  setSocket: () => any;
}

export const useSocketStore = create<SocketStore>((set) => ({
  socket: null,
  connected: false,
  setSocket: () => {
    let newSocket: any = null;
    const socketEndpoint = process.env.REACT_APP_SOCKET_ENDPOINT;

    set((state) => {
      if (state.socket === null) {
        if (!socketEndpoint) {
          return state;
        }
        newSocket = io(
          socketEndpoint,
          {
            transports: ["websocket"],
            withCredentials: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 1000,
            reconnectionAttempts: 5,
          },
        );

        // Set socket
        set({ ...state, socket: newSocket });

        newSocket.on("connect", () => {
          // Set connected state
          set({ ...state, connected: true });
        });

        newSocket.on("connect_error", async () => {
          await new Promise((resolve) =>
            setTimeout(() => {
              // Set connected state
              set({ ...state, connected: false });
              newSocket.connect();
              resolve(newSocket);
            }, 1000),
          );
        });

        return { ...state, socket: newSocket };
      }

      return state;
    });

    return newSocket;
  },
}));
