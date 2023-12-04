import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import {
  CanvasRenderer
} from 'echarts/renderers';

echarts.use(
  [TitleComponent, TooltipComponent, GridComponent,
    LegendComponent, BarChart, CanvasRenderer]
);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(NgxEchartsModule.forRoot({ echarts }))
  ]
};
