const bookModel = require('../Models/bookModel');
const userModel = require('../Models/userModel');
const reviewModel = require('../Models/reviewModel');
const {
  isValid,
  isVAlidRequestBody,
  isValidPassword,
  validString,
  objectIdValid,
  nameRegex,
  phoneRegex,
  emailRegex,
  dateFormate,
  isbnValid,
} = require('../validators/validator');

const createBook = async function (req, res) {
  try {
    data = req.body;

    const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } =
      data;

    const decodedToken = req.decodedToken;

    if (!isValid(userId))
      return res
        .status(400)
        .send({
          status: false,
          message: 'userId is mandatory and should have non empty String',
        });

    if (decodedToken !== userId)
      return res
        .status(403)
        .send({
          status: false,
          message: 'you can not create the book because you are not authorized',
        });

    if (!isVAlidRequestBody(data))
      return res
        .status(400)
        .send({
          status: false,
          message: 'Please provide the input to create the Books',
        });

    if (!isValid(title))
      return res
        .status(400)
        .send({
          status: false,
          message: 'title is mandatory and should have non empty String',
        });

    if (await bookModel.findOne({ title }))
      return res
        .status(400)
        .send({
          status: false,
          message: 'title is Already created Please give Another title',
        });

    if (!isValid(excerpt))
      return res
        .status(400)
        .send({
          status: false,
          message: 'excerpt is mandatory and should have non empty String',
        });

    if (!isValid(ISBN))
      return res
        .status(400)
        .send({
          status: false,
          message: 'ISBN is mandatory and should have non empty String',
        });

    if (!isbnValid.test(ISBN))
      return res
        .status(400)
        .send({ status: false, message: 'ISBN Should be 10 || 13 digits' });

    if (await bookModel.findOne({ ISBN }))
      return res
        .status(400)
        .send({
          status: false,
          message: 'ISBN is Already created Please give Another ISBN',
        });

    if (!isValid(category))
      return res
        .status(400)
        .send({
          status: false,
          message: 'category is mandatory and should have non empty String',
        });

    if (!isValid(subcategory))
      return res
        .status(400)
        .send({
          status: false,
          message: 'subcategory is mandatory and should have non empty String',
        });

    if (!isValid(releasedAt))
      return res
        .status(400)
        .send({
          status: false,
          message: 'releasedAt is mandatory and should have non empty String',
        });

    if (!dateFormate.test(releasedAt))
      return res
        .status(400)
        .send({
          status: false,
          message:
            'releasedAt should be in this formate YYYY-MM-DD && it should be valid',
        });

    const bookCreated = await bookModel.create(data);

    return res
      .status(201)
      .send({ status: true, message: 'Success', data: bookCreated });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//get by Query Params
const getbooks = async function (req, res) {
  try {
    let data = req.query;

    const { userId, category, subcategory } = data;

    const decodedToken = req.decodedToken;

    if (decodedToken !== userId)
      return res
        .status(403)
        .send({ status: false, message: 'You are not authorized' });

    let gettingData = await bookModel
      .find({ $and: [{ isDeleted: false }, data] })
      .select({
        _id: 1,
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        releasedAt: 1,
        reviews: 1,
        subcategory: 1,
      })
      .sort({ title: 1 });

    if (gettingData.length == 0) {
      return res
        .status(404)
        .send({ status: false, msg: 'OOPS!! Document is Deleted' });
    }
    return res
      .status(200)
      .send({
        status: true,
        msg: 'Data fetch successfully',
        data: gettingData,
      });
  } catch (err) {
    return res.status(500).send({ staus: false, error: err.message });
  }
};

//get books by path
const getBookByParams = async function (req, res) {
  try {
   let data = req.params.bookId;
   const decodedToken = req.decodedToken;
    const getUserId=await bookModel.findOne({data}).select({userId:1,_id:0})

    const oneUserId=getUserId.userId.toString()
    
   if (decodedToken !== oneUserId)
     return res
       .status(403)
       .send({ status: false, message: 'You are not authorized' });
       
   if(!objectIdValid(data)) return res.status(400).send({staus:false,message:"Please give valid BookId"})

    let books = await bookModel.findById(data);
    if (!books) {
      return res.status(404).send("books doesn't exists");
    }
    if (books.isDeleted == true) {
      return res.status(404).send('This books is deleted');
    }

    let getBookData = await bookModel.findById({_id:data,isDeleted:false});

    if (!getBookData) {
      return res.status(404).send({ status: false, msg: 'no data found' });
    }
    const getReview = await reviewModel.find({ bookId: data });

    let getdata = {
      _id: getBookData._id,
      title: getBookData.title,
      excerpt: getBookData.excerpt,
      userId: getBookData.userId,
      category: getBookData.category,
      subcategory: getBookData.subcategory,
      isDeleted: getBookData.isDeleted,
      reviweData: getReview,
    };
    return res.status(200).send({
        status: true,
        data: getdata,
        msg: 'succesfully get book details',
      });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createBook, getbooks, getBookByParams };
