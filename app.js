// DOM
let signInBtn = document.getElementById('signInBtn');
let resultArea = document.getElementById('result');

import ENV_VARS from './.config/config.js';

const clientID = ENV_VARS.CLIENT_ID;
const clientSecret = ENV_VARS.CLIENT_SECRET;
const calendarID = ENV_VARS.CALENDAR_ID;
const redirectUri = ENV_VARS.REDIRECT_URI;
var accessToken = '';

const oauth2EndPoint = "https://accounts.google.com/o/oauth2/v2/auth";
const scopes = [
  "https://www.googleapis.com/auth/calendar",	// See, edit, share, and permanently delete all the calendars you can access using Google Calendar
  "https://www.googleapis.com/auth/calendar.events",	// View and edit events on all your calendars
  "https://www.googleapis.com/auth/calendar.events.readonly",	// View events on all your calendars
  "https://www.googleapis.com/auth/calendar.readonly",	// View your calendars
  "https://www.googleapis.com/auth/calendar.settings.readonly"	// View your Calendar settings
]

let params = `?client_id=${clientID}&redirect_uri=${redirectUri}&response_type=token&scope=${scopes[0]}&state=randomNumber`;

signInBtn.addEventListener('click', e => {
  e.preventDefault();
  redirect();
})

var accessTokenKey = 'access_token';
var nextUrlKey = '&token_type';
var currentUrl = window.location.href;
accessToken = currentUrl.substring(currentUrl.indexOf(accessTokenKey) + accessTokenKey.length + 1, currentUrl.indexOf(nextUrlKey));
if (accessToken.length > 0) getEvents(accessToken, calendarID, '2019-01-15T10:00:00-05:00', 10);

function redirect() {
  window.location.replace(oauth2EndPoint+params);
}

function getEvents(token, calendarID, timeMin, maxResults) {
  const calendarApiEndPoint = 'https://www.googleapis.com/calendar/v3/calendars/';
  let params = calendarID + '/events?maxResults=' + maxResults + '&timeMin=' + timeMin;
  return fetch(calendarApiEndPoint+params, {
    method: 'GET',
    headers: {
      'Authorization':'Bearer ' + token
    }
  }).then(res => res.json())
    .then(data => data.items)
    .then(events => {
      events.forEach(event => {
        var title = event.summary;
        var desc = event.description;
        var startTime = event.start.dateTime;
        var endTime = event.end.dateTime;

        var titleElement = document.createElement('h3');
        titleElement.innerText = title;
        var descElement = document.createElement('p');
        descElement.innerText = desc;
        var startTimeElement = document.createElement('p');
        startTimeElement.innerText = startTime;
        var endTimeElement = document.createElement('p');
        endTimeElement.innerText = endTime;

        var card = document.createElement('div');
        card.classList.add('card');
        card.appendChild(titleElement);
        card.appendChild(descElement);
        card.appendChild(startTimeElement);
        card.appendChild(endTimeElement);

        resultArea.appendChild(card);
      });
    })
    .catch(err => console.log(err))
}