const bookModel = require('../Models/bookModel');
const userModel = require('../Models/userModel');
const reviewModel = require('../Models/reviewModel');
const {isValid, isVAlidRequestBody, objectIdValid, dateFormate, isbnValid, titleRegex} = require('../validators/validator');



//<=======================================create Book========================================================================>

const createBook = async function (req, res) {
  try {
    data = req.body;
    const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data;

    //authorization
    const decodedToken = req.decodedToken;

    if (!isValid(userId))
      return res.status(400).send({ status: false, message: 'userId is mandatory and should have non empty String',});

    if (decodedToken !== userId)
      return res.status(403).send({ status: false, message: 'you can not create the book because you are not authorized',});

    if (!isVAlidRequestBody(data))
      return res.status(400).send({ status: false, message: 'Please provide the input to create the Books',});

    if (!isValid(title))
      return res.status(400).send({ status: false, message: 'title is mandatory and should have non empty String',});
    if(!titleRegex.test(title))
      return res.status(400).send({status: false,message: 'Give valid title for Book'});

        //checking Unique Title
    if (await bookModel.findOne({ title }))
      return res.status(400).send({ status: false, message: 'title is Already created Please give Another title', });

    if (!isValid(excerpt))
      return res.status(400).send({ status: false, message: 'excerpt is mandatory and should have non empty String', });

    if (!isValid(ISBN))
      return res.status(400).send({ status: false, message: 'ISBN is mandatory and should have non empty String', });

    if (!isbnValid.test(ISBN))
      return res.status(400).send({ status: false, message: 'ISBN Should be 10 || 13 digits' });

        //checking Unique ISBN

    if (await bookModel.findOne({ ISBN }))
      return res.status(400).send({ status: false, message: 'ISBN is Already created Please give Another ISBN', });

    if (!isValid(category))
      return res.status(400).send({ status: false, message: 'category is mandatory and should have non empty String', });

    if (!isValid(subcategory))
      return res.status(400).send({ status: false, message: 'subcategory is mandatory and should have non empty String', });

    if (!isValid(releasedAt))
      return res.status(400).send({ status: false, message: 'releasedAt is mandatory and should have non empty String', });

    if (!dateFormate.test(releasedAt))
      return res.status(400).send({ status: false, message: 'releasedAt should be in this formate YYYY-MM-DD && it should be valid', });

    const bookCreated = await bookModel.create(data);

    return res.status(201).send({ status: true, message: 'Success', data: bookCreated });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//<=======================================get books by Query Params=============================================================>

const getbooks = async function (req, res) {
  try {
    let data = req.query;

    const { userId, category, subcategory } = data;
    if(Object.keys(data).length>3) return res.status(400).send({status:false,message:"the input should be only 3 query params"})

    let filter={isDeleted:false}
    if(userId) {
    if(!objectIdValid(userId)) return res.status(400).send({staus:false,message:"Please give valid userId"})
    filter.userId=userId
    }
    if(category) {
    filter.category=category
    }
    if(subcategory) {
    filter.subcategory=subcategory
    }
    let gettingData = await bookModel.find(filter).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })
  
    if (gettingData.length == 0) {
      return res.status(404).send({ status: false,message:"No documents found"});
    }
    return res.status(200).send({ status: true,message: 'Books list', BooksCount:gettingData.length, data: gettingData, });
   } catch (err) {
    return res.status(500).send({ staus: false, error: err.message });
  }
};


//<=======================================get books by path params========================================================>

const getBookByParams = async function (req, res) {
  try {
   let data = req.params.bookId;

   if(!objectIdValid(data)) return res.status(400).send({staus:false,message:"Please give valid BookId"})

    let getBookData = await bookModel.findById({_id:data});

    if (!getBookData) return res.status(404).send({ status: false, message: 'No Book found' });

    if (getBookData.isDeleted == true) return res.status(400).send({staus:false,message:'This book is deleted'});

    let {_id,title,excerpt,userId,category,subcategory,isDeleted,reviews,releasedAt,createdAt,updatedAt} = getBookData

    const getReview = await reviewModel.find({ bookId: data , isDeleted:false}).select({isDeleted:0,__v:0})

    let getBookData1={_id,title,excerpt,userId,category,subcategory,isDeleted,reviews,releasedAt,createdAt,updatedAt,reviewsData:getReview}

    return res.status(200).send({ status: true, message: 'Books list', review_Count:getReview.length, data:getBookData1, });
  } catch (err) {
   return res.status(500).send({ status: false, message: err.message });
  }
};


