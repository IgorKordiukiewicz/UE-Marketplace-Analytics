import { Component } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { HttpEvent } from '@angular/common/http';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { SaleItem } from '../shared/models/SaleItem';
import { AnalyticsService } from './analytics.service';
import Papa from 'papaparse';
import { EChartsOption, BarSeriesOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

interface UploadEvent {
  originalEvent: HttpEvent<any>;
  files: File[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [ FileUploadModule, ButtonModule, CommonModule, NgxEchartsModule ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})

export class AnalyticsComponent {
  uploadedFile?: File;
  fileSubmitted = false;
  items: SaleItem[] = [];

  salesByDayChartOptions: EChartsOption[] = [];

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
    let allProducts = this.analyticsService.allProducts;
    let salesByProduct = this.analyticsService.getSalesData(this.items);

    this.createSalesBarChart('Revenue per day', salesByProduct, 0);
    this.createSalesBarChart('Unit sold per day', salesByProduct, 1);
  }

  private createSalesBarChart(title: string, salesByProduct: Map<string, [number[], number[]]>, salesDataIndex: number) {
    this.salesByDayChartOptions.push({
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
        data: salesByProduct.get(x)![salesDataIndex]
      }))
    })
  }
}
