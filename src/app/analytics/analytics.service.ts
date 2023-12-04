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

  getRevenueData(items: SaleItem[]) {
    let revenueByProduct = new Map<string, number[]>(this.allProducts.map(x => [x, []]));

    for(let day of this.allDays) {
      for(let product of this.allProducts) {
        const item = items.find(x => x.day === day && x.product === product);

        let revenue = 0;
        if(item) {
          revenue = item.basePrice * item.netUnits;
        }

        const dailyRevenues = revenueByProduct.get(product)!;
        dailyRevenues.push(revenue);
        revenueByProduct.set(product, dailyRevenues);
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
