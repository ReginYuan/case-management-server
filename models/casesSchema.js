const mongoose = require('mongoose')
const casesSchema = mongoose.Schema({
    caseId: String,
    caseName: String,
    caseDescribe: String,
    caseDate: String,
})

module.exports = mongoose.model("cases", casesSchema, "cases")