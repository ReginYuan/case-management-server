const router = require("koa-router")();
const xlsx = require("xlsx");
const mongoose = require("mongoose");
const util = require("../utils/util");
const koaBody = require("koa-body");
const path = require("path");
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
    const { flowType, targetTable } = ctx.request.body;
    if (file) {
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const modelName = sheetName.replace(/[^a-zA-Z0-9]/g, "");
      const collectionName = `excel_${modelName}_${Date.now()}`;
      const ExcelData = mongoose.model(
        modelName,
        new mongoose.Schema({
          sheetData: Array
        })
      );

      // Save the data to the corresponding MongoDB collection
      const excelData = new ExcelData({ sheetData });
      await excelData.save();

      // Return the processed data
      ctx.body = util.success({
        data: sheetData,
        message: `Generated ${collectionName} successfully`
      });
    } else {
      ctx.status = 400;
      ctx.body = {
        message: "Upload failed"
      };
    }
  }
);

module.exports = router;
