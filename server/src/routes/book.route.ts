import { Router } from "express";
import protect from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorization.middleware";
import {
  createBook,
  deleteBook,
  getBookByID,
  getBooks,
  getMyBooks,
  updateBook,
} from "../controllers/book.controller";
import upload from "../middlewares/upload.middleware";

const router = Router();
router.post(
  "/",
  protect,
  authorizeRoles("author", "admin"),
  upload.single("image"),
  createBook,
);
router.get("/", getBooks);
router.get("/my", protect, authorizeRoles("author", "admin"), getMyBooks);
router.get("/:id", getBookByID);
router.delete("/:id", protect, authorizeRoles("author", "admin"), deleteBook);
router.put("/:id", protect, authorizeRoles("author", "admin"),upload.single("image"), updateBook);

export default router;
