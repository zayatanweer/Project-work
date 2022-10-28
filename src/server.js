//===================== Importing module and packages =====================//
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require('multer');
const moment = require("moment");
const PORT = process.env.PORT || 3000;
const route = require("./routes/route");

const app = express();

app.use(express.json());      // checking content-type and parsing in json
app.use(cors());              // to not violate cors policy
app.use(multer().any());      // to access files


//===================== Connecting Mongo DB database cluster =====================//
mongoose.connect("mongodb+srv://rahul:rahul123@cluster0.ghayzlv.mongodb.net/group-44?retryWrites=true&w=majority", {
  useNewUrlParser: true
})
  .then(() => console.log(">> mongoDb is connected..."))
  .catch(err => console.log(err))


//===== Global Middleware for Console the Date, Time, IP Address and Print the particular API Route Name when you will hit that API ========//
app.use(
  function printDetails(req, res, next) {
    const dateTime = moment().format('YYYY-MM-DD hh:mm:ss');
    console.log(`||--->> Date: ${dateTime}  ||--->> IP Address: ${req.ip}  ||--->> Route Called: ${req.originalUrl} ----- ||`);
    next();
  }
);

//===================== Global Middleware for All Route =====================//
app.use('/', route);


app.listen(PORT, () => { console.log(`>> express app running on port ${PORT}...`) });
