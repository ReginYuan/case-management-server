/**
 * 维护案件ID自增长表
 */
const mongoose = require('mongoose')
const caseConnectionSchema = mongoose.Schema({
    _id: String,
    sequence_value: Number
})

module.exports = mongoose.model("caseConnection", caseConnectionSchema, "caseConnection")