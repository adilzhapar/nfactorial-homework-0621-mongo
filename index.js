import express from 'express';
import bodyParser from 'body-parser';
import {connect, getDB} from './db.js';
import {ObjectId} from 'mongodb';

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

connect();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});


// get all tasks
app.get('/tasks', (req, res) => {
    getDB()
    .collection('tasks')
    .find({})
    .toArray((err, result) => {
        if (err) {
            res.status(500).send(result);
            return;
        }
        res.status(200).send(result);
    });


});

// create new task
app.post('/task', (req, res) => {
    const {name, priority} = req.body;

    getDB()
    .collection('tasks')
    .insertOne({'name': name, 'priority': priority}, (err, result) => {
        if (err) {
            res.status(500).send({ err: err });
            return;   
        }
        res.status(200).send(result);
    });
});


// delete task
app.delete('/task/:id', (req, res) => {
    
    getDB()
    .collection('tasks')
    .deleteOne({ _id: new ObjectId(req.params.id) }, (err, result) => {
        if (err) {
            res.status(500).json({ err: err });
            return;   
        }
        res.status(200).send(result);
    });
});

// change task
app.put('/tasks/:id', (req, res) => {
    const {name, priority} = req.body;
    const {id } = req.params;

    getDB()
    .collection('tasks').updateOne(
        {
            _id: new ObjectId(id),
        }, 
        {
            $set: {
                name,
                priority
            },
        }
    );
    
    const result = {
        _id: id,
        name,
        priority
    }

    res.send(result);
    
    });

// get by names

app.get('/names', (req, res) => {
    getDB()
    .collection('tasks')
    .find({})
    .sort({name: 1})
    .toArray((err, result) => {
        if (err) {
            res.status(500).json({ err: err });
            return;
        }
        res.status(200).send(result);
    });

})

// get by priority

app.get('/priorities', (req, res) => {
    getDB()
    .collection('tasks')
    .find({})
    .sort('priority')
    .toArray((err, result) => {
        if (err) {
            res.status(500).json({ err: err });
            return;
        }
        res.status(200).send(result);
    });

})

// search by name
app.get('/tasks/:name', (req, res) => {
    const {name} = req.params;
    getDB()
    .collection('tasks')
    .find({name: name})
    .toArray((err, result) => {
        if (err) {
            res.status(500).json({ err: err });
            return;
        }
        res.status(200).send(result);
    });
})


app.listen(port, () => {
    console.log('Server started!');
});