import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class ExportExcelService {
  exportToExcel(jsonData: any[], fileName: string = 'data'): void {
    const worksheet = XLSX.utils.json_to_sheet(jsonData);

   
    const detailsColIndex = Object.keys(jsonData[0]).indexOf('ItemsDetails');

    if (detailsColIndex !== -1) {
      jsonData.forEach((row, rowIndex) => {
        const cellAddress = XLSX.utils.encode_cell({
          r: rowIndex + 1, 
          c: detailsColIndex,
        });

        const cell = worksheet[cellAddress];
        if (cell) {
          cell.s = { alignment: { wrapText: true } };
        }
      });
    }
    

    const colWidths = Object.keys(jsonData[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...jsonData.map((row) => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: maxLength + 2 }; 
    });

    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }
}