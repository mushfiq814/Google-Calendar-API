// DOM
let signInBtn = document.getElementById('signInBtn');
let resultArea = document.getElementById('result');

// Sign-in
signInBtn.addEventListener('click', e => {
  e.preventDefault();
  redirect();
})

// Import CONFIG VARS
import ENV_VARS from './.config/config.js';
const clientID = ENV_VARS.CLIENT_ID;
const clientSecret = ENV_VARS.CLIENT_SECRET;
const calendarID = ENV_VARS.CALENDAR_ID;
const redirectUri = ENV_VARS.REDIRECT_URI;

// global var for accessToken
let accessToken = '';

// check if redirected, then get access token
const url = new URLSearchParams(window.location.search);
// if (refreshToken.length>0) getAcessToken(refreshToken);
if (url.has('code')) getAcessToken(url.get('code'));

function redirect() {
  const oauth2EndPoint = "https://accounts.google.com/o/oauth2/v2/auth";
  const scopes = [
    "https://www.googleapis.com/auth/calendar",	// See, edit, share, and permanently delete all the calendars you can access using Google Calendar
    "https://www.googleapis.com/auth/calendar.events",	// View and edit events on all your calendars
    "https://www.googleapis.com/auth/calendar.events.readonly",	// View events on all your calendars
    "https://www.googleapis.com/auth/calendar.readonly",	// View your calendars
    "https://www.googleapis.com/auth/calendar.settings.readonly"	// View your Calendar settings
  ]

  // If using auth > token > API
  // let params = `?client_id=${clientID}&redirect_uri=${redirectUri}&response_type=token&scope=${scopes[0]}&state=randomNumber`;
  
  // If using auth > code > token > API
  let params = `?client_id=${clientID}&redirect_uri=${redirectUri}&response_type=code&access_type=offline&scope=${scopes[0]}&state=randomNumber`;


  window.location.replace(oauth2EndPoint+params);
}

function getAcessToken(code) {
  const authUrl = 'https://www.googleapis.com/oauth2/v4/token';

  const authUrlParams = {
    'code' : code,
    'client_id' : clientID,
    'client_secret': clientSecret,
    'redirect_uri': redirectUri,
    'grant_type' : 'authorization_code'
  }

  const completeUri = `${authUrl}?
  code=${authUrlParams.code}&
  client_id=${authUrlParams.client_id}&
  client_secret=${authUrlParams.client_secret}&
  redirect_uri=${authUrlParams.redirect_uri}&
  grant_type=${authUrlParams.grant_type}`

  const repairedUri = completeUri.replace(/[\s\n]/g, '');
  console.log(repairedUri);
  return fetch(repairedUri, {
    method: 'POST'
  })
    .then(res => console.log(res))
    .catch(err => console.log(err))
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

// the following is to parse the URL if done using direct oAuth (auth > token > API) instead of auth > code > token > API
// since the returned URL doesn't have query parameters (?) and URLSearchParams won't work

// var accessTokenKey = 'access_token';
// var nextUrlKey = '&token_type';
// var currentUrl = window.location.href;
// accessToken = currentUrl.substring(currentUrl.indexOf(accessTokenKey) + accessTokenKey.length + 1, currentUrl.indexOf(nextUrlKey));
// if (accessToken.length > 0) getEvents(accessToken, calendarID, '2019-01-15T10:00:00-05:00', 100);