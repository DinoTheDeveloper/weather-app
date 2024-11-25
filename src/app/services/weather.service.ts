import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

//i define the data structures here
export interface WeatherData {
  cityName: string;
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
}
//same with this but for the forecase data
export interface ForecastData {
  date: string;
  temperature: number;
  condition: string;
}

//this just allows the service to be available globbaly
@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  //this gets the api key
  private apiKey = environment.weatherApiKey;
  private baseUrl = environment.weatherApiUrl;

  //this enables the api requests
  constructor(private http: HttpClient) {}

  getCurrentWeather(city: string): Observable<WeatherData> {
    //this creates the api endpoint url for current weather
    const url = `${this.baseUrl}/weather?q=${city}&units=metric&appid=${this.apiKey}`;

    //this created the get requests and transforms the response
    return this.http.get(url).pipe(
      map((response: any) => ({
        cityName: response.name,
        temperature: Math.round(response.main.temp),
        humidity: response.main.humidity,
        condition: response.weather[0].main,
        windSpeed: response.wind.speed
      })),
      //created this to handle the errors which then returns the default weather data
      catchError(error => {
        console.error('Error fetching weather:', error);
        return of({
          cityName: city,
          temperature: 0,
          humidity: 0,
          condition: 'Error',
          windSpeed: 0
        });
      })
    );
  }
//this fetches the weather and forcast data for the city
  getForecast(city: string): Observable<ForecastData[]> {
    //created endpoint for the api endpoint
    const url = `${this.baseUrl}/forecast?q=${city}&units=metric&appid=${this.apiKey}`;


    //this makes the get request and transforms teh response
    return this.http.get(url).pipe(
      //maps the reponse to an array
      map((response: any) => {
        return response.list
        //filters for forecasets only for 12pm 
          .filter((reading: any) => reading.dt_txt.includes('12:00:00'))
          //this maps each reading to the data forcast
          .map((reading: any) => ({
            date: new Date(reading.dt_txt).toLocaleDateString(),
            temperature: Math.round(reading.main.temp),
            condition: reading.weather[0].main
          }));
      }),
      //and created this to handle the error and returns an empty array
      catchError(error => {
        console.error('Error fetching forecast:', error);
        return of([]);
      })
    );
  }
// this searches for cities that match the strings
  searchCities(query: string): Observable<string[]> {
    // these are the places i created for the assessment
    const mockCities = [
      'Johannesburg, ZA',
      'Republic of Cyprus, CY',
      'Hellenic Republic, GR',
      'Republic of Malta, MT',
      'London, UK'
    ];
    
    return of(mockCities.filter(city => 
      city.toLowerCase().includes(query.toLowerCase())
    ));
  }
}