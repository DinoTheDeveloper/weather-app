# Costandino - Weather App
This weather app that i created uses an api from OpenWeatherMap, and a user has a dashboard with a selected city showcasing its weather. A user is also able to go to the prefernces tab and customise their choice. 

# Angular version
Please note this is built with Angular v19.

## Setup
1. Please install dependencies:
```bash
npm install
```
1.2. Install the chart.js
```
npm install chart.js
```

2. then go and get an API Key:
- I used Open Weather Map so go to [OpenWeatherMap](https://openweathermap.org/api)
- Copy the API key and put in environments component

3. Add your API key:
- Create `environment.ts` in `src/environments`
- Add this code:
```typescript
export const environment = {
  production: false,
  weatherApiKey: 'the api key',
  weatherApiUrl: 'https://api.openweathermap.org/data/2.5'
};
```

4. Run the app:
```bash
ng serve
```

5. Open `http://localhost:4200` 

## Features
- View weather for a city or multiple cities
- customisable dashboard
- It can also have temperature and humidity tracking
- and weather forecast charts

## Built With
- Angular 19.0.0
- Angular Material
- Chart.js
- OpenWeatherMap API