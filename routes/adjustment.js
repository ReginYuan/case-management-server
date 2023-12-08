const router = require("koa-router")();
const xlsx = require("xlsx");
const mongoose = require("mongoose");
const util = require("../utils/util");
const koaBody = require("koa-body");
const path = require("path");
const config = require("../config/index");
const log4js = require("./../utils/log4j");
router.prefix("/adjustment");

router.post(
  "/upload",
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, "../public/uploads"),
      keepExtensions: true
    }
  }),
  async (ctx) => {
    const file = ctx.request.files.file;
    const originalFileName = ctx.request.files.file.name;

    const { flowType, targetTable, caseName } = ctx.request.body;
    if (file) {
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // 使用 path 模块获取文件名的基本部分（去除后缀）
      const modelName = path.basename(
        originalFileName.replace(/\.xls$/, ""),
        path.extname(originalFileName)
      );

      try {
        if (caseName) {

          const dbConnection = mongoose.createConnection(
            config.urlConfig + caseName,
            { useNewUrlParser: true, useUnifiedTopology: true }
          );

          dbConnection.on("open", () => {
            log4js.info(`Connected to ${caseName} database`);
          });

          const ExcelDataSchema = new mongoose.Schema({
            sheetData: Array
          });

          // Use the model
          const ExcelData = dbConnection.model(modelName, ExcelDataSchema);

          // Create a new document
          const excelData = new ExcelData({ sheetData });

          // await excelData.create(sheetData);
          // Save the document
          await excelData
            .save()
            .then(() => {
              // 操作完成后关闭连接
              dbConnection.close();
            })
            .catch((err) => {
              console.error(err);
              // 在发生错误时也要关闭连接
              dbConnection.close();
            });

          ctx.status = 200;
          ctx.body = util.success({
            data: sheetData,
            message: "添加成功"
          });
        }
      } catch (error) {
        log4js.error(`操作异常：${error.message}`);
        ctx.status = 500;
        ctx.body = util.fail(`操作异常：${error.message}`);
      }
    } else {
      ctx.status = 400;
      ctx.body = {
        message: "上传失败"
      };
    }
  }
);

// 菜单列表查询
router.get('/list', async (ctx) => {
  const { menuName, menuState } = ctx.request.query;
  const params = {}
  if (menuName) params.menuName = menuName;
  if (menuState) params.menuState = menuState;
  let rootList = await Menu.find(params) || []
  const permissionList = util.getTreeMenu(rootList, null, [])
  ctx.body = util.success(permissionList);
})

module.exports = router;
