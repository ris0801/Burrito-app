import { RowDataPacket } from 'mysql2';

export interface User extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  role: string; // 'employee' or 'customer'
}
