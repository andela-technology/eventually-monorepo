import z from "zod";
import { config as target, extend } from "@rotorsoft/eventually";

/**
 * OpenAPI spec options
 * @default SwaggerUI
 * @enum
 */
export enum OAS_UIS {
  SwaggerUI = "SwaggerUI",
  Rapidoc = "Rapidoc",
  Redoc = "Redoc"
}

/**
 * Configuration zod schema
 */
const Schema = z.object({
  port: z.number().int().min(1000).max(65535),
  oas_ui: z.nativeEnum(OAS_UIS)
});

const { PORT, OAS_UI } = process.env;

/**
 * Express configuration options
 */
export const config = extend(
  {
    port: Number.parseInt(PORT || "3000"),
    oas_ui: OAS_UI || OAS_UIS.SwaggerUI
  },
  Schema,
  target()
);
