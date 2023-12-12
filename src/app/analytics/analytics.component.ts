import { Component } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { HttpEvent } from '@angular/common/http';
import { CommonModule, CurrencyPipe, KeyValuePipe } from '@angular/common';
import { SaleItem } from '../shared/models/SaleItem';
import { AnalyticsService } from './analytics.service';
import Papa from 'papaparse';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { DailySales } from '../shared/models/DailySales';
import { SalesType } from '../shared/models/SalesType';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SalesTotals } from '../shared/models/SalesTotals';
import { CardModule } from 'primeng/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

interface UploadEvent {
  originalEvent: HttpEvent<any>;
  files: File[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [ FileUploadModule, ButtonModule, CommonModule, NgxEchartsModule,
    SelectButtonModule, FormsModule, ProgressSpinnerModule, CardModule ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})

export class AnalyticsComponent {
  uploadedFile?: File;
  fileSubmitted = false;
  items: SaleItem[] = [];
  processing = false;

  salesTypeSelected = SalesType.Revenue;
  salesTypeSelectOptions = [ { label: 'Revenue', value: SalesType.Revenue }, { label: 'Units sold', value: SalesType.Units } ];

  salesByDayChartOptions = new Map<SalesType, EChartsOption>();
  cumulativeSalesByDayChartOptions = new Map<SalesType, EChartsOption>();
  salesTotalsChartOptions = new Map<SalesType, EChartsOption>();

  totalRevenue?: number;
  totalUnitsSold?: number;
  totalRefunds?: number;

  salesTypeDisplay = new Map<SalesType, string>([
    [ SalesType.Revenue, 'Revenue' ],
    [ SalesType.Units, 'Units sold' ]
  ])

  constructor(private analyticsService: AnalyticsService) {}

  onFileUpload(event: UploadEvent) {
    this.uploadedFile = event.files[0];
  }

  onContinue() {
    if(!this.uploadedFile) {
      return;
    }

    this.fileSubmitted = true;
    this.processing = true;

    Papa.parse(this.uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const requiredColumns = ['Day', 'Product', 'Base Price', 'Net Units'];
        const actualColumns = results.meta.fields;
        const areAllColumnsPresent = requiredColumns.every(x => {
          return actualColumns?.includes(x)
        });

        if(!areAllColumnsPresent) {
          this.processing = false;
          this.fileSubmitted = false;
          return;
        }

        const data = results.data as any[];
          this.items = data.map(row => ({
            day: row['Day'],
            product: row['Product'],
            basePrice: +(row['Base Price'] as string).slice(1),
            netUnits: +row['Net Units']
          }));
          this.items.pop();
          this.createChartData();
      }
    });
  }

  createChartData() {
    this.analyticsService.setItems(this.items);
    let dailySales = this.analyticsService.getDailySales();
    let salesTotals = this.analyticsService.getSalesTotals();

    this.totalRevenue = salesTotals.getSalesTotals(SalesType.Revenue);
    this.totalUnitsSold = salesTotals.getSalesTotals(SalesType.Units);
    this.totalRefunds = this.analyticsService.getTotalRefunds();

    this.createSalesBarChart(dailySales, SalesType.Revenue);
    this.createSalesBarChart(dailySales, SalesType.Units);

    this.createCumulativeSalesAreaChart(dailySales, SalesType.Revenue);
    this.createCumulativeSalesAreaChart(dailySales, SalesType.Units);

    this.createSalesTotalsPieChart(salesTotals, SalesType.Revenue);
    this.createSalesTotalsPieChart(salesTotals, SalesType.Units);

    this.processing = false;
  }

  private createSalesBarChart(dailySales: DailySales, salesType: SalesType) {
    this.salesByDayChartOptions.set(salesType, {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        textStyle: {
          color: '#fbfbfe'
        }
      },
      grid: {
        bottom: 90
      },
      dataZoom: [
        {
          type: 'inside'
        },
        {
          type: 'slider'
        }
      ],
      xAxis: {
        type: 'category',
        data: this.analyticsService.allDays
      },
      yAxis: {
        type: 'value'
      },
      series: this.analyticsService.allProducts.map(x => ({
        name: x,
        type: 'bar',
        stack: 'total',
        label: {
          show: false
        },
        emphasis: {
          focus: 'series'
        },
        data: dailySales.getProductSales(x, salesType)?.map(x => this.formatValue(x, salesType)),
        large: true
      }))
    })
  }

  private createCumulativeSalesAreaChart(dailySales: DailySales, salesType: SalesType) {
    this.cumulativeSalesByDayChartOptions.set(salesType, {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        textStyle: {
          color: '#fbfbfe'
        }
      },
      grid: {
        bottom: 90
      },
      dataZoom: [
        {
          type: 'inside'
        },
        {
          type: 'slider'
        }
      ],
      xAxis: {
        type: 'category',
        data: this.analyticsService.allDays
      },
      yAxis: {
        type: 'value',
      },
      series: this.analyticsService.allProducts.map(x => ({
        name: x,
        type: 'line',
        stack: 'total',
        areaStyle: {},
        showSymbol: false,
        label: {
          show: false
        },
        emphasis: {
          focus: 'series'
        },
        data: dailySales.getCumulativeProductSales(x, salesType)?.map(x => this.formatValue(x, salesType)),
        large: true
      }))
    });
  }

  private createSalesTotalsPieChart(salesTotals: SalesTotals, salesType: SalesType) {
    this.salesTotalsChartOptions.set(salesType, {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        left: 'center',
        textStyle: {
          color: '#fbfbfe'
        }
      },
      series: [
        {
          name: 'Total',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          labelLine: {
            show: false
          },
          data: salesTotals.getSalesTotalsForProducts(salesType).map(([product, value]) => ({
            name: product,
            value: this.formatValue(value, salesType)
          }))
        }
      ]
    });
  }

  private formatValue(item: number, salesType: SalesType) {
    return +(salesType == SalesType.Revenue ? item.toFixed(2) : item);
  }
}
