import { pool } from "../conf/dbConnection";

/**
 * Código HTTP cuando el producto no existe o está inactivo.
 * Por indicación del proyecto se responde 404; si se requiere el
 * comportamiento REST estándar, basta cambiar esta constante a 404.
 */
const NOT_FOUND_STATUS: any = 404;

const COLUMNS: any = "id, name, price, stock, description, brand, img, active";

const notFound = (res: any): any =>
  res.status(NOT_FOUND_STATUS).json({ ok: false, message: "Producto no encontrado o inactivo" });

const serverError = (res: any, err: any): any => {
  // Solo se registra el código; nunca se envía detalle al cliente
  console.error("Error de base de datos:", err?.code || err?.message);
  return res.status(500).json({ ok: false, message: "Error interno del servidor" });
};

const findActiveById = async (id: any): Promise<any> => {
  const [rows]: any = await pool.query(
    `SELECT ${COLUMNS} FROM products WHERE id = ? AND active = TRUE`,
    [id]
  );
  return rows[0] ?? null;
};

// Las entradas ya llegan validadas por express-validator (ver middlewares)

export const getAll = async (_req: any, res: any): Promise<any> => {
  try {
    const [rows]: any = await pool.query(
      `SELECT ${COLUMNS} FROM products WHERE active = ?`,
      [true]
    );
    return res.status(200).json({ ok: true, data: rows });
  } catch (err: any) {
    return serverError(res, err);
  }
};

export const getById = async (req: any, res: any): Promise<any> => {
  try {
    const product: any = await findActiveById(req.params.id);
    if (!product) return notFound(res);
    return res.status(200).json({ ok: true, data: product });
  } catch (err: any) {
    return serverError(res, err);
  }
};

export const create = async (req: any, res: any): Promise<any> => {
  const { name, price, stock, description, brand, img }: any = req.body;
  try {
    const [result]: any = await pool.query(
      "INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)",
      [name, Number(price), stock, description, brand ?? null, img ?? null]
    );
    const product: any = await findActiveById(result.insertId);
    return res.status(201).json({ ok: true, message: "Producto creado", data: product });
  } catch (err: any) {
    return serverError(res, err);
  }
};

export const update = async (req: any, res: any): Promise<any> => {
  const id: any = req.params.id;
  const { name, price, stock, description, brand, img }: any = req.body;
  try {
    if (!(await findActiveById(id))) return notFound(res);
    await pool.query(
      "UPDATE products SET name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ? WHERE id = ? AND active = TRUE",
      [name, Number(price), stock, description, brand ?? null, img ?? null, id]
    );
    const product: any = await findActiveById(id);
    return res.status(200).json({ ok: true, message: "Producto actualizado", data: product });
  } catch (err: any) {
    return serverError(res, err);
  }
};

export const remove = async (req: any, res: any): Promise<any> => {
  try {
    if (!(await findActiveById(req.params.id))) return notFound(res);
    // Baja lógica: nunca DELETE físico
    await pool.query("UPDATE products SET active = FALSE WHERE id = ?", [req.params.id]);
    return res.status(200).json({ ok: true, message: "Producto dado de baja" });
  } catch (err: any) {
    return serverError(res, err);
  }
};

export const changePrice = async (req: any, res: any): Promise<any> => {
  const id: any = req.params.id;
  try {
    if (!(await findActiveById(id))) return notFound(res);
    await pool.query("UPDATE products SET price = ? WHERE id = ? AND active = TRUE", [
      Number(req.body.price),
      id,
    ]);
    const product: any = await findActiveById(id);
    return res.status(200).json({ ok: true, message: "Precio actualizado", data: product });
  } catch (err: any) {
    return serverError(res, err);
  }
};
