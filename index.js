// INMUTABLE VARIABLES
const API_KEY = 'API_KEY';
const limit = 5;
let actualCities;
let highlightedIndex = -1;

// DOM VARIABLES
const requestedCity = document.getElementById('city');
const searchCityBtn = document.getElementById('search');
const dataSuggestions = document.querySelector('.data');
const suggestions = document.getElementById('cities-auto');

// Allows users its geolocalization
function geolocalization() {
  let currentPosition = [];
  const geoLo = navigator.geolocation;
  if (geoLo) {
    geoLo.getCurrentPosition((pos) => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
      weather(latitude, longitude);
    }, () => {
      console.warn("Location disabled, please enable to watch results.");
    }
    )
    return currentPosition;
  } else {
    throw new Error("We are sorry, your navigator does not support geolocalization API.");
  }
}

/**
 * Function compiles user data and then call function 'cities' with user input as parameter
 */
function userInput() {
  let userInput = requestedCity.value.toLowerCase().trim();
  if (!userInput) {
    console.info('Waiting city...');
  }
  cities(userInput);
}


// STARTS SERVER REQUEST
/**
 * This function makes request to the server, response is used as parameter when it calls 'showingSuggestions', also, assign the response first value to a global variable.
 * @param {string} cityName : name of the searched city.
 */
async function cities(cityName) {
  try {
    const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${limit}&appid=${API_KEY}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "No se pudo encontrar la ciudad.");
    }
    const cityname = await response.json();
    showingSuggestions(cityname);
    actualCities = cityname[0];
  } catch (err) {
    console.error('Error al obtener datos la ciudad.', err);
  }
}

/**
 * This function makes a request to the server, response is used as parameter when it calls 'show'
 * @param {number} lat : latituted obtained from the selected city
 * @param {number} lon : longitude obtained from the selected city
 */
async function weather(lat, lon) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'No se pudo obtener el clima');
    }

    const city = await response.json();
    show(city);
    highlightedIndex = -1;
  } catch (err) {
    console.error('Error al obtener los datos del clima', err);
  }
}
// ENDS SERVERS REQUEST

/**
 * This function display suggestions of cities to be searched for
 * @param {object} data : object obtained at 'cities'
 */
function showingSuggestions(data) {
  suggestions.innerHTML = '';
  data.forEach((obj, index) => {
    let latitude = obj.lat;
    let longitude = obj.lon;
    let stateText = obj.state ? `${obj.state.toUpperCase()}` : '';

    let li = document.createElement('li');
    li.dataset.index = index;
    li.dataset.lat = latitude;
    li.dataset.lon = longitude;
    li.tabIndex = 0;
    li.textContent = `${obj.name}, ${stateText}, ${obj.country}`;
    li.addEventListener('click', (e) => {
      weather(latitude, longitude);
    });
    suggestions.appendChild(li);
  });
}

/**
 * This function display at DOM all information about requested city.
 * @param {object} data : object obtained at 'weather'
 */
function show(data) {
  if (!data) {
    alert('Ingrese una ciudad');
  }

  // let latitud1 = data.coord.lat;
  // let longitud = data.coord.lon;
  let weather = data.weather[0].main;
  let humidity = data.main.humidity;
  let temp = data.main.temp;
  let tempMax = data.main.temp_max;
  let tempMin = data.main.temp_min;
  let city = data.name;
  const weatherId = data.weather[0].id;
  loadIcon(weatherId);
  console.log(data);

  if (actHourInterval) {
    clearInterval(actHourInterval);
  }

  actHourInterval = setInterval(() => {
    localTime(data.timezone);
  }, 1000);

  document.getElementById('place').innerText = city;
  document.getElementById('weather').innerText = weather;
  document.getElementById('humidity').innerText = humidity + '%';
  document.getElementById('temp').innerText = Math.round(temp) + '°C';
  document.getElementById('temp-max').innerText = `${Math.round(tempMax)}°C`;
  document.getElementById('temp-min').innerText = `${Math.round(tempMin)}°C`;

  requestedCity.value = '';
  suggestions.innerHTML = '';
}

// FUNCTION TAKES NUMERICALS LATITUDE AND LONGITUDE AND TRANSFORM INTO COORDS.
function convertToCoords(lat, lon) {

  const latDirection = lat >= 0 ? 'N' : 'S';
  const lonDirection = lon >= 0 ? 'E' : 'W';

  let latDegrees = Math.floor(Math.abs(lat));
  let lonDegrees = Math.floor(Math.abs(lon));

  let latMinutes = (Math.abs(lat) - Math.floor(Math.abs(lat))) * 60;
  let lonMinutes = (Math.abs(lon) - Math.floor(Math.abs(lon))) * 60;

  let latSeconds = (latMinutes - Math.abs(latMinutes)) * 60;
  let lonSeconds = (lonMinutes - Math.abs(lonMinutes)) * 60;

  let latitude = `${latDegrees}°${Math.floor(latMinutes)}'${latSeconds.toFixed(1)}"${latDirection}`;
  let longitude = `${lonDegrees}°${Math.floor(lonMinutes)}'${lonSeconds.toFixed(1)}"${lonDirection}`;

  document.getElementById('lat').innerText = latitude;
  document.getElementById('lon').innerText = longitude;
}

