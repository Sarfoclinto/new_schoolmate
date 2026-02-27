export interface RoleGet {
  roleId: string;
  roleName: string;
}
export interface RolePost {
  RoleName: string;
  //   RoleType: string;
}

export interface RoleUpdate {
  data: RolePost;
  id: string;
}
