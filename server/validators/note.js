import * as Yup from "yup";

import formDataToObject from "../utils/formDataToObject.js";
import ErrorUtils, { Unprocessable } from "../utils/errors.js";

export const noteSchema = Yup.object({
  body: Yup.object({
    title: Yup.string()
      .required("Поле обязательно!")
      .min(3, "Минимальная длина - 3 символа")
      .max(1000, "Максимальная длина - 100 символов"),
    content: Yup.string()
      .required("Поле обязательно!")
      .min(3, "Минимальная длина - 3 символа")
      .max(30000, "Максимальная длина - 30000 символов"),
    journal: Yup.object({
      title: Yup.string()
        .required("Поле обязательно!")
        .min(1, "Минимальная длина - 1 символа")
        .max(1000, "Максимальная длина - 100 символов"),
      journal_id: Yup.number().required("Поле обязательно!"),
    }),
    tags: Yup.array().of(
      //{tag_id: 14, title: "sdfsdfsdfsdfsdf", selectJournal: {title: "Все", journal_id: null}}
      Yup.object({
        title: Yup.string()
          .required("Поле обязательно!")
          .min(1, "Минимальная длина - 1 символа")
          .max(100, "Максимальная длина - 100 символов"),
        tag_id: Yup.number().required("Поле обязательно!"),
        selectJournal: Yup.object({
          title: Yup.string()
            .required("Поле обязательно!")
            .min(1, "Минимальная длина - 1 символа")
            .max(100, "Максимальная длина - 100 символов"),
        }),
      })
    ),
  }),
});

class NoteValidator {
  static async noteValidate(req, res, next) {
    return validateRequest(req, res, next, noteSchema);
  }
}

const validateRequest = async (req, res, next, schema) => {
  try {
    const data = formDataToObject(req.body);
    if (schema) {
      await schema.validate({ body: data });
    }

    return next();
  } catch ({ path, errors }) {
    return ErrorUtils.catchError(
      res,
      new Unprocessable(JSON.stringify({ path, errors }))
    );
  }
};

export default NoteValidator;
