// API KEYS
const rapidApiKey = '';
const rapidApiHost = ''
const amberKey = '';
const amberSite = '';








// script.js
const timeElement = document.getElementById("time");
const dryerButton = document.getElementById("dryer-button");
const washingSwitch = document.getElementById("washing-switch");


let dryerState = 0; // Initial state of dryer button (0: off, 1: on)

dryerButton.addEventListener("click", function() {
    dryerState = (dryerState === 0) ? 1 : 0;
    dryerButton.textContent = dryerState;
        if (dryerState === 1) {
        dryerButton.style.backgroundColor = "limegreen";
        dryerButton.style.color = 'white';
    } else {
        dryerButton.style.backgroundColor = "#ccc";
    }
});

// Your existing code to update the time every second
setInterval(function() {
    const date = new Date();
    const time = date.toLocaleTimeString();
    timeElement.textContent = time;
}, 1000);

const url = 'https://weatherapi-com.p.rapidapi.com/forecast.json?q=-37.987440,145.246058&days=1';
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': rapidApiKey,
    'X-RapidAPI-Host': rapidApiHost
  }
};

function updateWeatherData() {
  fetch(url, options)
    .then(response => response.json())
    .then(data => {
      const currentTime = new Date().getHours();
      const forecastHours = data.forecast.forecastday[0].hour;
      const futureHours = forecastHours
        .filter(hour => {
          const hourValue = parseInt(hour.time.split(' ')[1].split(':')[0]);
          return hourValue >= currentTime;
        })
        .slice(0, 7);
      console.log(futureHours)
      const maxDayTemp = data.forecast.forecastday[0].day.maxtemp_c;
      const minDayTemp = data.forecast.forecastday[0].day.mintemp_c;

      futureHours.forEach((hour, index) => {
        const hourValue = parseInt(hour.time.split(' ')[1].split(':')[0]);
        const formattedTime = index === 0 ? 'Current' : formatTime(hourValue);

        const temperature = hour.temp_c;
        const uv = hour.uv;
        const text = hour.condition.text;
        let icon;

        if (text.includes("rain") || text.includes("drizzle")) {
          icon = "🌧";
        } else if (text.includes("sun")) {
          icon = "☀️";
        } else if (text.includes("cold")) {
          icon = "🥶";
        }else if (text.includes("windy")){
          icon = "💨";
        } else {
          icon = "🌡";
        }

        console.log('Time:', formattedTime);
        console.log('Temperature:', temperature);
        console.log('Text:', [text,icon]);
        console.log('UV:', uv);
        console.log('----------------------');

        const placeholderBox = document.getElementById(`placeholder-box-${index+1}`);
        const timeElement = placeholderBox.querySelector('.time-placeholder');
        const iconElement = placeholderBox.querySelector('.icon-placeholder');
        const tempElement = placeholderBox.querySelector('.temp-placeholder');
        const uvElement = placeholderBox.querySelector('.uv-placeholder');

        timeElement.textContent = formattedTime;
        iconElement.textContent = `${icon}`;
        tempElement.textContent = `${temperature}°C`;
        uvElement.textContent = `UV: ${uv}`;

      });

      function formatTime(hour) {
        if (hour === 0) {
          return '12am';
        } else if (hour === 12) {
          return '12pm';
        } else if (hour < 12) {
          return hour + 'am';
        } else {
          return hour - 12 + 'pm';
        }
      }
    })
    .catch(error => {
      console.error(error);
    });
}

// Call the updateWeatherData function initially
updateWeatherData();

// Update the weather data every hour
setInterval(updateWeatherData, 60 * 60 * 1000); // 1 hour in milliseconds


// Section 3 - Placeholder Boxes
const placeholderBoxes = document.querySelectorAll('.placeholder-boxx');

fetch(`https://api.amber.com.au/v1/sites/${amberSite}/prices/current?next=5&previous=1&resolution=30`, {
  method: 'GET',
  headers: {
    'accept': 'application/json',
    'Authorization': `Bearer ${amberKey}`
  }
})
  .then(response => response.json())
  .then(data => {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    // Adjust the first interval based on the current hour
    if (currentHour === 2) {
      data[0].startTime = currentDate.setMinutes(0) - 30 * 60000;
    }

    // Iterate over the array
    data.forEach((item, index) => {
      const perKwh = item.perKwh;
      const startTime = new Date(item.startTime);

      // Convert interval start time to 12-hour format without leading zeros
      const hours = startTime.getHours();
      const minutes = startTime.getMinutes();
      const period = hours >= 12 ? 'pm' : 'am';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes === 0 ? '' : `:${minutes}`;

      const placeholderBox = placeholderBoxes[index];
      const timeElement = placeholderBox.querySelector('.time-placeholder');
      const circleElement = placeholderBox.querySelector('.circle-placeholder');
      const priceElement = placeholderBox.querySelector('.price-placeholder');

      timeElement.textContent = `${formattedHours}${formattedMinutes}${period}`;
      priceElement.textContent = `${perKwh.toFixed(1)}c`;

      // Set color based on price range
      if (perKwh < 24) {
        circleElement.style.backgroundColor = 'green';
      } else if (perKwh >= 24 && perKwh <= 38) {
        circleElement.style.backgroundColor = 'orange';
      } else {
        circleElement.style.backgroundColor = 'red';
      }
    });
  })
  .catch(error => {
    console.error(error);
  });

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
