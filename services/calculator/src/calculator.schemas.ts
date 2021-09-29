import * as joi from "joi";
import { DIGITS, OPERATORS, SYMBOLS } from "./calculator.models";

export const DigitPressed = joi.object({
  name: joi.string().required().valid("DigitPressed"),
  data: joi.object({
    digit: joi
      .string()
      .required()
      .valid(...DIGITS)
  })
});
export const DotPressed = joi.object({
  name: joi.string().required().valid("DotPressed")
});

export const EqualsPressed = joi.object({
  name: joi.string().required().valid("EqualsPressed")
});

export const OperatorPressed = joi.object({
  name: joi.string().required().valid("OperatorPressed"),
  data: joi.object({
    operator: joi
      .string()
      .required()
      .valid(...OPERATORS)
  })
});

export const Cleared = joi.object({
  name: joi.string().required().valid("Cleared")
});

export const PressKey = joi.object({
  name: joi.string().required().valid("PressKey"),
  data: joi.object({
    key: joi
      .string()
      .required()
      .min(1)
      .max(1)
      .valid(...DIGITS, ...OPERATORS, ...SYMBOLS)
  })
});

export const Reset = joi.object({
  name: joi.string().required().valid("Reset")
});