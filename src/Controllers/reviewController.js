const reviewModel=require("../Models/reviewModel")
const bookModel = require('../Models/bookModel');

const {
    isValid,
    isVAlidRequestBody,
    isValidPassword,
    validString,
    objectIdValid,
    nameRegex,
    ratingRegex,
    phoneRegex,
    emailRegex,
    dateFormate,
    isbnValid
  } = require('../validators/validator');



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

        let getBookData = await bookModel.findById({ _id: data });

        if (!getBookData) return res.status(404).send({ status: false, message: 'No Book found' });

        if (getBookData.isDeleted == true) return res.status(400).send({ staus: false, message: 'This book is deleted' });

      
        if (!isValid(rating)) {
            return res.status(400).send({ status: false, message: 'rating is mandatory and should have non empty String' })
        }

        if(!(rating>=1 && rating <=5)) return res.status(400).send({ status: false, message: 'rating must be in 1 to 5 only' })

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
        if(!isVAlidRequestBody(data))return res.status(400).send({status:false, message:"plz enter some input in req.body it is mendatory"})

        let {review, rating, reviewedBy} = data

        let updateReview = await reviewModel.findOneAndUpdate({_id: reviewId, bookId: bookId}, {$set:{review:review, rating: rating, reviewedBy:reviewedBy}}, {new: true})
        bookExist.reviewData = updateReview
        return res.status(200).send({status: true, message: "updated successfully", data:bookExist })
    }
    catch(error){
        res.status(500).send({staus:false, message:error.message})
    }
}

const deleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;
        let book = await bookModel.findById(bookId);
        let review = await reviewModel.findById(reviewId)
    
        if(!book){
          return res.status(404).send({staus:false,message:"This bookId is doesn't exist"});
        }
        if(!review){
          return res.status(404).send({staus:false,message:"This reviewId is doesn't exist"});
        }
      
        if(!objectIdValid(bookId)) return res.status(400).send({staus:false,message:"the BookId should be in 24 character"})
        if(!objectIdValid(reviewId)) return res.status(400).send({staus:false,message:"the reviewId should be in 24 character"})
     
        //  const getUserId=await bookModel.findOne({_id:bookId}).select({userId:1,_id:0})
        //  const delUserId=getUserId.userId.toString()
    
        if (review.isDeleted == true) {
          return res.status(404).send({staus:false,message:"This review is deleted"});
        } else {
          let deleteReview = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId },{ isDeleted: true, deletedAt: new Date() },{ new: true });
          return res.status(200).send({status: true,message: "review is deleted successfully"});
        }
      } catch (err) {
        return res.status(500).send({ message: err.message });
      }
    };



module.exports= {createReview,updateReview}