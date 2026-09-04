export type User = {
  emp_id: number;
  name: string;
  nup: string;
  group_id: number;
  group: string;
  emp_status: string;
  userid_machine: string;
  office_id: number;
  office: string;
  position_id: number;
  position_level: number;
  position: string;
  department_id: number;
  department: string;
  subdepartment_id: number;
  instate: string;
  outstate: string;
  emp_photo: string;
  is_absentlocation: string;
  emp_group: string;
  device_token: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};
