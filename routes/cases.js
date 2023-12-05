const router = require("koa-router")();
const util = require("../utils/util");
const cases = require("./../models/casesSchema");
// const caseConnection = require("./../models/caseConnectionSchema");
const mongoose = require("mongoose");
const config = require("../config/index");
router.prefix("/cases");


// Get the next sequence number formatted as a 3-digit string
async function getNextSequenceValue() {
  const count = await cases.countDocuments(); // Get the total count of existing cases
  return (count + 1).toString().padStart(3, '0');
}


//所有案件列表
router.get("/list", async (ctx) => {
  try {
    let casesList = await cases.find(
      {},
      "caseId caseName caseDescribe caseDate"
    );
    ctx.body = util.success(casesList);
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});

// 案件操作：创建、编辑、删除
router.post("/operate", async (ctx) => {
  const { _id, action, caseDate, caseName, caseDescribe, params } =
    ctx.request.body;
  let res, info;
  try {
    if (action == "create") {
      const currentDate = caseDate.replace(/-/g, ''); // Format as YYYYMMDD
      const sequenceNumber = await getNextSequenceValue();
      const caseIdnew = `${currentDate}${sequenceNumber}`;
      if (caseDate && caseIdnew) {
        let params = {
          caseDate,
          caseName,
          caseDescribe,
          caseId: caseIdnew
        };
        await cases.create(params);
        // Create a new MongoDB connection for the new caseName
        mongoose.createConnection(config.urlConfig + caseName);
        const newDBConnection = mongoose.createConnection(
          config.urlConfig + caseName
        );
        const DummyModel = newDBConnection.model(
          "Dummy",
          new mongoose.Schema({})
        );
        await DummyModel.create({});
        info = "创建成功";
      } else {
        info = "创建失败";
      }
    } else if (action == "edit") {
      params.updateTime = new Date();
      await cases.findByIdAndUpdate(_id, params);
      info = "编辑成功";
    } else if (action == "delete") {
      await cases.findByIdAndRemove(_id);
      await cases.deleteMany({ parentId: { $all: [_id] } });
      info = "删除成功";
    }
    ctx.body = util.success("", info);
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});

module.exports = router;
