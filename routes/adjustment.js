const router = require("koa-router")();
const xlsx = require("xlsx");
const mongoose = require("mongoose");

router.prefix("/adjustment");

// 案件操作：创建、编辑、删除
router.post("/upload", async (ctx) => {
  const file = ctx.request.files.file;

  if (file) {
    // 从上传的文件中读取Excel数据
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // 使用表名动态创建数据模型和对应的MongoDB集合
    const modelName = sheetName.replace(/[^a-zA-Z0-9]/g, ""); // 移除非字母数字字符
    const collectionName = `excel_${modelName}_${Date.now()}`; // 添加时间戳或其他标识
    const ExcelData = mongoose.model(
      modelName,
      new mongoose.Schema({
        sheetData: Array
      })
    );

    // 将数据存储到对应的MongoDB集合中
    const excelData = new ExcelData({ sheetData });
    await excelData.save();

    // 返回处理后的数据
    ctx.body = util.success({
      data: sheetData,
      message: `生成返回的 ${collectionName} 成功`
    });
  } else {
    ctx.status = 400;
    ctx.body = {
      message: "上传失败"
    };
  }
});

module.exports = router;
