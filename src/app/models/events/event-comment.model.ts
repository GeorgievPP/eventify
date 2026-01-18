export interface CommentUser {
  _id: string;
  email: string;
  role?: 'user' | 'poweruser' | 'admin';
}

export interface EventComment {
  _id: string;
  eventId: string;
  text: string;
  createdAt: string;
  user: CommentUser | null;
  likesCount: number;
  likedByCurrentUser: boolean;

  isDeleted?: boolean;
  deletedAt?: string | null;
}
