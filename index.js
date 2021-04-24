const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {
  Server
} = require("socket.io");
const io = new Server(server);

let port = process.env.PORT || 3000;

let NanoTimer = require('nanotimer');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let hours = `00`;
let minutes = `00`;
let seconds = `00`;
let timer = {
  hours: hours,
  minutes: minutes,
  seconds: seconds,
}
let state;
let timerA = new NanoTimer();

async function chronometer() {

  seconds++;

  if (seconds < 10) seconds = `0` + seconds

  if (seconds > 59) {
    seconds = `00`
    minutes++

    if (minutes < 10) minutes = `0` + minutes
  }

  if (minutes > 59) {
    minutes = `00`
    hours++
  }

  timer.hours = hours;
  timer.minutes = minutes;
  timer.seconds = seconds;
  state = 'count'

  io.emit('count', [timer, state])
}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('connected', [timer, state])

  socket.on('start', () => {
    timerA.setInterval(chronometer, '', '1s')
  })

  socket.on('reset', () => {
    timerA.clearInterval();
    hours = `00`;
    minutes = `00`;
    seconds = `00`;
    state = 'clear'
    io.emit('clear', state);
  })

  socket.on('pause', () => {
    timerA.clearInterval();
    state = 'paused'
    io.emit('paused', state);
  })
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});