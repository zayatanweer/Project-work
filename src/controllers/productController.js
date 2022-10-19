
const productModel = require("../models/productModel");
const mongoose = require("mongoose");
const isObjectId = mongoose.Types.ObjectId.isValid;
const { uploadFile } = require("../AWS/aws");


const { checkEmptyBody, isValid, isValidObjectId, isValidPrice, isValidInstallments, isValidNum, isValidStyle, isValidTitle } = require("../validation/validation");


//----------------------create Product Details--------------------------->>>>>>>>>>>
const createProducts = async (req, res) => {
    try {
        // taking data from body
        let data = req.body;

        // taking image from body
        let files = req.files;

        // checking if body is empty or not
        if (!checkEmptyBody(data)) return res.status(400).send({ status: false, message: "please provide data to create product !!!" });

        // destructuring fields from data
        let { title, description, price, currencyId, currencyFormat, availableSizes, installments, style, isFreeShipping } = data;

        // checking the title
        if (!isValid(title)) return res.status(400).send({ status: false, message: "title is required." });
        if (!isValidTitle(title)) return res.status(400).send({ status: false, message: "enter an appropriate title." });   // check regex pattern

        // checking duplicate title
        let duplicateTitle = await productModel.findOne({ title: title });
        if (duplicateTitle) return res.status(400).send({ status: false, message: `title: ${title} already exist in DB.` });      // changes the string

        // checking for description
        if (!isValid(description)) return res.status(400).send({ status: false, message: "description required" });
        description = description.trim().split(" ").filter(word => word).join(" ");         // >>>>> hv to chk this

        // checking price
        if (!isValid(price)) return res.status(400).send({ status: false, message: "price required" });
        price = price.trim();
        if (!isValidPrice(price)) return res.status(400).send({ status: false, message: `Invalid price: ${price}.` });

        // checking currencyId
        if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId required" });
        currencyId = currencyId.trim().toUpperCase();
        // if (currencyId !== 'INR') return res.status(400).send({ status: false, message: "only indian -> (INR) currencyId is accepted" });
        if (!['INR', 'USD'].includes(currencyId)) return res.status(400).send({ status: false, message: `currencyId: ${currencyId} is invalid... you can only enter => 'INR' or 'USD'.` })

        //checking for currencyFormat
        if (!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "currency format required" });
        currencyFormat = currencyFormat.trim();
        if (currencyFormat !== '₹' && currencyFormat !== '$') return res.status(400).send({ status: false, message: "only indian currency (rupee: ₹) or US currency (dollar: $) accepted " });

        // getting aws link for image and setting it to body data
        if (files && files.length > 0) {
            data.productImage = await uploadFile(files[0]);
        } else {
            return res.status(400).send({ status: false, message: "please provide the productImage file." });
        }

        //checking for available Sizes of the products
        if (!isValid(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes required" });

        // taking size as array of string
        let sizesList = availableSizes.toUpperCase().split(",").map(x => x.trim());
        if (Array.isArray(sizesList)) {
            let sizeArr = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            for (let i = 0; i < sizesList.length; i++) {
                if (!sizeArr.includes(sizesList[i])) return res.status(400).send({ status: false, message: "Please Enter valid sizes, it should include only sizes: S, XS, M, X, L, XXL, XL." });
                data.availableSizes = sizesList;
            }
        }

        // if any non-mandatory fields are present in input

        if (style) {
            style = style.trim();
            if (!isValid(style) || !isValidStyle(style)) return res.status(400).send({ status: false, message: "please enter valid style" });
        }

        if (isFreeShipping) {
            isFreeShipping = isFreeShipping.trim();
            if (!(isFreeShipping === 'true' || isFreeShipping === 'false')) return res.status(400).send({ status: false, message: "isFreeShipping value should be only true or false " });
        }

        if (installments) {
            installments = installments.trim();
            if (!isValidInstallments(installments)) return res.status(400).send({ status: false, message: 'please enter installments as number' });
        }

        // creating product
        const createdProduct = await productModel.create(data);
        res.status(201).send({ status: true, message: 'Success', data: createdProduct });

    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}


//----------------------Get Product Details --------------------------->>>>>>>>>>>
const getProductsWithFilter = async (req, res) => {

    try {// taking query
        const queryParams = req.query;
        // console.log(JSON.parse(queryParams))
        const filterQueryData = { isDeleted: false };

        // destructuring the data got from query
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = queryParams;

        // checking if fields present then checking & adding values in query data
        if (size) {
            size = size.toUpperCase().trim().split(',')
            if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(size) === -1) return res.status(400).send({ status: false, message: 'Size should be between ["S", "XS", "M", "X", "L", "XXL", "XL"]' });
            filterQueryData['availableSizes'] = size;
        }
        if (name) {
            if (!isValid(name)) return res.status(400).send({ status: false, message: 'name is invalid' });
            filterQueryData['title'] = name;
        }

        // all type of price filter
        if (priceGreaterThan && priceLessThan) {

            if ((!isValidNum(priceGreaterThan)) || (!isValidNum(priceLessThan))) return res.status(400).send({ status: false, message: 'please provide priceGreaterThan && priceLessThan as number' });
            filterQueryData['price'] = { $gt: priceGreaterThan, $lt: priceLessThan };
        }
        if (priceGreaterThan && (!priceLessThan)) {
            if (!isValidNum(priceGreaterThan)) return res.status(400).send({ status: false, message: 'please provide priceGreaterThan as number' });
            filterQueryData['price'] = { $gt: priceGreaterThan };
        }
        if (priceLessThan && (!priceGreaterThan)) {
            if (!isValidNum(priceLessThan)) return res.status(400).send({ status: false, message: 'please provide priceLessThan as number' });
            filterQueryData['price'] = { $lt: priceLessThan };
        }

        // checking priceSort to fetch data in ascending or descending order from DB
        // if (priceSort) {
        //     if (priceSort === 1) {
        //         let foundProduct = await productModel.find(filterQueryData).sort({ price: 1 });
        //         if (!checkEmptyBody(foundProduct)) return res.status(404).send({ status: false, message: 'no product found' });
        //         return res.status(200).send({ status: true, message: 'Success', data: foundProduct });
        //     } else if (priceSort == -1) {
        //         let foundProduct = await productModel.find(filterQueryData).sort({ price: -1 });
        //         if (!checkEmptyBody(foundProduct)) return res.status(404).send({ status: false, message: 'no product found' });
        //         return res.status(200).send({ status: true, message: 'Success', data: foundProduct });
        //     } else {
        //         return res.status(400).send({ status: false, message: 'please provide priceSort (1 or -1)' });
        //     }
        // }

        if (priceSort) {
            if (priceSort !== 1 && priceSort !== -1) return res.status(400).send({ status: false, message: 'please provide priceSort (1 or -1)' });
            // priceSort = priceSort;
        }
        // querying in Db with filterData
        const finalData = await productModel.find(filterQueryData).sort({ price: priceSort });
        if (finalData.length === 0) return res.status(404).send({ status: false, message: 'no product found' });
        return res.status(200).send({ status: true, message: 'Success', data: finalData });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}


//----------------------Get Product Details--------------------------->>>>>>>>>>>
const getProductByID = async (req, res) => {
    try {

        // taking product ID from path param
        let productId = req.params.productId;
        productId = productId.trim();

        // validating productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: `ProductId: ${productId} is invalid.` });

        // fetching data from DB
        let getProduct = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!getProduct) return res.status(404).send({ status: false, message: `no Product found with the productId: ${productId}, or the requested product has already been deleted.` });

        // sending response
        return res.status(200).send({ status: true, message: 'Success', data: getProduct });

    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}


//----------------------update Product Details--------------------------->>>>>>>>>>>
const updateProduct = async function (req, res) {

    try {
        // taking product ID from path param
        let productId = req.params.productId;
        // taking body data
        let body = req.body;
        // taking files
        let files = req.files;

        // cjecking that body must not be empty & also no file present
        if (!checkEmptyBody(body) && files.length === 0) return res.status(400).send({ status: false, message: "plz enter some field to update a product." });

        // validating productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: `productId: ${productId} is invalid.` });

        // fetching data from DB
        const isPresent = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!isPresent) return res.status(404).send({ status: false, message: "product not found" });

        // destructuring fields from body data
        let { title, description, price, currencyId, currencyFormat, productImage, availableSizes, installments, style, isFreeShipping } = body;

        // checking the title
        if (title) {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "some value required for title." });

            // checking duplicate title
            let duplicateTitle = await productModel.findOne({ title: title });
            if (duplicateTitle) return res.status(400).send({ status: false, message: "title already exist in use" });
        }
        // checking for description
        if (description) {
            if (!isValid(description)) return res.status(400).send({ status: false, message: "some value required for description." });
        }
        // checking price
        if (price) {
            price = price.trim();
            if (!isValid(price)) return res.status(400).send({ status: false, message: "some value required for price." });
            if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "Invalid price format." });
        }

        // checking currencyId
        if (currencyId) {
            currencyId = currencyId.trim().toUpperCase();
            if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "some value required for currencyId." });
            if (currencyId !== 'INR') return res.status(400).send({ status: false, message: "only indian currencyId INR accepted." });        // hv to chk usd
        }

        //checking for currencyFormat
        if (currencyFormat) {
            currencyFormat = currencyFormat.trim();
            if (!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "some value required for currencyFormat." });
            if (currencyFormat != '₹') return res.status(400).send({ status: false, message: "only indian currency ₹ accepted." });
        }

        // getting aws link for image and setting it to body data
        if (productImage) return res.status(400).send({ status: false, message: "ProductImage format is invalid." });

        if (files && files.length > 0) {
            productImage = await uploadFile(files[0]);
        }

        //checking for available Sizes of the products
        // have to chk this sizelist
        if (availableSizes) {
            if (!isValid(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes required" });

            // taking size as array of string
            let sizesList = availableSizes.toUpperCase().split(",").map(x => x.trim())
            if (Array.isArray(sizesList)) {
                let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];
                for (let i = 0; i < sizesList.length; i++) {
                    if (!arr.includes(sizesList[i])) return res.status(400).send({ status: false, message: "Please Enter valid sizes, it should include only sizes from  (S,XS,M,X,L,XXL,XL) " });

                    // data.availableSizes = sizesList;
                }
                let db = isPresent.availableSizes
                for (let i = 0; i < sizesList.length; i++) {
                    let flag = 0
                    for (let j = 0; j < db.length; j++) {
                        if (sizesList[i] == db[j]) {
                            flag = 1
                        }
                    }
                    if (flag == 0) {
                        db.push(sizesList[i])
                    } else {
                        let index = db.indexOf(sizesList[i])
                        db.splice(index, 1)
                        console.log(index)
                    }
                }
                console.log(db, sizesList)
                availableSizes = db
            }
        }
        // if any non mandatory fields are present in input

        if (style) {
            if (!isValid(style) || !isValidStyle(style)) return res.status(400).send({ status: false, message: "please enter valid style" });
        }
        if (isFreeShipping) {
            if (!(isFreeShipping == 'true' || isFreeShipping == 'false')) return res.status(400).send({ status: false, message: "isFreeShipping value should be only true or false " });
        }
        if (installments) {
            if (!isValidInstallments(installments)) return res.status(400).send({ status: false, message: 'please enter installments as number' });
        }

        let updatedProduct = await productModel.findOneAndUpdate({ _id: product_id }, { $set: { title: title, description: description, price: price, currencyId: currencyId, currencyFormat: currencyFormat, isFreeShipping: isFreeShipping, productImage: productImage, style: style, availableSizes: availableSizes, installments: installments } }, { new: true })

        return res.status(200).send({ status: true, message: updatedProduct })
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


//----------------------delelete Product Details-------------------------->>>>>>>>
const deleteProductDetails = async (req, res) => {
    try {
        // taking productId from path params
        let productId = req.params.productId;
        productId = productId.trim();

        // validating productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: `productId: ${productId} is invalid.` });

        // fetching data from DB
        let productData = await productModel.findById(productId);
        if (!productData) return res.status(404).send({ status: false, message: `No product details found with the productId: ${productId}.` });

        // checking that the product already deleted or not
        if (productData.isDeleted === true) return res.status(404).send({ status: false, message: `the product with productId: ${productId}, has been deleted already.` });

        // deleting the product
        let deleteProduct = await productModel.findOneAndUpdate(
            { _id: productId },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        // sending response
        return res.status(200).send({ status: true, message: 'Success', data: deleteProduct });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}


module.exports = { createProducts, getProductByID, updateProduct, deleteProductDetails, getProductsWithFilter }