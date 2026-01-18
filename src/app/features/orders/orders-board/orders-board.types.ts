import { Order } from "../../../models/orders";

export type OrderRow = Order & { itemsCount: number };

export type DateRangeFilter = 'all' | '7d' | '30d' | 'thisMonth';