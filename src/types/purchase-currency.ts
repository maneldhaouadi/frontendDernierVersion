import { DatabaseEntity } from './response/DatabaseEntity';

export interface PurchaseCurrency  extends DatabaseEntity {
  id?: number;
  label?: string;
  code?: string;
  symbol?: string;
  digitAfterComma?: number;
}
