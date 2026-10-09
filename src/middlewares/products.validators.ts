import { body, param, query, validationResult } from "express-validator";

// Número (o string numérico) > 0, máximo 2 decimales, dentro de DECIMAL(10,2)
export const isValidPrice = (price: any): boolean => {
  let n: any;
  if (typeof price === "number") {
    n = price;
  } else if (typeof price === "string") {
    if (!/^\d+(\.\d{1,2})?$/.test(price.trim())) return false;
    n = Number(price);
  } else {
    return false;
  }
  if (!Number.isFinite(n) || n <= 0 || n > 99999999.99) return false;
  return Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;
};

// Corta la petición con 400 si alguna regla falló
export const handleValidation = (req: any, res: any, next: any): any => {
  const result: any = validationResult(req);
  if (result.isEmpty()) return next();
  return res.status(400).json({
    ok: false,
    message: "Datos inválidos",
    errors: result.array().map((e: any) => ({ field: e.path, message: e.msg })),
  });
};

const priceRule: any = body("price")
  .custom(isValidPrice)
  .withMessage("price debe ser numérico, mayor que cero y con máximo 2 decimales");

export const idRules: any = [
  param("id").isInt({ min: 1, max: 2147483647 }).withMessage("El id debe ser un entero positivo").toInt(),
];

export const getAllRules: any = [
  query("active")
    .optional()
    .custom((v: any) => String(v).toLowerCase() === "true")
    .withMessage("El query param active solo acepta el valor TRUE"),
];

export const productRules: any = [
  body("name").isString().trim().notEmpty().withMessage("name es obligatorio y debe ser texto"),
  priceRule,
  body("stock").isInt({ min: 0 }).withMessage("stock debe ser un entero mayor o igual a 0").toInt(),
  body("description").isString().trim().notEmpty().withMessage("description es obligatorio y debe ser texto"),
  body("brand").optional({ nullable: true }).isString().withMessage("brand debe ser texto"),
  body("img").optional({ nullable: true }).isString().withMessage("img debe ser texto"),
];

export const priceOnlyRules: any = [
  body()
    .custom((b: any) => {
      const keys: any = Object.keys(b ?? {});
      return keys.length === 1 && keys[0] === "price";
    })
    .withMessage("El cuerpo debe contener únicamente el campo price"),
  priceRule,
];
