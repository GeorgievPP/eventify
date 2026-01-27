import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DataTableColumn } from '../../../../../models/shared';

import { DataTable } from '../../../../../shared/ui/data-table/data-table';


@Component({
  selector: 'app-orders-table',
  imports: [RouterLink, DataTable],
  templateUrl: './orders-table.html',
  styleUrl: './orders-table.css',
})
export class OrdersTable {
  // ==========================================
  // INPUTS (Signal-based)
  // ==========================================
  columns = input.required<DataTableColumn<any>[]>();
  rows = input.required<any[]>();
  rowLink = input<((row: any) => string) | undefined>(undefined);
  rowClickable = input<boolean>(false);
}