import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { AuthService } from '../auth';

import { API_BASE_URL } from '../../constants';
import { EventComment } from '../../../models/events';
import { ApiResponse } from '../../../models/shared';
import { CommentDto } from '../../../models/dto';

@Injectable({
  providedIn: 'root',
})
export class CommentApiService {
    
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = API_BASE_URL;

  // GET COMMENTS FOR EVENT
  getComments(eventId: string): Observable<EventComment[]> {
    return this.http
      .get<ApiResponse<CommentDto[]>>(`${this.baseUrl}/events/${eventId}/comments`)
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.error?.message || 'Failed to load comments');
          }

          return res.data
            .map((dto) => this.mapComment(dto))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        })
      );
  }

  // ADD COMMENT
  addComment(eventId: string, text: string): Observable<EventComment> {
    return this.http
      .post<ApiResponse<CommentDto>>(`${this.baseUrl}/events/${eventId}/comments`, {
        content: text,
      })
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.error?.message || 'Failed to add comment');
          }

          return this.mapComment(res.data);
        })
      );
  }

  // UPDATE COMMENT
  updateComment(commentId: string, content: string): Observable<EventComment> {
    return this.http
      .put<ApiResponse<CommentDto>>(`${this.baseUrl}/comments/${commentId}`, { content })
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.error?.message || 'Failed to update comment');
          }

          return this.mapComment(res.data);
        })
      );
  }

  // DELETE COMMENT
  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/comments/${commentId}`).pipe(
      map((res) => {
        if (!res.success) {
          throw new Error(res.error?.message || 'Failed to delete comment');
        }

        return;
      })
    );
  }

  // LIKE TOGGLE COMMENT
  toggleLikeComment(commentId: string): Observable<EventComment> {
    return this.http
      .post<ApiResponse<CommentDto>>(`${this.baseUrl}/comments/${commentId}/like-toggle`, {})
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.error?.message || 'Failed to toggle like');
          }

          return this.mapComment(res.data);
        })
      );
  }

  // RESTORE COMMENT
  restoreComment(commentId: string): Observable<EventComment> {
    return this.http
      .patch<ApiResponse<CommentDto>>(`${this.baseUrl}/comments/${commentId}/restore`, {})
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.error?.message || 'Failed to restore comment');
          }

          return this.mapComment(res.data);
        })
      );
  }

  // GET COMMENT HISTORY
  getCommentHistory(commentId: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/comments/${commentId}/history`).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || 'Failed to load comment history');
        }

        return res.data;
      })
    );
  }

  // =============================
  // PRIVATE MAPPING
  // =============================

  private mapComment(dto: CommentDto): EventComment {
    const currentUserId = this.auth.getUserId();

    const likesArr = dto.likes ?? [];
    const likesCount = dto.likesCount ?? likesArr.length;

    const likedByCurrentUser =
      dto.likedByCurrentUser ?? (!!currentUserId && likesArr.includes(currentUserId));

    return {
      _id: dto._id,
      eventId: dto.eventId,

      text: (dto.text ?? dto.content ?? '').toString(),

      createdAt: dto.createdAt,
      user: dto.userId
        ? { _id: dto.userId._id, email: dto.userId.email, role: dto.userId.role }
        : null,

      likesCount,
      likedByCurrentUser,
      isDeleted: dto.isDeleted ?? false,
      deletedAt: dto.deletedAt ?? null,
    };
  }
}
