import { Router } from "express";
import {
  getAll,
  getById,
  create,
  update,
  remove,
  changePrice,
} from "../controllers/products.controller";
import {
  getAllRules,
  idRules,
  productRules,
  priceOnlyRules,
  handleValidation,
} from "../middlewares/products.validators";

const router: any = Router();

router.get("/getAll", getAllRules, handleValidation, getAll);
router.get("/getById/:id", idRules, handleValidation, getById);
router.post("/create", productRules, handleValidation, create);
router.put("/update/:id", idRules, productRules, handleValidation, update);
router.delete("/delete/:id", idRules, handleValidation, remove);
router.patch("/change-price/:id", idRules, priceOnlyRules, handleValidation, changePrice);

export default router;
