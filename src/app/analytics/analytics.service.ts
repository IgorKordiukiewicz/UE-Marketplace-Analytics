import { Injectable } from '@angular/core';
import { SaleItem } from '../shared/models/SaleItem';
import Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor() { }

  getRevenueData(items: SaleItem[]) {
    let result = new Map<string, [string, number][]>();

    console.log(items.length);
    for(let item of items) {
      console.log(item);
      if(!result.has(item.day)) {
        const array: [string, number][] = [ [item.product, item.basePrice * item.netUnits] ];
        result.set(item.day, array);
      }
      else {
        const current = result.get(item.day)!;
        current.push([item.product, item.basePrice * item.netUnits]);
        result.set(item.day, current);
      }
    }

    return result;
  }
}
