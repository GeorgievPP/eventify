export interface DataTableColumn<T = any> {
  key: (keyof T & string) | string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  format?: (row: T) => string;
  isActions?: boolean;
}