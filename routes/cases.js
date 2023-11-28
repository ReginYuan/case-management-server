const router = require("koa-router")();
const util = require("../utils/util");
const cases = require("./../models/casesSchema");
const caseConnection = require("./../models/caseConnectionSchema");
router.prefix("/cases");

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
      const doc = await caseConnection.findOneAndUpdate(
        { _id: "caseId" },
        { $inc: { sequence_value: 1 } },
        { new: true }
      );
      if (doc && doc.sequence_value) {
        let params = {
          caseDate,
          caseName,
          caseDescribe,
          caseId: doc.sequence_value
        };
        await cases.create(params);
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
