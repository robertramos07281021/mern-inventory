const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoute = require('./routes/userRoute')
const errorHandler = require('./middleWare/errorMiddleware')
const cookieParser = require('cookie-parser')

const app = express();

const PORT = process.env.PORT ||  5000;

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());



app.use('/api/users',userRoute);
//routes
app.get('/', (req,res) => {
  res.send('HOME PAGES');
})

//error middleware
app.use(errorHandler);

//connect to DB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.log(err);
  })