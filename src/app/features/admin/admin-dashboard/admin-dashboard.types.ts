import { OrderStatus } from "../../../models/orders";

export type DashboardPeriodType = 'all' | '7d' | '30d';

export type TopEvent = {
  eventId: string;
  title: string;
  totalQuantity: number;
  totalRevenue: number;
};

export type StatusStat = { status: OrderStatus; count: number };
