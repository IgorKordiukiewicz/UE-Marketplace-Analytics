import { Injectable } from '@angular/core';
import { SaleItem } from '../shared/models/SaleItem';
import { DailySales } from '../shared/models/DailySales';
import { SalesType } from '../shared/models/SalesType';
import { SalesTotals } from '../shared/models/SalesTotals';


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

  getDailySales(items: SaleItem[]) {
    let sales = new DailySales(this.allProducts);

    for(let day of this.allDays) {
      for(let product of this.allProducts) {
        const item = items.find(x => x.day === day && x.product === product);

        let revenue = 0;
        let units = 0;
        if(item) {
          revenue = item.basePrice * item.netUnits;
          units = item.netUnits;
        }

        sales.addProductSales(product, revenue, units);
      }
    }

    return sales;
  }

  getSalesTotals(items: SaleItem[]) {
    return new SalesTotals(this.allProducts, items);
  }

  getTotalRefunds(items: SaleItem[]) {
    return items.filter(x => x.netUnits < 0).reduce((sum, item) => sum + item.netUnits, 0) * -1;
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
