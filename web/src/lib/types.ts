import type { Family } from "@shared/wheel";

export interface UserDoc {
  handle: string;
  displayName: string;
  photoURL: string | null;
  createdAt: number;
  storyCount: number;
}

export interface StoryDoc {
  text: string;
  word: string;
  family: Family;
  authorId: string;
  authorHandle: string;
  createdAt: number;
  likeCount: number;
  commentCount: number;
  random: number;
  textNormalized: string;
  status: "published" | "hidden";
}

export interface Story extends StoryDoc {
  id: string;
}

export interface CommentDoc {
  text: string;
  authorId: string;
  authorHandle: string;
  createdAt: number;
  likeCount: number;
}

export interface Comment extends CommentDoc {
  id: string;
}

export type FeedTab = "forYou" | "new" | "top";
