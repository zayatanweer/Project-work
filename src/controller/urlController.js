const urlModel = require('../model/urlModel')
const shortId = require('shortid')
const url = require('validator')


//-------we using redis here------//
const redis = require('redis');
const { promisify } = require("util");
const redisClient = redis.createClient(
    11295,
    "redis-11295.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("PlOG4VJlbIKrBaq3gWNykxuj358wPnBu", (err) => {
    if (err) throw err;
});
redisClient.on("connect", async () => {
    console.log("Connected to Redis Server Successfully");
});
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//---------Redis command ends---------------------




const createUrl = async function (req, res) {
    try {
        const cachedData = await GET_ASYNC(`${req.body.longUrl}`)
        let data = req.body
        if (cachedData) {
            // console.log("CreateUrl,This data is fetched from cached data stored in cached memory")
            return res.status(200).send({ status: true, data: JSON.parse(cachedData) });
            
        }
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "body is empty" })
        }
        if (!data.longUrl) {
            return res.status(400).send({ status: false, msg: "longUrl is required" })
        }
        if (typeof data.longUrl != "string") {
            return res.status(400).send({ status: false, msg: 'long url is invalid' })
        }
        if (!(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(data.longUrl))){
            // if (!url.isURL(data.longUrl)) {
                return res.status(400).send({ status: false, msg: "long url is invalid" })
            }
        let urlCode = shortId.generate().toLowerCase()
        let shortUrl = `http://localhost:3000/${urlCode}`
        data.urlCode = urlCode;
        data.shortUrl = shortUrl
        const urlDetails = await urlModel.create(data)
        const myResult = await SET_ASYNC(`${urlDetails.longUrl}`, JSON.stringify(urlDetails), "EX", 20);
        // console.log("This response data is now stored in Cached Memory for next 20 sec", myResult);
        return res.status(201).send({ status: true, data: urlDetails });
    }
    catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}





const getUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        const cachedData = await GET_ASYNC(`${urlCode}`)
        if (cachedData) {
            // console.log("data is coming from redis")
            return res.status(302).redirect(cachedData.longUrl)
        }
        // if (!urlCode) return res.status(400).send({ status: false, msg: "longUrl is required" })
        let urlDetails = await urlModel.findOne({ urlCode: urlCode })
        if (!urlDetails) return res.status(404).send({ status: false, message: "URL not found" })
        //    console.log("data is coming from mongoDB")
        const myResult = await SET_ASYNC(`${urlDetails.urlCode}`, JSON.stringify(urlDetails), "EX", 20);
        return res.status(302).redirect(urlDetails.longUrl)
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message })
    }
}
module.exports = { createUrl, getUrl };