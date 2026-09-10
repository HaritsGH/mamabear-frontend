import { sendChatMessage, getChatSessions, getChatMessages } from "./chatService";
import { apiClient } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

describe("chatService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("sendChatMessage", () => {
    it("posts the message to /chat and returns the unwrapped reply", async () => {
      const data = {
        sessionId: "session-1",
        message: {
          id: "msg-1",
          sessionId: "session-1",
          role: "assistant",
          content: "hi",
          createdAt: "now",
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValue(
        mockResponse({ success: true, statusCode: 200, message: "ok", data, timestamp: "now" }),
      );

      const result = await sendChatMessage({ message: "hello" });

      expect(apiClient.post).toHaveBeenCalledWith("/chat", { message: "hello" });
      expect(result).toEqual(data);
    });

    it("throws when the HTTP response is not ok", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse({}, false, 500));

      await expect(sendChatMessage({ message: "hello" })).rejects.toThrow("HTTP 500");
    });

    it("throws the backend's safe message when the AI call fails (BAT-3 OpenRouter error handling)", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(
        mockResponse({
          success: false,
          statusCode: 502,
          message: "Asisten AI sedang tidak tersedia, coba lagi nanti",
          data: null,
          timestamp: "now",
        }),
      );

      await expect(sendChatMessage({ message: "hello" })).rejects.toThrow(
        "Asisten AI sedang tidak tersedia, coba lagi nanti",
      );
    });
  });

  describe("getChatSessions", () => {
    it("gets /chat and returns the unwrapped session list", async () => {
      const data = [
        { id: "session-2", userId: "u1", createdAt: "2026-09-09", updatedAt: "2026-09-09" },
        { id: "session-1", userId: "u1", createdAt: "2026-09-01", updatedAt: "2026-09-01" },
      ];
      (apiClient.get as jest.Mock).mockResolvedValue(
        mockResponse({ success: true, statusCode: 200, message: "ok", data, timestamp: "now" }),
      );

      const result = await getChatSessions();

      expect(apiClient.get).toHaveBeenCalledWith("/chat");
      expect(result).toEqual(data);
    });

    it("throws when the HTTP response is not ok", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse({}, false, 500));

      await expect(getChatSessions()).rejects.toThrow("HTTP 500");
    });
  });

  describe("getChatMessages", () => {
    it("gets /chat/:sessionId and returns the unwrapped message list", async () => {
      const data = [
        { id: "msg-1", sessionId: "session-1", role: "user", content: "hi", createdAt: "now" },
        { id: "msg-2", sessionId: "session-1", role: "assistant", content: "hello", createdAt: "now" },
      ];
      (apiClient.get as jest.Mock).mockResolvedValue(
        mockResponse({ success: true, statusCode: 200, message: "ok", data, timestamp: "now" }),
      );

      const result = await getChatMessages("session-1");

      expect(apiClient.get).toHaveBeenCalledWith("/chat/session-1");
      expect(result).toEqual(data);
    });

    it("throws when the session belongs to another user (BAT-4 ownership guard, 403)", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse({}, false, 403));

      await expect(getChatMessages("someone-elses-session")).rejects.toThrow("HTTP 403");
    });

    it("throws when the session does not exist (BAT-4 ownership guard, 404)", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse({}, false, 404));

      await expect(getChatMessages("missing")).rejects.toThrow("HTTP 404");
    });
  });
});
