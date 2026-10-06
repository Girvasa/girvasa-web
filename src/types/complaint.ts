export type ComplaintStatus = "SUBMITTED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED";
export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface ComplaintCategory {
  id: string;
  name: string;
  description?: string;
}

export interface ComplaintTimelineEvent {
  id: string;
  fromStatus: ComplaintStatus;
  toStatus: ComplaintStatus;
  comment?: string;
  actorName: string;
  createdAt: string;
}

export interface ComplaintResponse {
  id: string;
  societyId: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  categoryId?: string;
  categoryName?: string;
  unitId?: string;
  unitNumber?: string;
  reportedByUserId: string;
  reportedByName?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  timeline?: ComplaintTimelineEvent[];
}
