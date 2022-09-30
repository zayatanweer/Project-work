const urlModel=require('../model/urlModel')
const shortId =require('shortid')
// const validurl=require('valid-url')
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

const getUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode

        if(!urlCode) return res.status(400).send({status:false,msg:"longUrl is required"})

        let urlDetails = await urlModel.findOne({ urlCode: urlCode })
        if (!urlDetails) return res.status(400).send({ status: false, message: "URL not found" })

        return res.status(302).redirect(urlDetails.longUrl)

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }
}
module.exports = { createUrl, getUrl };