const mongoose = require('mongoose')
const casesSchema = mongoose.Schema({
    caseId: String,
    caseName: String,
    caseDescribe: String,
    caseDate: {
        type: Date
    },
})

module.exports = mongoose.model("cases", casesSchema, "cases")