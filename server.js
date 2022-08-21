//  This will be where our server code will reside. This is where the Express framework will be put to use
import express from 'express';
import cors from 'cors';
import courses from './api/courses.route.js';

// use Express framework
const app = express();

app.use(cors());
app.use(express.json());

// any URL with this URL prefix will go to courses.route.js
app.use("/api/v1/",courses); 
app.use('*', (req, res) => {
    res.status(404).json({error: "not found"});
})

export default app;