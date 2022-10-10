const express= require("express");
const app=express();
const mongoose= require("mongoose")
const route=require("./routes/route")


app.use(express.json())

mongoose.connect("mongodb+srv://rahul:rahul123@cluster0.ghayzlv.mongodb.net/group-44?retryWrites=true&w=majority",{

  useNewUrlParser : true
})

.then(()=> console.log("mongoDb is connected"))
.catch(err=> console.log(err))

app.use('/',route)

app.listen(process.env.PORT || 3000,function(){

    console.log("express app running on port" + (process.env.PORT||3000))
})
