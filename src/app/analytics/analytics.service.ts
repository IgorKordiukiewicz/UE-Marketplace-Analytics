import { Injectable } from '@angular/core';
import { SaleItem } from '../shared/models/SaleItem';
import Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor() { }

  parseSalesFile(file: File) {
    let items: SaleItem[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        items = data.map(row => ({
          day: row['Day'],
          product: row['Product'],
          basePrice: row['Base Price'],
          netUnits: row['Net Units']
        }));
        items.pop();
      }
    });

    return items;
  }
}