// FUNCTION LOADS ICONS BY THE ID OBTAINED AT 'WEATHER'
function loadIcon(id) {
  const weatherImg = document.getElementById('weather-img');
  let iconName;
  if (id >= 200 && id < 232) {
      iconName = 'thunderstorm';
  } else if (id >= 300 && id < 500) {
    iconName = 'drizzle';
  } else if (id >= 500 && id < 600) {
    iconName = 'rain';
  } else if (id >= 600 && id < 700) {
    iconName = 'snow';
  } else if (id >= 700 && id < 800) {
    iconName = 'atmosphere';
  } else if (id === 800) {
    iconName = 'clearskyd';
  } else if (id === 801) {
   iconName = 'fewclouds';
  } else if (id === 802) {
    iconName = 'fewclouds';
  } else if (id === 803 || id === 804) {
    iconName = 'brokenclouds';
  } else {
    iconName = 'clearskyd';
  }
  weatherImg.src = `/public/icons/${iconName}.png`;
}

// COOKIES
const cookiesDialog = document.querySelector('dialog');

function setCookies(name, value, time) {
  let expires = '';
  if (time) {
    const date = new Date();
    date.setTime(date.getTime() + (time * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value}${expires}; path=/`;
  geolocalization();
}

function getCookie(cookieName) {
  let cookies = document.cookie;
  cookies = cookies.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    if (cookie.startsWith(cookieName)) {
      return cookie.split('=')[1];
    } else {
      console.warn("You cannot see your city's weather.");
    }
  }
  return null;
}

// DATE AND HOUR
let actHourInterval;

function localTime(timezone) {
  const date = new Date();
  const offSetMiliseconds = timezone * 1000;
  const timeUTCMiliseconds = date.getTime() + (date.getTimezoneOffset() * 60000);
  // Nota: getTimezoneOffset() devuelve la diferencia en minutos entre UTC y la hora local del sistema.
  const localTimeMiliseconds = timeUTCMiliseconds + offSetMiliseconds;
  const cityLocalHour = new Date(localTimeMiliseconds);
  let dayName;
  switch (cityLocalHour.getDay()) {
    case 0:
      dayName = 'Sunday';
      break;
    case 1:
      dayName = 'Monday';
      break;
    case 2:
      dayName = 'Tuesday';
      break;
    case 3:
      dayName = 'Wednesday';
      break;
    case 4:
      dayName = 'Thursday'
      break;
    case 5:
      dayName = 'Friday';
      break;
    case 6:
      dayName = 'Saturday';
      break;
    default:
      dayName = '?';
  };
  const dateFormat = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: 'false'
  };
  const localDateAndHour = cityLocalHour.toLocaleDateString('en-US', dateFormat).split(',');

  document.getElementById('date').innerText = dayName;
  document.getElementById('hour').innerText = localDateAndHour[1];
}

document.addEventListener('DOMContentLoaded', () => {
  if (!getCookie('geoLo')) {
    cookiesDialog.showModal();
  } else {
    geolocalization();
  }
});

searchCityBtn.addEventListener('click', () => {
  suggestions.innerHTML = '';
  let userInput = requestedCity.value.toLowerCase().trim();
  let latitude = actualCities.lat;
  let longitude = actualCities.lon;
  weather(latitude, longitude);
});

requestedCity.addEventListener('keyup', (e) => {
  const searchCity = e.target.value;

  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') {
    if (searchCity.length > 0) {
      setTimeout(() => {
        if (searchCity.length >= 1) {
          userInput();
        }
      }, 350);
    } else {
      suggestions.innerHTML = '';
      highlightedIndex = -1;
    }
  }
});

requestedCity.addEventListener('keydown', (e) => {
  const items = suggestions.querySelectorAll('li');

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
    if (items.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex + 1) % items.length;
        items[highlightedIndex].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
        items[highlightedIndex].focus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        let lat = items[highlightedIndex].dataset.lat;
        let lon = items[highlightedIndex].dataset.lon;
        weather(lat, lon);
      } else if (e.key === 'Escape') {
        requestedCity.value = '';
        highlightedIndex = -1;
        requestedCity.focus();
      }
    }
  }
});

suggestions.addEventListener('keydown', (e) => {
  const items = suggestions.querySelectorAll('li');
  const focusedElement = document.activeElement;

  if (focusedElement && focusedElement.tagName === 'LI' && items.length > 0) {
    const currentItemIndex = Array.from(items).indexOf(focusedElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightedIndex = (currentItemIndex + 1) % items.length;
      items[highlightedIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightedIndex = (currentItemIndex - 1 + items.length) % items.length;
      items[highlightedIndex].focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      focusedElement.click();
    } else if (e.key === 'Escape') {
      requestedCity.focus();
      requestedCity.value = '';
      highlightedIndex = -1;
    }
  }
})

document.getElementById('accept-cookies').addEventListener('click', () => {
  setCookies('geoLo', 'True', 1);
  cookiesDialog.close();
});
document.getElementById('reject-cookies').addEventListener('click', () => {
  cookiesDialog.close();
});