import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Card } from 'react-bootstrap';
import './Weather.css'; // Import custom styles

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  timezone: number; // Timezone offset in seconds
}

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [city, setCity] = useState<string>('Cape Town');
  const [backgroundClass, setBackgroundClass] = useState<string>('morning'); // Default background

  const fetchWeather = async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching weather for ${city}`);
      const response = await axios.get<WeatherData>(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=18d28c1373b0c77e815a0ead0aea61ad`
      );
      console.log('Weather data:', response.data);
      setWeather(response.data);
      updateBackground(response.data);
    } catch (err: any) {
      setError('Failed to fetch weather data. Please check the city name.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchWeather(city);
  };

  // Function to update background based on city time
  const updateBackground = (data: WeatherData) => {
    const timezoneOffset = data.timezone; // Timezone offset in seconds
    const localTime = new Date(Date.now() + timezoneOffset * 1000);
    const hours = localTime.getUTCHours();

    if (hours >= 6 && hours < 12) {
      setBackgroundClass('morning');
    } else if (hours >= 12 && hours < 18) {
      setBackgroundClass('afternoon');
    } else if (hours >= 18 && hours < 21) {
      setBackgroundClass('evening');
    } else {
      setBackgroundClass('night');
    }
  };

  return (
    <Container className={`weather-container ${backgroundClass}`}>
      <h2 className="text-center mb-4">🌤️ Weather App</h2>
      <Form onSubmit={handleSearch} className="weather-form">
        <Form.Group controlId="formCity">
          <Form.Control
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-field"
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="search-btn">
          Search
        </Button>
      </Form>

      {loading && <div className="text-center loading-text">Loading...</div>}
      {error && <div className="text-center error-text">{error}</div>}
      {weather && (
        <Card className="weather-card">
          <Card.Body>
            <Card.Title className="text-center weather-title">
              Weather in {weather.name}
            </Card.Title>
            <div className="text-center">
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="weather-icon"
              />
              <p className="weather-temp">{(weather.main.temp - 273.15).toFixed(2)}°C</p>
              <p className="weather-desc text-capitalize">{weather.weather[0].description}</p>
              <p className="weather-info">Humidity: {weather.main.humidity}%</p>
              <p className="weather-info">Wind Speed: {weather.wind.speed} m/s</p>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Weather;
