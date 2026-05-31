import { create } from "zustand";
import { WS_ENDPOINTS } from "@/lib/apiConfig";

interface AIState {
  // WebSocket Connectivity
  socket: WebSocket | null;
  status: "idle" | "connecting" | "ready" | "error";

  // Streaming Data
  streamingBuffer: string;
  latestPrediction: Record<string, unknown> | null;
  isProcessing: boolean;

  // Actions
  connect: (token?: string) => void;
  disconnect: () => void;
  send: (data: Record<string, unknown>) => void;
  clearBuffer: () => void;
}

/**
 * Principal Architect: Optimized AI WebSocket Store.
 * Specifically designed to handle character-streaming and live status updates.
 */
export const useAIStore = create<AIState>((set, get) => {
  let streamInterval: NodeJS.Timeout | null = null;

  return {
    socket: null,
    status: "idle",
    streamingBuffer: "",
    latestPrediction: null,
    isProcessing: false,

    connect: (token?: string) => {
      if (get().socket?.readyState === WebSocket.OPEN) return;

      set({ status: "connecting" });
      try {
        const url = token ? `${WS_ENDPOINTS.AI_FEEDBACK}?token=${token}` : WS_ENDPOINTS.AI_FEEDBACK;
        const ws = new WebSocket(url);

        ws.onopen = () => {
          console.log("useAIStore: WebSocket Connected");
          set({ status: "ready", socket: ws });
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.status === "success") {
              const predictionData = data.data || {};
              set({ latestPrediction: predictionData, isProcessing: false });

              // Character-by-character buffer simulation for smooth UI rendering
              const text = predictionData.explanation || predictionData.corrected || "";
              if (!text) return;

              let i = 0;
              set({ streamingBuffer: "" });

              if (streamInterval) clearInterval(streamInterval);

              streamInterval = setInterval(() => {
                if (i < text.length) {
                  set((state) => ({
                    streamingBuffer: state.streamingBuffer + text[i],
                  }));
                  i++;
                } else {
                  if (streamInterval) clearInterval(streamInterval);
                  streamInterval = null;
                }
              }, 20);
            }
          } catch (err) {
            console.warn("useAIStore: Message parse error", err);
          }
        };

        ws.onclose = () => {
          console.log("useAIStore: WebSocket Closed");
          set({ status: "idle", socket: null });
        };

        ws.onerror = (err) => {
          console.warn("useAIStore: WebSocket Error", err);
          set({ status: "error" });
        };
      } catch (err) {
        console.warn("useAIStore: Connection error", err);
        set({ status: "error" });
      }
    },

    disconnect: () => {
      get().socket?.close();
      set({ socket: null, status: "idle" });
    },

    send: (data) => {
      const { socket, status } = get();
      if (socket && status === "ready") {
        set({ isProcessing: true });
        socket.send(JSON.stringify(data));
      }
    },

    clearBuffer: () => set({ streamingBuffer: "" }),
  };
});
