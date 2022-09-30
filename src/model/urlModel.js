const mongoose = require('mongoose');
const urlSchema = new mongoose.Schema( {

    urlCode: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true
        },
        longUrl: {
          type: String,
          required: true,
        },
        shortUrl: {
            type: String,
            required: true,
            unique: true
        } 
      },{timestamps: true});

module.exports = mongoose.model('Urls', urlSchema)






// function countFre(str){
//   let obj={}
//   for (let i=0;i<str.length;i++) {
//     obj[str[i]]=(obj[str[i]] || 0)+1

//   }
   
    
//   console.log(obj)
// }
// console.log(countFre("ruppaalli"))