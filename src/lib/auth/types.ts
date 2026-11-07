export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
}

export const DEFAULT_USER: AuthUser = {
  id: "usr-client-01",
  name: "Nguyễn Thanh Tuấn",
  email: "khachhang@gmail.com",
  phone: "0912345678",
  role: "user",
  organization: "Tập đoàn Đất Xanh Corp",
};

export const DEFAULT_ADMIN: AuthUser = {
  id: "usr-admin-01",
  name: "Ban Quản Trị EventViet",
  email: "admin@eventviet.vn",
  phone: "0909888999",
  role: "admin",
  organization: "EventViet Corp",
};
