const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const events = [];

const resendEvents = (portService, event) => {
  return axios.post(`http://localhost:${portService}/events`, event).catch((err) => {
      console.log(err.message);
  });
}

app.post('/events', (req, res) => {
    const event = req.body;

    events.push(event);

    const ports = [4000,4001,4002,4003];

    Promise.all([ports.map(port => resendEvents(port, event))]);
    
    console.log({ event });
    console.log({ events });

    res.send({ status: 'OK' });
});

app.get('/events', (_, res) => {
  res.send(events);
})

app.listen(4005, () => {
    console.log('Listening on 4005');
});