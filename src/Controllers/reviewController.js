const reviewModel=require("../Models/reviewModel")
const bookModel = require('../Models/bookModel');

const {
    isValid,
    isVAlidRequestBody,
    objectIdValid,
    nameRegex,
    ratingRegex
  } = require('../validators/validator');


//<=======================================Crete Review======================================================================>
const createReview = async function (req, res) {
    try {
        let data = req.params.bookId;
        let bodyData = req.body

        if (!objectIdValid(data)) {
            return res.status(400).send({ staus: false, message: "the BookId should be in 24 character" })
        }

        const { review, rating, reviewedBy } = bodyData

        if (!isVAlidRequestBody(bodyData)) {
            return res.status(400).send({ status: false, message: "Please give the Input to Create the User" })
        }

        if(Object.keys(bodyData).length>3) return res.status(400).send({ status: false, message: "Please give only 3 inputs to create review" })

        let getBookData = await bookModel.findById({ _id: data });

        if (!getBookData) return res.status(404).send({ status: false, message: 'No Book found' });

        if (getBookData.isDeleted == true) return res.status(400).send({ staus: false, message: 'This book is deleted' });

      
        if (!isValid(rating)) {
            return res.status(400).send({ status: false, message: 'rating is mandatory and should have non empty String' })
        }

        if(!ratingRegex.test(rating)) return res.status(400).send({ status: false, message: 'Rating must be in 1 to 5 only and it should not contain floating point' })

        if (!isValid(reviewedBy)) {
            return res.status(400).send({ status: false, message: 'reviewedBy is mandatory and should have non empty String' })
        }

        if(!nameRegex.test(reviewedBy)) return res.status(400).send({ status: false, message: 'reviewedBy should be valid name' })

        bodyData.bookId=data

        bodyData.reviewedAt=new Date()

        const newReview = await reviewModel.create(bodyData)

        const oneReview=newReview._id.toString()

        const bookupdate=await bookModel.findOneAndUpdate({_id:data} ,{$inc:{reviews:1}},{new:true})

        const{_id,title,excerpt,userId,category,subcategory,isDeleted,reviews,releasedAt}=bookupdate

        const getReviews=await reviewModel.findById({_id:oneReview}).select({isDeleted:0,__v:0})

        const obj={_id,title,excerpt,userId,category,subcategory,isDeleted,reviews,releasedAt,CreatedReview:getReviews}

        return res.status(201).send({ status: true, message: 'Success', data:obj})
 
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
};

//<=======================================Update Review======================================================================>
const updateReview = async function(req,res){
    try{

        let bookId = req.params.bookId

        if(!objectIdValid(bookId))return res.status(400).send({status:false, message:"plz enter valid bookId"})
        
        let bookExist = await bookModel.findOne({_id: bookId})

        if(!bookExist) return res.status(404).send({status: false, message: "no such book exist"})

        if(bookExist.isDeleted == true) return res.status(400).send({status: false, message: "the book is already deleted"})
        
        let reviewId = req.params.reviewId

        if(!objectIdValid(reviewId))return res.status(400).send({status:false, message:"plz enter valid reviewId"})

        let reviewExist = await reviewModel.findOne({_id: reviewId})

        if(!reviewExist) return res.status(404).send({status: false, message: "no such review exist"})

        if(reviewExist.isDeleted == true) return res.status(400).send({status: false, message: "the review is already deleted"})

        let data = req.body
        if(!isVAlidRequestBody(data))return res.status(400).send({status:false, message:"plz enter some input to upadate the review"})

        if(Object.keys(data).length>3) return res.status(400).send({ status: false, message: "Please give only 3 inputs to update review" })

        let {review, rating, reviewedBy} = data

        if (!isValid(rating)) {
            return res.status(400).send({ status: false, message: 'rating is mandatory and should have non empty String' })
        }

        if(!ratingRegex.test(rating)) return res.status(400).send({ status: false, message: 'Rating must be in 1 to 5 only and it should not contain floating point' })

        if (!isValid(reviewedBy)) {
            return res.status(400).send({ status: false, message: 'reviewedBy is mandatory and should have non empty String' })
        }

        if(!nameRegex.test(reviewedBy)) return res.status(400).send({ status: false, message: 'reviewedBy should be valid name' })

        let updateReview = await reviewModel.findOneAndUpdate({_id: reviewId, bookId: bookId}, {$set:{review:review, rating: rating, reviewedBy:reviewedBy}}, {new: true}).select({isDeleted:0,__v:0})

        const{_id,title,excerpt,userId,category,subcategory,isDeleted,reviews,releasedAt}=bookExist

        const obj={_id,title,excerpt,userId,category,subcategory,isDeleted,reviews,releasedAt,updatedReview:updateReview}

        return res.status(200).send({status: true, message: "updated successfully", data:obj })
    }
    catch(error){
        res.status(500).send({staus:false, message:error.message})
    }
}


//<=======================================Delete Review======================================================================>
const deleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId

        if(!objectIdValid(bookId))return res.status(400).send({status:false, message:"plz enter valid bookId"})
        
        let bookExist = await bookModel.findOne({_id: bookId})

        if(!bookExist) return res.status(404).send({status: false, message: "no such book exist"})

        if(bookExist.isDeleted == true) return res.status(400).send({status: false, message: "the book is already deleted"})
        
        let reviewId = req.params.reviewId

        if(!objectIdValid(reviewId))return res.status(400).send({status:false, message:"plz enter valid reviewId"})

        let reviewExist = await reviewModel.findOne({_id: reviewId})

        if(!reviewExist) return res.status(404).send({status: false, message: "no such review exist"})

        if(reviewExist.isDeleted == true) return res.status(400).send({status: false, message: "the review is already deleted"})
       
          let deleteReview = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId },{ isDeleted: true, deletedAt: new Date() },{ new: true });

          const bookupdate=await bookModel.findOneAndUpdate({_id:bookId} ,{$inc:{reviews:-1}},{new:true})

          return res.status(200).send({status: true,message: "review is deleted successfully"});

      } catch (err) {
        return res.status(500).send({ message: err.message });
      }
    };



module.exports= {createReview,updateReview,deleteReview}