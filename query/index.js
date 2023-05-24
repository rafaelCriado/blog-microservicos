const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
    switch (type) {
        case 'PostCreated':
          const { id, title } = data;    
          posts[id] = { id, title, comments: [] };     
          break;
    
        case 'CommentCreated':
          const { content, status, postId } = data;
          const post = posts[postId];
          post.comments.push({ id: data.id, content, status });
          break;
        
        case 'CommentUpdated':
          const commentIndex = posts[data.postId].comments.findIndex(({id}) => id === data.commentId); 
          posts[data.postId].comments[commentIndex] = { id:data.commentId, content: data.content, status: data.status };
          break;
    
        default:
          break;
    }   
}

app.get('/posts', (req, res) => {
   res.send(posts);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;

    handleEvent(type, data);

    console.log('QueryPosts',  posts );

    res.send({});
})

app.listen(4002, async ()=> {
    console.log('Listen on 4002');

    const res = await axios.get('http://locahost:4005/events').catch((err) => {
        console.log(err.message);
    });

    console.log('->', res);

    if(res){
      for(let event of res.data){
        console.log('Processing events: ', event.type);
        handleEvent(event.type, event.data);
      }
    }
})