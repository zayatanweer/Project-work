const express = require('express')
const router = express.Router()

const userController=require('../Controllers/userController')
const bookController=require("../Controllers/bookController")
const reviewController=require('../Controllers/reviewController')
const mid1=require('../Middleware/auth')

//users API
router.post('/register',userController.createUser)

router.post('/login',userController.uesrLogin)

//Books API
router.post("/books",mid1.authentication, bookController.createBook)

router.get("/books",mid1.authentication, bookController.getbooks)

router.get("/books/:bookId",mid1.authentication,bookController.getBookByParams)

router.put("/books/:bookId",mid1.authentication,bookController.updateBook)

router.delete("/books/:bookId",mid1.authentication,bookController.deleteBook)

//Reviews API
router.post('/books/:bookId/review',reviewController.createReview)

//for worng route=============================>
router.all('/*/',async function(req,res){
    return res.status(404).send({status:false,message:"Page Not Found"})
})

module.exports = router
