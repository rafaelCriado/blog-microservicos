const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const emmitEvent = async (event, data) => { 
    await axios.post('http://localhost:4005/events', { type: event, data });
}

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  switch (type) {
    case 'CommentCreated':
        

        const isAvailable = !data.content.includes('orange');

        const newObjectComment = {
            ...data,
            status: isAvailable? 'approved': 'disapproved', 
        }

        console.log('ModeratorResolved', type, data, newObjectComment);

        await emmitEvent('ModeratorResolved', newObjectComment)
        break;
    default:
        break;
  }

  res.send({})
});

app.listen(4003, ()=> {
    console.log('Listen to 4003');
})