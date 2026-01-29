import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NotificationService } from '../../../../../core/services/ui';
import { CommentService } from '../../../../../core/services/comments';

import { EventComment } from '../../../../../models/events';

@Component({
  selector: 'app-event-comments',
  imports: [FormsModule],
  templateUrl: './event-comments.html',
  styleUrl: './event-comments.css',
})
export class EventComments {
  // ==========================================
  // DEPENDENCIES
  // ==========================================
  private commentService = inject(CommentService);
  private notifications = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  eventId = input.required<string>();
  userId = input<string | null>(null);
  isStaff = input<boolean>(false);

  // ==========================================
  // STATE FROM SERVICE
  // ==========================================
  comments = this.commentService.comments;
  loading = this.commentService.isLoading;
  submitting = this.commentService.isOperating;

  // ==========================================
  // LOCAL UI STATE (Add Comment)
  // ==========================================
  newCommentText = signal('');

  // ==========================================
  // LOCAL UI STATE (Edit Comment)
  // ==========================================
  editingCommentId = signal<string | null>(null);
  editText = signal('');

  // ==========================================
  // LOCAL UI STATE (Delete Confirmation)
  // ==========================================
  confirmOpen = signal(false);
  commentToDelete = signal<EventComment | null>(null);

  // ==========================================
  // LOCAL UI STATE (History Modal - Staff)
  // ==========================================
  historyOpen = signal(false);
  historyCommentId = signal<string | null>(null);
  commentHistory = signal<any[]>([]);
  historyLoading = signal(false);

  // ==========================================
  // LIFECYCLE (Effect for eventId changes)
  // ==========================================
  constructor() {
    effect(
      () => {
        const id = this.eventId();
        if (id) {
          this.load();
        }
      },
      // { allowSignalWrites: true },
    );
  }

  // ==========================================
  // HELPERS
  // ==========================================

  formatCommentDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  canDeleteComment(comment: EventComment): boolean {
    const currentUserId = this.userId();
    const isOwner = !!currentUserId && comment.user?._id === currentUserId;
    return isOwner || this.isStaff();
  }

  // ==========================================
  // DATA LOADING
  // ==========================================

  private load(): void {
    const id = this.eventId();
    if (!id) return;

    this.commentService
      .loadForEvent(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          const err = this.commentService.error();
          if (err) {
            this.notifications.showError(err);
          } else {
            this.notifications.showError('Failed to load comments.');
          }
        },
      });
  }

  // ==========================================
  // ADD COMMENT
  // ==========================================

  addComment(): void {
    const text = this.newCommentText().trim();
    const id = this.eventId();

    if (!id || !text) return;
    if (this.submitting()) return;

    this.commentService
      .add(id, text)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.newCommentText.set('');
          this.notifications.showSuccess('Comment added.');
        },
        error: () => {
          const err = this.commentService.error();
          if (err) {
            this.notifications.showError(err);
          } else {
            this.notifications.showError('Failed to add comment.');
          }
        },
      });
  }

  // ==========================================
  // LIKE COMMENT
  // ==========================================

  toggleLike(commentId: string): void {
    this.commentService
      .toggleLike(commentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          const err = this.commentService.error();
          if (err) {
            this.notifications.showError(err);
          } else {
            this.notifications.showError('Failed to update like.');
          }
        },
      });
  }

  // ==========================================
  // DELETE COMMENT (with confirmation)
  // ==========================================

  openDeleteConfirm(comment: EventComment): void {
    this.commentToDelete.set(comment);
    this.confirmOpen.set(true);
  }

  cancelDelete(): void {
    this.confirmOpen.set(false);
    this.commentToDelete.set(null);
  }

  confirmDelete(): void {
    const c = this.commentToDelete();
    if (!c) return;

    this.commentService
      .delete(c._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.showSuccess('Comment deleted.');
          this.cancelDelete();
        },
        error: () => {
          const err = this.commentService.error();
          if (err) {
            this.notifications.showError(err);
          } else {
            this.notifications.showError('Failed to delete comment.');
          }
        },
      });
  }

  // ==========================================
  // EDIT COMMENT
  // ==========================================

  startEdit(c: EventComment): void {
    this.editingCommentId.set(c._id);
    this.editText.set(c.text);
  }

  cancelEdit(): void {
    this.editingCommentId.set(null);
    this.editText.set('');
  }

  saveEdit(commentId: string): void {
    const text = this.editText().trim();
    if (!text) return;

    this.commentService
      .update(commentId, text)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cancelEdit();
          this.notifications.showSuccess('Comment updated.');
        },
        error: () => {
          const err = this.commentService.error();
          if (err) {
            this.notifications.showError(err);
          } else {
            this.notifications.showError('Failed to update comment.');
          }
        },
      });
  }

  // ==========================================
  // RESTORE COMMENT
  // ==========================================

  restoreComment(c: EventComment): void {
    this.commentService
      .restore(c._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.showSuccess('Comment restored.');
        },
        error: () => {
          const err = this.commentService.error();
          if (err) {
            this.notifications.showError(err);
          } else {
            this.notifications.showError('Failed to restore comment.');
          }
        },
      });
  }

  // ==========================================
  // COMMENT HISTORY (Staff)
  // ==========================================

  openHistory(commentId: string): void {
    this.historyOpen.set(true);
    this.historyCommentId.set(commentId);
    this.historyLoading.set(true);

    this.commentService
      .getHistory(commentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (h) => {
          this.commentHistory.set(h);
          this.historyLoading.set(false);
        },
        error: () => {
          this.historyLoading.set(false);
          const err = this.commentService.error();
          if (err) {
            this.notifications.showError(err);
          } else {
            this.notifications.showError('Failed to load comment history.');
          }
        },
      });
  }

  closeHistory(): void {
    this.historyOpen.set(false);
    this.historyCommentId.set(null);
    this.commentHistory.set([]);
  }
}
