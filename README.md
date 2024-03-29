# Weather

## About
I wrote this to fill a need to quickly view recent historical trends regarding the weather. Originally the focus of the application was to view barometric pressure but was expanded to include other metrics.

I converted the project to Preact in 2023, migrating away from Knockout.js.

## Usage
Load https://parkrrr.github.io/weather/ into your mobile browser of choice. The design is mobile-first so it may be weird to use on a desktop.

Locations are referenced by airports. To change the airport, click the ICAO code of the airport (defaults to 'KTYQ') and enter a new airport code (such as KDEN, KJFK, KLAX, etc).

## Data
This application uses data provided by the [National Weather Service](https://www.weather.gov/documentation/services-web-api). There is no server-side component, all data is fetched from the browser.

## Preview
![image](https://github.com/parkrrr/weather/assets/393737/673567db-7f57-4866-b156-a61c0cea7926)

