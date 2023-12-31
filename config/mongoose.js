/**
 * 数据库连接
 */
const mongoose = require('mongoose')
const config = require('./index')
const log4js = require('./../utils/log4j')

mongoose.connect(config.urlConfig,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;

db.on('error',()=>{
    log4js.error('***mongoose数据库连接失败***')
})

db.on('open',()=>{
    log4js.info('***mongoose 数据库连接成功***')
})

module.exports = db;