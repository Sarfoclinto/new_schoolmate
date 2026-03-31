export type RequestStatus = "pending" | "approved" | "declined";

export type RequestType = "ACADEMIC_RECORD_UPDATE"; // extend union as you add more

export interface RequestItem {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  status: RequestStatus;
  content: string;
  yearId?: string;
  yearName?: string;
  termId?: string;
  termName?: string;
  sublevelId?: string;
  sublevelName?: string;
  createdAt: string;
  type: RequestType;
}

export interface RequestPayload {
  senderId: string;
  receiverId: string;
  status: "pending";
  content: string;
  type: RequestType;
  academicYearId?: string;
  academicTermId?: string;
  sublevelId?: string;
  other?: string;
}

export interface UpdatePayload {
  requestId: string;
  status: "approved" | "declined";
  senderId: string;
}

export interface DeletePayload {
  requestId: string;
  senderId: string;
  receiverId: string;
}
