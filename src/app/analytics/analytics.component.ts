import { Component } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { HttpEvent } from '@angular/common/http';
import Papa from 'papaparse';

interface UploadEvent {
  originalEvent: HttpEvent<any>;
  files: File[];
}

interface SaleItem {
  day: string;
  product: string;
  basePrice: number;
  netUnits: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [ FileUploadModule, ButtonModule ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})

export class AnalyticsComponent {
  uploadedFile?: File;
  items: SaleItem[] = [];

  onFileUpload(event: UploadEvent) {
    this.uploadedFile = event.files[0];
  }

  createModel() {
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
          basePrice: row['Base Price'],
          netUnits: row['Net Units']
        }));
        this.items.pop();
      }
    });
  }
}
