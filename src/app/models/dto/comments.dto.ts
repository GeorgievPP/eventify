export interface CommentUserDto {
  _id: string;
  email: string;
  role?: 'user' | 'poweruser' | 'admin';
}

export interface CommentDto {
  _id: string;
  eventId: string; 

  content?: string;
  text?: string;

  createdAt: string;
  userId: CommentUserDto | null;

  likes?: string[]; // array of user IDs
  likesCount?: number;
  likedByCurrentUser?: boolean;

  isDeleted?: boolean;
  deletedAt?: string | null;
}
