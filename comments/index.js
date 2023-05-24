const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

const emmitEvent = async (event, data) => { 
    await axios.post('http://localhost:4005/events', { type: event, data });
}

app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];

    const newComment = {id: commentId, content, status: 'pending'}
    
    comments.push(newComment);

    commentsByPostId[req.params.id] = comments;

    await emmitEvent('CommentCreated', {
        ...newComment,
        postId: req.params.id
    });

    res.status(201).send(comments);
});

app.delete('/posts/:id/comments/:commentId', async (req, res) => {
    const comments = commentsByPostId[req.params.id] || [];

    const newComments = comments.filter(comment => comment.id !== req.params.commentId);

    commentsByPostId[req.params.id] = newComments;

    await emmitEvent('CommentDeleted', {
        ...newComment,
        postId: req.params.id
    });

    res.status(204).send();
});

app.post('/events', async (req, res) => {

    const { type, data} = req.body;

    switch (type) {
        case 'ModeratorResolved':
          const indexComment = commentsByPostId[data.postId].findIndex(({id})=> id === data.id);
          commentsByPostId[data.postId][indexComment].status = data.status;

          await emmitEvent('CommentUpdated', {
            ...commentsByPostId[data.postId][indexComment],
            postId: data.postId,
          });
          break;
        
        default:
          break;
    }

    res.send({});
})

app.listen(4001, ()=> {
    console.log('Listen on 4001');
})