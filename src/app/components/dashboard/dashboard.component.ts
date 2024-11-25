import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { WeatherService, WeatherData, ForecastData } from '../../services/weather.service';
import { PreferencesService, UserPreferences } from '../../services/preferences.service';

// created the interfaces variable types
interface WeatherMetric {
  label: string;
  value: number;
  unit: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: `../dashboard/dashboard.component.html`,
  styleUrls: [`../dashboard/dashboard.component.css`]
})

export class DashboardComponent implements OnInit, OnDestroy {
  private preferencesSubscription?: Subscription; // this managhe the subscription to a user preference
  loading = true;
  //these hold the data for the varioise types
  weatherData: WeatherData[] = [];
  forecastData: ForecastData[] = [];
  weatherMetrics: WeatherMetric[] = [];
  displayedColumns: string[] = ['cityName', 'temperature', 'humidity', 'condition'];
  currentPreferences?: UserPreferences;

  constructor(
    private weatherService: WeatherService,
    private preferencesService: PreferencesService
  ) {}
//loads and initiats component
  ngOnInit(): void {
    this.preferencesSubscription = this.preferencesService.getPreferences()
      .subscribe({
        next: (preferences) => {
          console.log('Received preferences:', preferences);
          this.currentPreferences = preferences;
          if (preferences.cities && preferences.cities.length > 0) {
            this.loadWeatherData(preferences.cities); //this fetsches weather
          } else {
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error loading preferences:', error);
          this.loading = false;
        }
      });
  }
//cleans the resources by unsubing by destryong comp 
  ngOnDestroy(): void {
    if (this.preferencesSubscription) {
      this.preferencesSubscription.unsubscribe();
    }
  }

// fetches weather data for the cities in user preferences
private loadWeatherData(cities: string[]): void {
  this.loading = true;
  console.log('Loading weather for cities:', cities);
  
  const weatherRequests = cities.map(city => 
    this.weatherService.getCurrentWeather(city)
  );

  forkJoin(weatherRequests).subscribe({
    next: (weatherData) => {
      console.log('Weather data loaded:', weatherData);
      this.weatherData = weatherData;
      this.updateMetrics(); //calcs tje metrics
      this.loading = false;
    },
    error: (error) => {
      console.error('Error loading weather data:', error);
      this.loading = false;
    }
  });
}
// updates dashboard
private updateMetrics(): void {
  if (!this.weatherData.length) return;

  const allTemps = this.weatherData.map(w => w.temperature);
  const allHumidity = this.weatherData.map(w => w.humidity);

  this.weatherMetrics = [
    {
      label: 'Highest Temperature',
      value: Math.max(...allTemps),
      unit: '°C'
    },
    {
      label: 'Lowest Temperature',
      value: Math.min(...allTemps),
      unit: '°C'
    },
    {
      label: 'Average Humidity',
      value: Math.round(allHumidity.reduce((a, b) => a + b, 0) / allHumidity.length),
      unit: '%'
    }
  ];
}
}