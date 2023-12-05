import { SaleItem } from "./SaleItem";
import { SalesType } from "./SalesType";

export class SalesTotals {
  private salesTotalsForProducts = new Map<SalesType, [string, number][]>();

  constructor(allProducts: string[], items: SaleItem[]) {
    let totalRevenues: [string, number][] = [];
    let totalUnitsSold: [string, number][] = [];
    for(let product of allProducts) {
      let allProductItems = items.filter(x => x.product === product);
      let totalUnits = allProductItems.reduce((sum, item) => sum + item.netUnits, 0);
      let totalRevenue = allProductItems.reduce((sum, item) => sum + (item.basePrice * item.netUnits), 0);
      totalRevenues.push([product, totalRevenue]);
      totalUnitsSold.push([product, totalUnits]);
    }

    this.salesTotalsForProducts.set(SalesType.Revenue, totalRevenues);
    this.salesTotalsForProducts.set(SalesType.Units, totalUnitsSold);
  }

  getSalesTotalsForProducts(salesType: SalesType) {
    return this.salesTotalsForProducts.get(salesType)!;
  }

  getSalesTotals(salesType: SalesType) {
    return this.salesTotalsForProducts.get(salesType)!.reduce((sum, item) => sum + item[1], 0);
  }
}
