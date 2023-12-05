import { Injectable } from '@angular/core';
import { SaleItem } from '../shared/models/SaleItem';
import { DailySales } from '../shared/models/DailySales';
import { SalesType } from '../shared/models/SalesType';


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
    let salesTotals = new Map<SalesType, [string, number][]>();

    let totalRevenues: [string, number][] = [];
    let totalUnitsSold: [string, number][] = [];
    for(let product of this.allProducts) {
      let allProductItems = this.items.filter(x => x.product === product);
      let totalUnits = allProductItems.reduce((sum, item) => sum + item.netUnits, 0);
      let totalRevenue = allProductItems.reduce((sum, item) => sum + (item.basePrice * item.netUnits), 0);
      totalRevenues.push([product, totalRevenue]);
      totalUnitsSold.push([product, totalUnits]);
    }

    salesTotals.set(SalesType.Revenue, totalRevenues);
    salesTotals.set(SalesType.Units, totalUnitsSold);
    return salesTotals;
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
