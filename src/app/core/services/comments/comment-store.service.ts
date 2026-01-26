import { computed, Injectable, signal } from '@angular/core';
import { EventComment } from '../../../models/events';


@Injectable({
  providedIn: 'root',
})
export class CommentStoreService {
  // ==========================================
  // PRIVATE STATE
  // ==========================================
  private readonly _comments = signal<EventComment[]>([]);
  private readonly _currentEventId = signal<string | null>(null);

  // ==========================================
  // PUBLIC COMPUTED PROPERTIES
  // ==========================================
  readonly comments = computed(() => this._comments());
  readonly currentEventId = computed(() => this._currentEventId());
  readonly totalComments = computed(() => this._comments().length);
  
  readonly activeCommentsCount = computed(
    () => this._comments().filter((c) => !c.isDeleted).length,
  );

  readonly deletedCommentsCount = computed(
    () => this._comments().filter((c) => c.isDeleted).length,
  );

  readonly isEmpty = computed(() => this._comments().length === 0);
  readonly hasActiveComments = computed(() => this._comments().some((c) => !c.isDeleted));

  // ==========================================
  // PUBLIC STATE MUTATION METHODS
  // ==========================================

  setComments(eventId: string, comments: EventComment[]): void {
    this._currentEventId.set(eventId);
    this._comments.set(comments);
    console.log(`[CommentStore] Comments set for event ${eventId}: ${comments.length} comments`);
  }

  addComment(comment: EventComment): void {
    this._comments.update((comments) => [...comments, comment]);
    console.log(`[CommentStore] Comment added: ${comment._id}`);
  }

  updateComment(updatedComment: EventComment): void {
    this._comments.update((comments) => {
      const index = comments.findIndex((c) => c._id === updatedComment._id);

      if (index === -1) {
        console.log(`[CommentStore] Comment not in list, adding: ${updatedComment._id}`);
        return [...comments, updatedComment];
      }

      const newComments = [...comments];
      newComments[index] = updatedComment;
      console.log(`[CommentStore] Comment updated: ${updatedComment._id}`);
      return newComments;
    });
  }

  removeComment(commentId: string): void {
    this._comments.update((comments) => {
      const comment = comments.find((c) => c._id === commentId);
      if (comment) {
        console.log(`[CommentStore] Comment removed: ${commentId}`);
      }
      return comments.filter((c) => c._id !== commentId);
    });
  }

  markCommentAsDeleted(commentId: string): void {
    this._comments.update((comments) =>
      comments.map((c) =>
        c._id === commentId ? { ...c, isDeleted: true, deletedAt: new Date().toISOString() } : c,
      ),
    );
    console.log(`[CommentStore] Comment marked as deleted: ${commentId}`);
  }

  clearComments(): void {
    this._comments.set([]);
    this._currentEventId.set(null);
    console.log('[CommentStore] All comments cleared');
  }

  // ==========================================
  // OPTIMISTIC UPDATE METHODS
  // ==========================================

  optimisticallyToggleLike(commentId: string): void {
    this._comments.update((comments) =>
      comments.map((c) => {
        if (c._id !== commentId) return c;

        const wasLiked = !!c.likedByCurrentUser;
        const nextLiked = !wasLiked;
        const nextCount = Math.max(0, (c.likesCount ?? 0) + (wasLiked ? -1 : 1));

        return {
          ...c,
          likedByCurrentUser: nextLiked,
          likesCount: nextCount,
        };
      }),
    );
    console.log(`[CommentStore] Optimistically toggled like: ${commentId}`);
  }

  rollbackToState(previousState: EventComment[]): void {
    this._comments.set(previousState);
    console.log('[CommentStore] Rolled back to previous state');
  }

  getStateSnapshot(): EventComment[] {
    return this._comments();
  }

  // ==========================================
  // PUBLIC QUERY METHODS
  // ==========================================

  getCommentById(commentId: string): EventComment | null {
    return this._comments().find((c) => c._id === commentId) ?? null;
  }

  getActiveComments(): EventComment[] {
    return this._comments().filter((c) => !c.isDeleted);
  }

  getDeletedComments(): EventComment[] {
    return this._comments().filter((c) => c.isDeleted);
  }

  getCommentsByUserId(userId: string): EventComment[] {
    return this._comments().filter((c) => c.user?._id === userId);
  }

  getTopLikedComments(limit?: number): EventComment[] {
    const sorted = [...this._comments()]
      .filter((c) => !c.deletedAt)
      .sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));

    return limit ? sorted.slice(0, limit) : sorted;
  }

  getNewestComments(): EventComment[] {
    return [...this._comments()]
      .filter((c) => !c.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOldestComments(): EventComment[] {
    return [...this._comments()]
      .filter((c) => !c.isDeleted)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  getUserOwnComments(userId: string): EventComment[] {
    return this._comments().filter((c) => !c.isDeleted && c.user?._id === userId);
  }

  getLikedByUserComments(): EventComment[] {
    return this._comments().filter((c) => !c.isDeleted && c.likedByCurrentUser);
  }

  hasUserCommented(userId: string): boolean {
    return this._comments().some((c) => !c.isDeleted && c.user?._id === userId);
  }
}
