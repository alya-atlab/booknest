import { Request, Response } from "express";
import {
  createBook as createBookService,
  getBooks as getBooksService,
  getBookByID as getBookByIDService,
  deleteBook as deleteBookService,
  updateBook as updateBookService,
  BookUpdateInput,
  getMyBooks as getMyBooksService,
  BookFilter,
} from "../services/book.service";
import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError";
import { uploadImageToCloudinary } from "../services/cloudinary.service";

export const createBook = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new ApiError("Unauthorized", 401);
  const coverImage = req.file;
  if (!coverImage) {
    throw new ApiError("Cover image is required", 400);
  }
  const imageUrl = await uploadImageToCloudinary(
    coverImage.buffer,
    "book-covers",
  );

  const data = {
    ...req.body,
    price: Number(req.body.price),
    stock: Number(req.body.stock),
    coverImage: imageUrl,
  };

  const authorId = new Types.ObjectId(user._id);
  const createdBook = await createBookService(data, authorId);
  res.status(201).json({
    success: true,
    data: createdBook,
  });
};

export const getBooks = async (req: Request, res: Response) => {
  const { page, limit, author } = req.query as {
    page?: string;
    limit?: string;
    author?: string;
  };
  const filter: BookFilter = {};
  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;
  if (author) {
    filter.author = new Types.ObjectId(author);
  }
  const books = await getBooksService(skip, limitNumber, filter);
  res.status(200).json({
    success: true,
    data: books,
  });
};
export const getBookByID = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid ID", 400);
  }
  const bookId = new Types.ObjectId(id);

  const book = await getBookByIDService(bookId);
  res.status(200).json({
    success: true,
    data: book,
  });
};
export const getMyBooks = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) throw new ApiError("Unauthorized", 401);

  if (!Types.ObjectId.isValid(user._id)) {
    throw new ApiError("Invalid user ID", 400);
  }

  const userId = new Types.ObjectId(user._id);
  const books = await getMyBooksService(userId);

  res.status(200).json({
    success: true,
    data: books,
  });
};
export const deleteBook = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid ID", 400);
  }
  const bookId = new Types.ObjectId(id);
  const user = req.user;
  if (!user) throw new ApiError("Unauthorized", 401);
  const userId = new Types.ObjectId(user._id);
  const userRole = user.role;
  await deleteBookService(bookId, userId, userRole);
  res.status(204).json({
    success: true,
    message: "Book Deleted",
  });
};
interface Params {
  id?: string;
}
export const updateBook = async (req: Request<Params>, res: Response) => {
  const { id } = req.params;

  if (!id || !Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid ID", 400);
  }
  const bookId = new Types.ObjectId(id);
  const user = req.user;
  if (!user) throw new ApiError("Unauthorized", 401);
  const userId = new Types.ObjectId(user._id);
  const userRole = user.role;

  const body = req.body;
  const cleanData: Partial<BookUpdateInput> = {};

  const allowedFields: (keyof BookUpdateInput)[] = [
    "title",
    "description",
    "price",
    "coverImage",
    "stock",
  ];
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      cleanData[key] = body[key];
    }
  }
  if (Object.keys(cleanData).length === 0) {
    throw new ApiError("No valid fields to update", 400);
  }

  const book = await updateBookService(bookId, userId, userRole, cleanData);
  res.status(200).json({
    success: true,
    data: book,
  });
};
