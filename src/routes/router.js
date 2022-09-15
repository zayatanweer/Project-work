const express = require('express');
const router = express.Router()
const collegeController= require("../controllers/collegeController")
const internController = require("../controllers/internController")

// router.get("/first-test", {
//     msg: "my first api"
// })

router.post("/functionup/colleges", collegeController.createCollege)
router.post("/functionup/interns",internController.createIntern)
router.get("/functionup/collegeDetails", internController.collegeDetails)



module.exports = router;