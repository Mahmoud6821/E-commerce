import { ErrorClass } from "../Utils/index.js";

export const getDocumentByName = (model) => {
  return async (req, res, next) => {
    const { name } = req.body;
    if (name) {
      const document = await model.findOne({ name });
      if (document) {
        return next(
          new ErrorClass(
            " this name already exists",
            400,
            " this name already exists"
          )
        );
      }
    }
    next();
  };
};

export const checkIfIdsExist = (model) => {
  return async (req, res, next) => {
    const { category, subCategory, brand } = req.query;
    //ids check
    const document = await model
      .findOne({
        _id: brand,
        categoryId: category,
        subCategoryId: subCategory,
      })
      .populate([
        { path: "categoryId", select: "customId" },
        { path: "subCategoryId", select: "customId" },
      ]);
    if (!document) {
      return next(
        new ErrorClass(
          `${model.modelName} is not found`,
          404,
          "this document not found"
        )
      );
    }

    req.document = document;
    next();
  };
};
