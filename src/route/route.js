const express=require('express')
const router= express.Router()
const urlController=require('../controller/urlController')






router.post("/url/shorten", urlController.createUrl)
router.get("/url/:urlCode", urlController.geturl)




router.all('/**',function(req,res){
    res.status(404).send({status: false, msg: "write valid url"})
})



module.exports=router