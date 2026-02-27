export interface StructurePost{
  InfrastructureName: string;
  InfrastructureAlias: string;
}

export interface StructureGet{
  infrastructureId: string;
  infrastructureName: string;
  infrastructureAlias: string;
  createdAt: string;
}

export interface StructureUpdate {
  data: StructurePost;
  id: string;
}
