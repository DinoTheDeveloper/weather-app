import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

//defines the usr preferences
export interface UserPreferences {
  cities: string[];
  metrics: string[];
  //changes on the usrs prefered choice or laout
  layout: 'table' | 'card';
  chartType: 'line' | 'bar';
}

@Injectable({
  //just makes this service available globaly
  providedIn: 'root'
})
export class PreferencesService {
  //added the key to store in a local storage
  private readonly STORAGE_KEY = 'weather_preferences';
  
  //these are the default preferences to fall back on if no saved preferences exist
  //i put jhb as i live here
  private defaultPreferences: UserPreferences = {
    cities: ['Johannesburg, ZA'],
    metrics: ['temperature', 'humidity'],
    layout: 'table',
    chartType: 'line'
  };

  //manages and observes thee changes in thr user preferences
  private preferencesSubject = new BehaviorSubject<UserPreferences>(this.defaultPreferences);

  constructor() {
    //initialises and loads saved preferences
    this.loadPreferences();
  }

   
  //this loads preferences from localStorage or goes with the default preferences i created
  private loadPreferences(): void {
    try {
      const savedPrefs = localStorage.getItem(this.STORAGE_KEY);
      if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        console.log('Loaded preferences:', parsedPrefs);

        this.preferencesSubject.next(parsedPrefs);
      } else {
        console.log('No saved preferences, using defaults');
        this.preferencesSubject.next(this.defaultPreferences);
      }
    } catch (error) {

      console.error('Error loading preferences:', error);
      this.preferencesSubject.next(this.defaultPreferences);
    }
  }
//returns an observable of the current user preferences.
  getPreferences(): Observable<UserPreferences> {
    return this.preferencesSubject.asObservable();
  }

  //updates user preferences and saves them to localStorage.
  updatePreferences(preferences: UserPreferences): Observable<void> {
    return new Observable(subscriber => {
      try {
        console.log('Updating preferences:', preferences);
        // validates the preferences
        const validPreferences: UserPreferences = {
          cities: preferences.cities || this.defaultPreferences.cities,
          metrics: preferences.metrics || this.defaultPreferences.metrics,
          layout: preferences.layout || this.defaultPreferences.layout,
          chartType: preferences.chartType || this.defaultPreferences.chartType
        };

        //saves the valid perefences to the local storage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validPreferences));
        this.preferencesSubject.next(validPreferences);
        //this then notifes in the log of the prefs being updated and emits and completes
        console.log('Preferences updated successfully');
        subscriber.next();
        subscriber.complete();
      } catch (error) {
        //if it doesnt work it will emit and error
        console.error('Error saving preferences:', error);
        subscriber.error(error);
      }
    });
  }

  //this clears the user preferences from localStorage and resets to the default
  clearPreferences(): void {
    console.log('Clearing preferences');
    localStorage.removeItem(this.STORAGE_KEY);
    this.preferencesSubject.next(this.defaultPreferences);
  }
}