// faculty
export interface FacultiesGet {
  facultyId: string;
  facultyName: string;
  facultyAlias: string;
  createdAt: string;
}

export interface FacultiesPost {
  FacultyName: string;
  FacultyAlias?: string;
}

export interface FacultiesUpdate {
  data: FacultiesPost;
  id: string;
}

// classroom
export interface ClassroomsGet {
  classRoomId: string;
  classRoomName: string;
  capacity: number;
  subLevelId: string;
  subLevelName: string;
  facultyId?: string;
  facultyName: string;
  facultyAlias: string;
  createdAt: string;
}

export interface ClassroomsPost {
  FacultyId?: string | null;
  ClassRoomName: string;
  // Capacity: number;
}

export interface ClassroomsUpdate {
  data: ClassroomsPost;
  id: string;
}

export interface Mapping {
  ClassRoomId: string;
  SubLevelId: string;
}
