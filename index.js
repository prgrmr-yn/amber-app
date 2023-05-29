// API KEYS

const rapidApiKey = '';
const rapidApiHost = ''
const amberKey = '';
const amberSite = '';
const authorizationToken = 'Bearer';
const calendarId = '';
const apiUrl = `https://timetreeapis.com/calendars/${calendarId}/upcoming_events?timezone=Asia/Tokyo&days=1&include=creator`;




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
      const maxDayTemp = data.forecast.forecastday[0].day.maxtemp_c;
      const minDayTemp = data.forecast.forecastday[0].day.mintemp_c;

      futureHours.forEach((hour, index) => {
        const hourValue = parseInt(hour.time.split(' ')[1].split(':')[0]);
        const formattedTime = index === 0 ? 'Current' : formatTime(hourValue);

        const temperature = hour.temp_c;
        const uv = hour.uv;
        const text = hour.condition.text.toLowerCase();
        let icon;

        if (text.includes("rain") || text.includes("drizzle")) {
          icon = "🌧";
        } else if (text.includes("sun")) {
          icon = "☀️";
        } else if (text.includes("cold")) {
          icon = "🥶";
        }else if (text.includes("windy")){
          icon = "💨";
        } else if (text.includes("cloudy")){
          icon = "☁️";
        } else {
          icon = "🌡";
        }
        // console.log('Text:', [text,icon]);
        // console.log('----------------------');

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
        console.log('weather updated')
    })
    .catch(error => {
      console.error(error);
    });
}

// Call the updateWeatherData function initially
updateWeatherData();

// Update the weather data every 30 mins
setInterval(()=>{
  updateWeatherData()
    console.log('weather updated')
}, 60 * 30 * 1000); // 30 mins in milliseconds


// Section 3 - Placeholder Boxes
const placeholderBoxes = document.querySelectorAll('.placeholder-boxx');

function displayEnergyPrices() {
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
        priceElement.textContent = `${Math.round(perKwh)} ¢`;

        // Set color based on price range
        if (perKwh < 24) {
          circleElement.style.backgroundColor = 'green';
        } else if (perKwh >= 24 && perKwh <= 38) {
          circleElement.style.backgroundColor = 'orange';
        } else {
          circleElement.style.backgroundColor = 'red';
        }
      });
      console.log('electricity prices updated')
    })
    .catch(error => {
      console.error(error);
    });
}

// Call the functions initially
displayEnergyPrices();

// Update the data every 30 minutes
setInterval(() => {
  displayEnergyPrices();
  console.log('electricity prices updated')
}, 15 * 60 * 1000);


fetch(apiUrl, {
  headers: {
    'Accept': 'application/vnd.timetree.v1+json',
    'Authorization': authorizationToken
  }
})
  .then(response => response.json())
  .then(data => {
    const events = data.data; // Array of events

    // Extract title, start_at, and end_at for all events
    const eventDetails = events.map(event => {
      const { title, start_at, end_at } = event.attributes;

      // Convert UTC time to Melbourne time
      const startAtMelbourne = new Date(start_at).toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' });
      const endAtMelbourne = new Date(end_at).toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' });

      return { title, start_at: startAtMelbourne, end_at: endAtMelbourne };
    });

    // Log the event details
    eventDetails.forEach(event => {
      // console.log('Title:', event.title);
      // console.log('Start At (Melbourne):', event.start_at);
      // console.log('End At (Melbourne):', event.end_at);
      // console.log('-----------------------');
    });
      console.log('events printed')
  })
  .catch(error => {
    console.error(error);
  });

// Section 4 - Calendar Events
const section4 = document.getElementById('section2');

// Fetch events from the calendar and display them in the section
function displayCalendarEvents() {
  fetch(apiUrl, {
    headers: {
      'Accept': 'application/vnd.timetree.v1+json',
      'Authorization': authorizationToken
    }
  })
    .then(response => response.json())
    .then(data => {
      const events = data.data; // Array of events

      // Create a div for each event and display the event details
      events.forEach(event => {
        const { title, start_at, end_at } = event.attributes;

        // Create event details elements
        const eventDiv = document.createElement('div');
        eventDiv.classList. add('calender-events')
        const titleElement = document.createElement('div');
        const timeElement = document.createElement('div');
        const startAtMelbourne = new Date(start_at).toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' })
        const start = startAtMelbourne.slice(11,16 ) + startAtMelbourne.slice(19)
      const endAtMelbourne = new Date(end_at).toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' });
        const end = endAtMelbourne.slice(11,16 ) + endAtMelbourne.slice(19)

        // Set event details
        titleElement.textContent = title;
        timeElement.textContent = `${start} - ${end}`;

        // Append event details to event div
        eventDiv.appendChild(titleElement);
        eventDiv.appendChild(timeElement);

        // Append event div to section 4
        section4.appendChild(eventDiv);
      });
    })
    .catch(error => {
      console.error(error);
    });
}

// Call the function to display calendar events
displayCalendarEvents();
