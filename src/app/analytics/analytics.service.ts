import { Injectable } from '@angular/core';
import { SaleItem } from '../shared/models/SaleItem';
import Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private items: SaleItem[] = [];
  allProducts: string[] = [];
  allDays: string[] = [];

  constructor() { }

  setItems(items: SaleItem[]) {
    this.items = items;
    this.allProducts = this.getAllProducts();
    this.allDays = this.getAllDays();
  }

  getSalesData(items: SaleItem[]) {
    // <product, [revenues[], units[]]>
    let revenueByProduct = new Map<string, [number[], number[]]>(this.allProducts.map(x => [x, [[],[]]]));

    for(let day of this.allDays) {
      for(let product of this.allProducts) {
        const item = items.find(x => x.day === day && x.product === product);

        let revenue = 0;
        let units = 0;
        if(item) {
          revenue = item.basePrice * item.netUnits;
          units = item.netUnits;
        }

        const dailySales = revenueByProduct.get(product)!;
        dailySales[0].push(revenue);
        dailySales[1].push(units);
        revenueByProduct.set(product, dailySales);
      }
    }

    return revenueByProduct;
  }

  private getAllProducts() {
    return Array.from(new Set(this.items.map(x => x.product)));
  }

  private getAllDays() {
    if(this.items.length == 0) {
      return [];
    }

    const allDays: string[] = [];

    let currentDate = new Date(this.items.at(-1)!.day);
    const endDate = new Date(this.items[0].day);

    while(currentDate <= endDate) {
      allDays.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return allDays;
  }
}
