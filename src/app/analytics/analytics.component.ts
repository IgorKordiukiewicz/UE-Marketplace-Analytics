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

interface UploadEvent {
  originalEvent: HttpEvent<any>;
  files: File[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [ FileUploadModule, ButtonModule, CommonModule, NgxEchartsModule, SelectButtonModule, FormsModule ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})

export class AnalyticsComponent {
  uploadedFile?: File;
  fileSubmitted = false;
  items: SaleItem[] = [];

  salesTypeSelected = SalesType.Revenue;
  salesTypeSelectOptions = [ { label: 'Revenue', value: SalesType.Revenue }, { label: 'Units', value: SalesType.Units } ];

  salesByDayChartOptions = new Map<SalesType, EChartsOption>();
  cumulativeSalesByDayChartOptions = new Map<SalesType, EChartsOption>();
  salesTotalsChartOptions = new Map<SalesType, EChartsOption>();

  constructor(private analyticsService: AnalyticsService) {}

  onFileUpload(event: UploadEvent) {
    this.uploadedFile = event.files[0];
  }

  onContinue() {
    if(!this.uploadedFile) {
      return;
    }

    Papa.parse(this.uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
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

    this.fileSubmitted = true;
  }

  createChartData() {
    this.analyticsService.setItems(this.items);
    let dailySales = this.analyticsService.getDailySales(this.items);
    let salesTotals = this.analyticsService.getSalesTotals(this.items);

    this.createSalesBarChart('Revenue per day', dailySales, SalesType.Revenue);
    this.createSalesBarChart('Units sold per day', dailySales, SalesType.Units);

    this.createCumulativeSalesAreaChart('Cumulative revenue per day', dailySales, SalesType.Revenue);
    this.createCumulativeSalesAreaChart('Cumulative units sold per day', dailySales, SalesType.Units);

    this.createSalesTotalsPieChart('Total revenue', salesTotals, SalesType.Revenue);
    this.createSalesTotalsPieChart('Total units sold', salesTotals, SalesType.Units);
  }

  private createSalesBarChart(title: string, dailySales: DailySales, salesType: SalesType) {
    this.salesByDayChartOptions.set(salesType, {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: '#fbfbfe'
        },
        show: false
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        textStyle: {
          color: '#fbfbfe'
        },
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
        data: dailySales.getProductSales(x, salesType),
        large: true
      }))
    })
  }

  private createCumulativeSalesAreaChart(title: string, dailySales: DailySales, salesType: SalesType) {
    this.cumulativeSalesByDayChartOptions.set(salesType, {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: '#fbfbfe'
        },
        show: false
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        textStyle: {
          color: '#fbfbfe'
        },
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
        data: dailySales.getCumulativeProductSales(x, salesType),
        large: true
      }))
    });
  }

  private createSalesTotalsPieChart(title: string, salesTotals: Map<SalesType, [string, number][]>, salesType: SalesType) {
    this.salesTotalsChartOptions.set(salesType, {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: '#fbfbfe'
        }
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '7%',
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
          emphasis: {
            label: {
              show: true,
              fontSize: 30,
              fontWeight: 'bold',
              color: '#fbfbfe'
            }
          },
          labelLine: {
            show: false
          },
          data: salesTotals.get(salesType)!.map(([product, value]) => ({
            name: product,
            value: value
          }))
        }
      ]
    });
  }
}
