import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';

export type ReactionHandler = (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  emoji: string
) => Promise<void>;

export type ReactionHandlerWithData<T = any> = (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  emoji: string,
  data: T
) => Promise<void>;
