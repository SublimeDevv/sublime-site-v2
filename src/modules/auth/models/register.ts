import { BaseModel } from '@/types/models';

export interface RegisterModel extends BaseModel {
  userId: string;
  userName: string;
}