//<=======================================update Books================================================================>

const updateBook=async function(req,res){
  try {
    
    let bookId = req.params.bookId;

    if(!objectIdValid(bookId)) return res.status(400).send({staus:false,message:"the BookId is not Valid"})

    let getBookData = await bookModel.findById({_id:bookId});

    if (!getBookData) return res.status(404).send({ status: false, message: 'No Book found' });

    if(getBookData.isDeleted==true) return res.status(400).send({ status: false, message: 'The Book is already deleted' });

    const oneUserId=getBookData.userId.toString()
    //authorization
    const decodedToken = req.decodedToken;

    if (decodedToken !== oneUserId) return res.status(403).send({ status: false, message: 'You are not authorized so You can not update the book' });

      let data = req.body

     let {title,excerpt,ISBN,releasedAt}=data

     if (!isVAlidRequestBody(data)) return res.status(400).send({status: false,message: 'Please provide the input to Update the Book'});

     if(Object.keys(data).length>4) return res.status(400).send({status: false,message: 'Only 4 inputs are allowed to update the Book'});
     
    if(title){

      if (!isValid(title))
      return res.status(400).send({ status: false, message: 'title is empty', });
      if(!titleRegex.test(title)) return res.status(400).send({status: false,message: 'Give valid title for Book'});
      if (await bookModel.findOne({ title }))
      return res.status(400).send({ status: false, message: 'With this title the book is already present, Please provide unique title to update',});
      }
      if(excerpt){
        if (!isValid(excerpt))
        return res.status(400).send({ status: false, message: 'excerpt is empty ', });
      }
      if(ISBN){
        if (!isValid(ISBN))
        return res.status(400).send({ status: false, message: 'ISBN is empty',});
      if (!isbnValid.test(ISBN))
      return res.status(400).send({ status: false, message: 'ISBN Should be 10 || 13 digits' });
      if (await bookModel.findOne({ ISBN }))
      return res.status(400).send({ status: false, message: 'With this ISBN the book is already present, Please provide unique ISBN to update', });
      }
      if(releasedAt){ 
        if (!dateFormate.test(releasedAt))
        return res.status(400).send({ status: false, message: 'releasedAt should be in this formate YYYY-MM-DD && it should be valid', }); 
        }

      const updateBook=await bookModel.findOneAndUpdate({_id:bookId}, {$set:{title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN }},{new:true}).select({deletedAt:0,__v:0})
        return res.status(200).send({staus:true,message:"Success",data:updateBook})
    } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
}
 


//<=======================================Delete Books================================================================>

const deleteBook = async function (req,res){
  try {
    let bookId = req.params.bookId;

    if(!objectIdValid(bookId)) return res.status(400).send({staus:false,message:"the BookId should be in 24 character"})

    let book = await bookModel.findById(bookId);

    if(!book){
      return res.status(404).send({staus:false,message:"This book is doesn't exist"});
    }
    if (book.isDeleted == true) {
      return res.status(400).send({staus:false,message:"This book is already deleted"});
    }
    
    const oneUserId=book.userId.toString()
    //authorization
    const decodedToken = req.decodedToken;
  
      if (decodedToken !== oneUserId)
      return res.status(403).send({ status: false, message: 'You are not authorized so You can not delete the book' });

      let deleteBook = await bookModel.findOneAndUpdate({ _id: bookId },{ isDeleted: true, deletedAt: new Date() },{ new: true });
      return res.status(200).send({status: true,message: "book is deleted successfully"});
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
};


module.exports = { createBook, getbooks, getBookByParams,updateBook,deleteBook };
