import * as joi from "joi";
import z from "zod";
import * as models from "./calculator.models";

export const CalculatorModel = joi.object<models.CalculatorModel>({
  left: joi.string(),
  right: joi.string(),
  operator: joi.string().valid(...models.OPERATORS),
  result: joi.number().required()
});

export const CounterState = joi.object<models.CounterState>({
  count: joi.number().required()
});

export const DigitPressed = z
  .object({
    digit: z.enum([...models.DIGITS])
  })
  .describe(
    "Generated when a **digit** is pressed\n\nThis is and example to use\n* markup language\n* inside descriptions"
  );

export const OperatorPressed = joi
  .object({
    operator: joi
      .string()
      .required()
      .valid(...models.OPERATORS)
  })
  .description("Generated when operator is pressed")
  .required();

// export const PressKey = joi
//   .object({
//     key: joi
//       .string()
//       .required()
//       .min(1)
//       .max(1)
//       .valid(...models.DIGITS, ...models.OPERATORS, ...models.SYMBOLS)
//   })
//   .description(
//     "Invoked when user presses a key - either digit, operator, or symbol"
//   )
//   .required();

export const PressKey = z
  .object({
    key: z.enum([...models.DIGITS, ...models.OPERATORS, ...models.SYMBOLS])
  })
  .describe(
    "Invoked when user presses a key - either digit, operator, or symbol"
  );

export const SubSubComplex = joi.object<models.SubSubComplex>({
  arrayFld: joi.array().items(joi.string()).required(),
  enumFld: joi
    .string()
    .valid(...Object.keys(models.ComplexEnum))
    .required()
});

export const SubComplex = joi.object<models.SubComplex>({
  stringFld: joi.string().required(),
  anotherObj: joi.array().items(SubSubComplex)
});

export const Complex = joi
  .object<models.Complex>({
    dateFld: joi.date(),
    numberFld: joi.number(),
    boolFld: joi.bool().optional(),
    guidFld: joi.string().guid().optional(),
    objFld: SubComplex
  })
  .presence("required")
  .description("This is a complex object");
