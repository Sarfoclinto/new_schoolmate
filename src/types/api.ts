export type RouteMode = {
  mode: "route";
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

export type RegisterResponse = {
  response: MdResponse;
  data: {
    studentId?: string;
    staffId?: string;
  };
};
