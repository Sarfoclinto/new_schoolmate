export type RouteMode = {
  mode: "route";
};

export type Pagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ParamMode = {
  mode: "param";
  paramKey: string;
};

export type GetSingleOptions = RouteMode | ParamMode;

export type MdResponse = {
  responseCode: 0 | 1;
  responseMessage: string;
};

export type PaginatedRes<K = unknown[]> = {
  data: K;
  pagination: Pagination;
};

export type RegisterResponse = {
  response: MdResponse;
  data: {
    studentId?: string;
    staffId?: string;
  };
};
