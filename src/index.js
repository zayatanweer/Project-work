const express = require("express");
const bodyParser = require('body-parser');
const route = require('./routes/router.js');
const mongoose = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("", {
    useNewUrlParser: true,
})
.then( () => console.log("MongoDb is successfully connected!"))
.catch( err => console.log(err) )

app.use('/', router);


app.listen(process.env.PORT || 3000, function(){
    console.log('Express app running on port' + (process.env.PORT || 3000))
});