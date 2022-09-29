const urlModel=require('../model/urlModel')
const shortId =require('shortid')
const validurl=require('valid-url')
const url=require('validator')

const createUrl =async function(req,res){
    try{
    let data= req.body
  
   if( Object.keys(data).length==0){
    return res.status(400).send({status:false,msg: "body is empty"})
   }
   if(!data.longUrl){
    return res.status(400).send({status:false,msg:"longUrl is required"})
   }

   if(typeof data.longUrl != "string"){
    return res.status(400).send({status: false,msg:'long url is invalid'})
   }

 if(!(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(data.longUrl)))
   
   if (!url.isURL(data.longUrl)){
   return res.status(400).send({status:false,msg:"long url is invalid"})
}

   let urlCode =shortId.generate().toLowerCase()
   let shortUrl=`http://localhost:3000/${urlCode}`
   data.urlCode=urlCode;
   data.shortUrl=shortUrl
   
    let createData= await urlModel.create(data)

    res.send({data:createData})
    }
    catch(err){
        return res.status(500).send({msg: err.message})
    }
}






const geturl = async function(req,res){
   try{
    let urlcode = req.params.urlcode
    const findurl = await urlModel.findOne({urlcode:urlcode})
//     if(findurl){
// const myurl = await urlModel(req.params.urlCode)
// if(!myurl)   return res.status(500).send({msg: err.message})

//         return res.redirect(findurl.longUrl)
    //}
    
    return res.send({data:findurl})
   }
   catch(err){
    return res.status(500).send({msg: err.message})
}
}
module.exports={createUrl,geturl}