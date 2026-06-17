const mongoose = require ("mongoose");

const fileSchema = new mongoose.Schema({
  name: String,
  fileName:String,
  createdAt : { 
    type: Date, 
    default: Date.now 
  },
  statusHistory: [{
    status: String,
    updatedAt: Date
  }],
  path: String,
}, { timestamps: true });
const uploadedFile = mongoose.model("uploadedFile", fileSchema);
module.exports = uploadedFile;