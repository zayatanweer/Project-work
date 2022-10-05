const express= require("express")
const app=express();
const mongoose= require("mongoose")
const bodyParser= require("body-parser")
const route=require("./route/route")




app.use(bodyParser.json())


mongoose.connect("mongodb+srv://sonupk:1HivF6DXHWanVcYu@cluster0.vtjazgb.mongodb.net/group31-DB",{

  useNewUrlParser : true
})

.then(()=> console.log("mongoDb is connected"))
.catch(err=> console.log(err))

app.use('/',route)

app.listen(process.env.PORT || 3000,function(){

    console.log("express app running on port" + (process.env.PORT||3000))
})
