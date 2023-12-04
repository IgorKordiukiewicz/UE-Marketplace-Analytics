import { SalesType } from "./SalesType";

export class Sales {
  private salesByProduct: Map<string, Map<SalesType, number[]>>;

  constructor(allProducts: string[]) {
    this.salesByProduct = new Map<string, Map<SalesType, number[]>>(
      allProducts.map(x => [x, new Map([
        [ SalesType.Revenue, [] ],
        [ SalesType.Units, [] ],
      ])]));
  }

  addProductSales(product: string, revenue: number, units: number) {
    const productSales = this.salesByProduct.get(product);
    if(!productSales) {
      return;
    }

    productSales.set(SalesType.Revenue, [...productSales.get(SalesType.Revenue)!, revenue]);
    productSales.set(SalesType.Units, [...productSales.get(SalesType.Units)!, units]);

    this.salesByProduct.set(product, productSales);
  }

  getProductSales(product: string, type: SalesType) {
    return this.salesByProduct.get(product)?.get(type);
  }
}
