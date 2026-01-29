import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';

import { CommentApiService } from './comment-api.service';
import { CommentStoreService } from './comment-store.service';

import { EventComment } from '../../../models/events';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private readonly api = inject(CommentApiService);
  private readonly store = inject(CommentStoreService);

  // ==========================================
  // LOADING & ERROR STATES
  // ==========================================

  private readonly _isLoading = signal(false);
  readonly isLoading = computed(() => this._isLoading());

  private readonly _isOperating = signal(false);
  readonly isOperating = computed(() => this._isOperating());

  private readonly _error = signal<string | null>(null);
  readonly error = computed(() => this._error());

  private readonly _lastOperationSuccess = signal(false);
  readonly lastOperationSuccess = computed(() => this._lastOperationSuccess());

  // ==========================================
  // EXPOSE STORE PROPERTIES
  // ==========================================
  readonly comments = this.store.comments;
  readonly currentEventId = this.store.currentEventId;
  readonly totalComments = this.store.totalComments;
  readonly activeCommentsCount = this.store.activeCommentsCount;
  readonly deletedCommentsCount = this.store.deletedCommentsCount;
  readonly isEmpty = this.store.isEmpty;
  readonly hasActiveComments = this.store.hasActiveComments;

  // ==========================================
  // LOAD OPERATIONS
  // ==========================================

  loadForEvent(eventId: string): Observable<EventComment[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.api.getComments(eventId).pipe(
      tap((comments) => {
        this.store.setComments(eventId, comments);
        console.log(`[CommentService] Loaded ${comments.length} comments for event ${eventId}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[CommentService] Load comments failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isLoading.set(false);
      }),
    );
  }

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  add(eventId: string, text: string): Observable<EventComment> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.addComment(eventId, text).pipe(
      tap((newComment) => {
        this.store.addComment(newComment);
        this._lastOperationSuccess.set(true);
        console.log(`[CommentService] Comment added: ${newComment._id}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[CommentService] Add comment failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  update(commentId: string, content: string): Observable<EventComment> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.updateComment(commentId, content).pipe(
      tap((updatedComment) => {
        this.store.updateComment(updatedComment);
        this._lastOperationSuccess.set(true);
        console.log(`[CommentService] Comment updated: ${updatedComment._id}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[CommentService] Update comment failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  delete(commentId: string): Observable<void> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.deleteComment(commentId).pipe(
      tap(() => {
        this.store.removeComment(commentId);
        this._lastOperationSuccess.set(true);
        console.log(`[CommentService] Comment deleted: ${commentId}`);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[CommentService] Delete comment failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  restore(commentId: string): Observable<EventComment> {
    this._isOperating.set(true);
    this._error.set(null);
    this._lastOperationSuccess.set(false);

    return this.api.restoreComment(commentId).pipe(
      tap((restoredComment) => {
        this.store.updateComment(restoredComment);
        this._lastOperationSuccess.set(true);
      }),
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[CommentService] Restore comment failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this._isOperating.set(false);
      }),
    );
  }

  // ==========================================
  // LIKE OPERATION (Optimistic Update)
  // ==========================================

  toggleLike(commentId: string): Observable<EventComment> {
    const previousState: EventComment[] = this.store.getStateSnapshot();

    this.store.optimisticallyToggleLike(commentId);

    return this.api.toggleLikeComment(commentId).pipe(
      tap(() => {
       console.log(`[CommentService] Like toggled successfully: ${commentId}`);
      }),
      catchError((error) => {
        this.store.rollbackToState(previousState);
        console.error('[CommentService] Toggle like failed, rolled back:', error);
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }
  // ==========================================
  // ADDITIONAL OPERATIONS
  // ==========================================

  getHistory(commentId: string): Observable<any[]> {
    return this.api.getCommentHistory(commentId).pipe(
      catchError((error) => {
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        console.error('[CommentService] Get history failed:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  clearError(): void {
    this._error.set(null);
  }

  clearSuccess(): void {
    this._lastOperationSuccess.set(false);
  }

  clearComments(): void {
    this.store.clearComments();
  }

  // ==========================================
  // STORE QUERY HELPERS (Delegation)
  // ==========================================

  getCommentFromStore(commentId: string): EventComment | null {
    return this.store.getCommentById(commentId);
  }

  getActiveComments(): EventComment[] {
    return this.store.getActiveComments();
  }

  getDeletedComments(): EventComment[] {
    return this.store.getDeletedComments();
  }

  getCommentsByUserId(userId: string): EventComment[] {
    return this.store.getCommentsByUserId(userId);
  }

  getTopLikedComments(limit?: number): EventComment[] {
    return this.store.getTopLikedComments(limit);
  }

  getNewestComments(): EventComment[] {
    return this.store.getNewestComments();
  }

  getOldestComments(): EventComment[] {
    return this.store.getOldestComments();
  }

  getUserOwnComments(userId: string): EventComment[] {
    return this.store.getUserOwnComments(userId);
  }

  getLikedByUserComments(): EventComment[] {
    return this.store.getLikedByUserComments();
  }

  hasUserCommented(userId: string): boolean {
    return this.store.hasUserCommented(userId);
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  private extractErrorMessage(error: any): string {
    if (error?.message && !error.message.startsWith('Http failure')) {
      return error.message;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'Unauthorized. Please login.';
        case 403:
          return 'Access forbidden.';
        case 404:
          return 'Comment not found.';
        case 409:
          return 'Conflict. Comment may already exist.';
        case 500:
          return 'Server error. Please try again later.';
        case 0:
          return 'Cannot connect to server. Check your internet connection.';
        default:
          return error.statusText || 'An unexpected error occurred.';
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }
}
