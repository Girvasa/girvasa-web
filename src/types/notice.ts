export type NoticeStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "EXPIRED" | "CANCELLED" | "ARCHIVED";

export interface NoticeResponse {
  id: string;
  societyId: string;
  title: string;
  content: string;
  status: NoticeStatus;
  isImportant: boolean;
  audienceType: string;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface CreateNoticeRequest {
  title: string;
  content: string;
  isImportant?: boolean;
  audienceType?: string;
  expiresAt?: string;
}
