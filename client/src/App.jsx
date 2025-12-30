import React from "react";

export default function App() {
  const [city, setCity] = React.useState("");
  const [location, setLocation] = React.useState([]);
  const [climate, setClimate] = React.useState(null);

  const [state, setState] = React.useState([]); // favourites from backend
  const [favlocation, setFavLocation] = React.useState([]);
  const [fetchFavourite, setFetchFavourite] = React.useState([]);

  const [typeofWeather, setTypeofWeather] = React.useState("");

 const API_KEY = process.env.REACT_APP_OPENWEATHER_KEY;


  const getWeather = async () => {
    const res = await fetch("/api/weather");
    const weather = await res.json();
    setState(weather);
  };

  React.useEffect(() => {
    getWeather();
  }, []);

  const coordiNates = () => {
    if (!city) return;

    fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) setLocation(data);
      });
  };

  const lat = location[0]?.lat;
  const lon = location[0]?.lon;

  React.useEffect(() => {
    if (!lat || !lon) return;

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=ce69fa716d4e8918e94121da2f0250ee`
    )
      .then((res) => res.json())
      .then((data) => setClimate(data));
  }, [lat, lon]);

  React.useEffect(() => {
    if (!climate) return;

    const { dt } = climate;
    const { sunrise, sunset } = climate.sys;
    const main = climate.weather[0].main;

    const isDay = dt >= sunrise && dt < sunset;
    const day = isDay ? "morning" : "night";

    setTypeofWeather(getCurrentWeather(main, day));
  }, [climate]);

  const handleFavourite = async (e) => {
    e.preventDefault();
    if (!city) return;

    await fetch("/api/weather", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ city }),
    });

    setCity("");
    setClimate('')
    getWeather();
  };

  const deleteCity = async (id) => {
    await fetch(`/api/weather/${id}`, { method: "DELETE" });
    getWeather();
  };

  React.useEffect(() => {
    if (!state.length) {
      setFavLocation([]);
      setFetchFavourite([]);
      return;
    }

    setFavLocation([]);

    state.forEach((fav) => {
      fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${fav.city}&limit=1&appid=ce69fa716d4e8918e94121da2f0250ee`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            setFavLocation((prev) => [...prev, { ...data[0], _id: fav._id }]);
          }
        });
    });
  }, [state]);

  React.useEffect(() => {
    if (!favlocation.length) return;

    Promise.all(
      favlocation.map(async (fav) => {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${fav.lat}&lon=${fav.lon}&units=metric&appid=ce69fa716d4e8918e94121da2f0250ee`
        );
        const data = await res.json();
        return processWeatherData({ ...data, _id: fav._id });
      })
    ).then(setFetchFavourite);
  }, [favlocation]);

  function processWeatherData(data) {
    const { dt } = data;
    const { sunrise, sunset } = data.sys;
    const main = data.weather[0].main;

    const isDay = dt >= sunrise && dt < sunset;
    const day = isDay ? "morning" : "night";

    return {
      ...data,
      day,
      currentWeather: getCurrentWeather(main, day),
    };
  }

  function getCurrentWeather(main, day) {
    const m = main.toLowerCase();

    if (day === "morning") {
      if (m === "clear" || m === "few clouds") return "sun_fewcloud.png";
      if (m === "clouds") return "sun_cloud.png";
      if (m === "rain" || m === "drizzle") return "sun_drizzle.png";
      if (m === "thunderstorm") return "sun_darkcloud_rain.png";
      return "sun.png";
    } else {
      if (m === "clear" || m === "few clouds") return "moon_fewcloud.png";
      if (m === "clouds") return "moon_cloud.png";
      if (m === "rain" || m === "drizzle") return "moon_cloud_rain.png";
      if (m === "thunderstorm") return "moon_cloud_thunder.png";
      return "moon.png";
    }
  }

  return (
    <>
      <div className="nav">
        <img
          src="https://see.fontimg.com/api/rf5/woBYn/ZjY0MjU1ZTI2Y2M5NGY2YWEyYzYzNWI3ZTEyM2E5OTgudHRm/V2VhdGhhcmlh/mountain-king-regular.png?r=fs&h=73&w=1000&fg=000000&bg=FFFDFD&tb=1&s=73"
          alt="header"
          width="17%"
          height="50px"
        />

        <div className="search-bar">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city..."
          />
          <button onClick={coordiNates}>Search</button>
        </div>
      </div>

      {!climate && fetchFavourite.length === 0 && (
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: "1rem",
            background: "linear-gradient(135deg, #eef2f3, #ffffff)",
            borderRadius: "16px",
            margin: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: "#333",
              letterSpacing: "0.5px",
            }}
          >
            🌤️ Search for a city
          </h2>

          <p
            style={{
              fontSize: "1.5rem",
              color: "#666",
              maxWidth: "420px",
              lineHeight: "1.6",
            }}
          >
            Enter a city name above to get real-time weather updates,
            temperature, humidity, and wind details.
          </p>
        </div>
      )}

      {climate && (
        <div className="container">
          <img src={typeofWeather} className="weather-img" width="500px" />
          <div className="weather-details">
            <h1>{climate.name}</h1>
            <h3>{climate.weather[0].main}</h3>
            <h3>Temperature: {climate.main.temp}° Celcius</h3>
            <h3>Wind Speed: {climate.wind.speed} m/s</h3>
            <h3>Humidity: {climate.main.humidity}%</h3>

            {state.some(
              (f) =>
                f.city.toLowerCase() === climate.name.toLowerCase()
            ) ? (
              <button
                className="delete-btn"
                onClick={() =>
                  deleteCity(
                    state.find(
                      (f) =>
                        f.city.toLowerCase() ===
                        climate.name.toLowerCase()
                    )._id
                  )
                }
              >
                Delete Now
              </button>
            ) : (
              <button className="add-btn" onClick={handleFavourite}>
                Add Now
              </button>
            )}
          </div>
        </div>
      )}

      {fetchFavourite.map((fav) => (
        <div key={fav._id} className="container">
          <img src={fav.currentWeather} className="weather-img" width="500px" />
          <div className="weather-details">
            <h1>{fav.name}</h1>
            <h3>{fav.weather[0].main}</h3>
            <h3>Temp: {fav.main.temp}°C</h3>
            <h3>Wind: {fav.wind.speed} m/s</h3>
            <h3>Humidity: {fav.main.humidity}%</h3>

            <button
              className="delete-btn"
              onClick={() => deleteCity(fav._id)}
            >
              Delete Now
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
