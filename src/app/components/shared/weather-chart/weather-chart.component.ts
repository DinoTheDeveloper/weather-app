import { Component, Input, OnChanges, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { ForecastData } from '../../../services/weather.service';
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-weather-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `]
})
export class WeatherChartComponent implements OnChanges {
  //inputs the data for the chart
  @Input() data: ForecastData[] = [];
  @Input() chartType: 'line' | 'bar' = 'line';//chart type
  //this references the char canvas elements
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  
  private chart?: Chart; //i createed an instance for the char using the chart.js


  //this just detects the changes for the inputs and updates it
  ngOnChanges(changes: SimpleChanges) {
    if ((changes['data'] || changes['chartType']) && this.chartCanvas) {
      this.updateChart();
    }
  }
//this handles the updating and creation
  private updateChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    //get the canva context
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    
    const config: ChartConfiguration = {
      //sets chart type
      type: this.chartType,
      data: {
        //uses data as the labels
        labels: this.data.map(d => d.date),
        datasets: [{
          label: 'Temperature (°C)',
          data: this.data.map(d => d.temperature),
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 2,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Temperature Forecast'
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Temperature (°C)'
            }
          }
        }
      }
    };
//this creates the charts
    this.chart = new Chart(ctx, config);
  }
}