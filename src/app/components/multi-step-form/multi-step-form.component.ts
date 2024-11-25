import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { WeatherService } from '../../services/weather.service';
import { PreferencesService, UserPreferences } from '../../services/preferences.service';

//this is the options for the metrics
interface MetricOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-multi-step-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatRadioModule,
    MatCardModule,
    MatAutocompleteModule,
    MatIconModule,
    MatIconModule
  ],
  templateUrl: `../multi-step-form/multi-step-form.component.html`,
  styleUrls: [`../multi-step-form/multi-step-form.component.css`]
})
export class MultiStepFormComponent implements OnInit {
  //form for the prefernces
  preferenceForm: FormGroup;
  selectedCities: string[] = [];//holds tje city selected data
  cityControl = new FormControl(''); //city inpute contorl
  filteredCities: Observable<string[]>;//city filter list

  //the metrics added thta a user can select
  availableMetrics = [
    { label: 'Temperature', value: 'temperature' },
    { label: 'Humidity', value: 'humidity' },
    { label: 'Wind Speed', value: 'windSpeed' },
    { label: 'Condition', value: 'condition' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private weatherService: WeatherService,
    private preferencesService: PreferencesService,
    private router: Router
  ) {
    // initialises the preference form with values and validators
    this.preferenceForm = this.formBuilder.group({
      cities: [[], [Validators.required]],
      metrics: [[], [Validators.required]],
      layout: ['table', Validators.required],
      chartType: ['line', Validators.required]
    });

    // like an autocomplete for the city filtereing
    this.filteredCities = this.cityControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCities(value || ''))
    );
  }
//user input filters for the autocomplete
  private _filterCities(value: string): string[] {
    const filterValue = value.toLowerCase();
    const cities = ['Johannesburg, ZA',
      'Republic of Cyprus, CY',
      'Hellenic Republic, GR',
      'Republic of Malta, MT',
      'London, UK'];
    return cities.filter(city => city.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    // Load existing preferences
    this.preferencesService.getPreferences().subscribe(prefs => {
      if (prefs) {
        this.selectedCities = prefs.cities || [];
        this.preferenceForm.patchValue({
          cities: prefs.cities,
          metrics: prefs.metrics,
          layout: prefs.layout,
          chartType: prefs.chartType
        });
      }
    });
  }
  //this handles adding the cities from the automcplete
  onCitySelected(event: any): void {
    const city = event.option.value;
    if (!this.selectedCities.includes(city)) {
      this.selectedCities = [...this.selectedCities, city];
      this.preferenceForm.patchValue({
        cities: this.selectedCities
      });
      console.log('Updated selected cities:', this.selectedCities);
    }
  }
  //this adds or removes metrics based off the users interaction
  onMetricChange(event: { checked: boolean }, metricValue: string): void {
    const currentMetrics = this.preferenceForm.get('metrics')?.value as string[] || [];
    if (event.checked) {
      currentMetrics.push(metricValue);
    } else {
      const index = currentMetrics.indexOf(metricValue);
      if (index > -1) {
        currentMetrics.splice(index, 1);
      }
    }
    this.preferenceForm.patchValue({ metrics: currentMetrics });
  }

  //this returns the string bases on metric lables
  //and is also comma seperated
  getMetricLabels(values: string[]): string {
    if (!values) return '';
    return this.availableMetrics
      .filter(m => values.includes(m.value))
      .map(m => m.label)
      .join(', ');
  }
//remocves cities from the selected list
  removeCity(city: string): void {
    this.selectedCities = this.selectedCities.filter(c => c !== city);
    this.preferenceForm.patchValue({
      cities: this.selectedCities
    });
    console.log('Updated selected cities:', this.selectedCities);
  }
//this submists and saves the preferences
  onSubmit(): void {
    if (this.preferenceForm.valid) {
      console.log('Form submitted with cities:', this.selectedCities);
      const preferences: UserPreferences = {
        cities: this.selectedCities,
        metrics: this.preferenceForm.get('metrics')?.value || [],
        layout: this.preferenceForm.get('layout')?.value,
        chartType: this.preferenceForm.get('chartType')?.value
      };

      console.log('Saving preferences:', preferences);
      this.preferencesService.updatePreferences(preferences).subscribe({
        next: () => {
          console.log('Preferences saved successfully');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error saving preferences:', error);
        }
      });
    } else {
      console.log('Form is invalid:', this.preferenceForm.errors);
    }
  }
}