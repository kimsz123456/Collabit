import { ChatMessage } from "../model/Chat";
import { User } from "../model/User";

export type ChatMessageRequest = Pick<ChatMessage, "message" | "timestamp">;

export type ChatRoomDetailRequest = Pick<ChatMessage, "roomCode">;

export type ChatroomRequest = Pick<User, "nickname"> &
  Pick<ChatMessage, "message">;

export type ChatRoomSwitchRequest = {
  newRoomCode: number;
};
