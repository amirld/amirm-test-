const port = 5000
const express = require('express');
const app = express();
const cors = require('cors');

const users = require('./users.json');
console.log(users);


app.use(express.json());       
// app.use(express.urlencoded( {extended: false}));
app.use(cors({
    origin: '*'
}));



// connect to db
const mysql = require('mysql2');
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 's559',
    database : 'amirm_db'
});

db.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    app.listen(port, ()=>{
        console.log(`listening port ${port}`);
        console.log(`http://localhost:${port}`);
    })
});

// api 

// register user
app.post('/user', (req, res)=>{
    const {name, imageUrl, googleId, email} = req.body;
    db.query(`call user_login( ${googleId} )`,(err, results)=>{
        if (err) {
            res.status(500).json({type: 'sql', errorno: err.errno, massage: err.sqlMessage});
            return
        }
        if (results == undefined || results[0][0] == undefined ) {
            db.query(`call user_register( ?, ?, ?, ?)`, [name , email , googleId, imageUrl],(result)=>{
                res.status(200).send('success')
            })
        }else {
            res.status(200).send('success')    
        }
    })

})

// blogs
app.get('/blogs', (req, res)=> {
    const {limit, lastblog} = req.query
    db.query('call blogs_get( ?, ? )', [limit, lastblog],(err, results)=>{
        if (err) {
            res.status(500).json({type: 'sql', errorno: err.errno, massage: err.sqlMessage});
            return
        }
        res.status(200).json(results)
    })})

// single blog
app.get('/blog', (req, res) => {
    db.query(`call blog_get_single( ${req.query.blog_id} )`,(err, results)=>{
        if (err) {
            res.status(500).json({type: 'sql', errorno: err.errno, massage: err.sqlMessage});
            return
        }
        res.status(200).json(results)
    })
})

// singls blog comments
app.get('/blog/comments', (req, res) => {
    const {blog_id, limit, lastcomment} = req.query
    db.query('call blog_get_comments( ?, ?, ? )',[blog_id, limit, lastcomment],(err, results)=>{
        if (err) {
            res.status(500).json({type: 'sql', errorno: err.errno, massage: err.sqlMessage});
            return
        }
        res.status(200).json(results)
    })
})

// add comment
app.post('/blog/comments', (req, res)=>{
    const { blog_id, user_google_id, content_text } = req.body
    db.query(`call blog_add_comment( ?, ?, ?)`,[content_text, user_google_id, blog_id],(err, results)=>{
        if (err) {
            res.status(500).json({type: 'sql', errorno: err.errno, massage: err.sqlMessage});
            return
        }
        res.status(200).json('success')
        
    })
})

// get access 
app.post('/access', (req, res)=>{
    const {password, name} = req.body
    const user = users.find(user => user.name === name && user.pass === password )
    if (user) {
        res.status(200).json(user)
    }else {
        res.status(500).send()
    }
})
// api

app.use((req, res)=> {
    res.status(404).send('not found');
})

