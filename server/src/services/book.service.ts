import { Types } from "mongoose";
import bookModel from "../models/books.model";
import { ApiError } from "../utils/ApiError";

interface BookInput {
  title: string;
  description: string;
  price: number;
  coverImage: string;
  stock: number;
}
export const createBook = async (
  { title, description, price, coverImage, stock }: BookInput,
  author: Types.ObjectId,
) => {
  if (
    !title ||
    !description ||
    price === undefined ||
    stock === undefined ||
    !coverImage
  ) {
    throw new ApiError("Missing required fields", 400);
  }

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof price !== "number" ||
    Number.isNaN(price) ||
    typeof stock !== "number" ||
    Number.isNaN(stock) ||
    typeof coverImage !== "string"
  ) {
    throw new ApiError(
      "Title, description, and cover image must be strings, stock and price must be a valid number",
      400,
    );
  }
  title = title.trim();
  description = description.trim();
  coverImage = coverImage.trim();
  if (!title || !description ) {
    throw new ApiError("Fields cannot be empty", 400);
  }
  if (price <= 0) {
    throw new ApiError("Invalid price", 400);
  }
  if (stock <= 0) {
    throw new ApiError("Invalid stock", 400);
  }
  const existingBook = await bookModel.findOne({ title: title, author });
  if (existingBook) {
    throw new ApiError("Book already exists", 400);
  }
  const createdBook = await bookModel.create({
    title,
    description,
    price,
    coverImage,
    author,
    stock,
  });
  return createdBook;
};
export interface BookFilter {
  author?: Types.ObjectId;
}
export const getBooks = async (
  skip: number,
  limit: number,
  filter: BookFilter,
) => {
  return bookModel
    .find(filter)
    .skip(skip)
    .limit(limit)
    .populate("author", "firstName lastName");
};

export const getBookByID = async (id: Types.ObjectId) => {
  const book = await bookModel
    .findById(id)
    .populate("author", "firstName lastName");
  if (!book) {
    throw new ApiError("Book Not Found", 404);
  }
  return book;
};

export const getMyBooks = async (userId: Types.ObjectId) => {
  const books = await bookModel
    .find({ author: userId })
    .populate("author", "firstName lastName email");
  return books;
};

export const checkOwnership = async (
  bookId: Types.ObjectId,
  userId: Types.ObjectId,
  role: "admin" | "author" | "user",
) => {
  const book = await bookModel.findById(bookId);
  if (!book) {
    throw new ApiError("Book Not Found", 404);
  }
  if (role === "admin") {
    return book;
  }
  if (!book.author.equals(userId)) {
    throw new ApiError("Forbidden", 403);
  }
  return book;
};
export const deleteBook = async (
  bookId: Types.ObjectId,
  userId: Types.ObjectId,
  role: "admin" | "author" | "user",
) => {
  const book = await checkOwnership(bookId, userId, role);
  await book.deleteOne();
};
export interface BookUpdateInput {
  title?: string;
  description?: string;
  price?: number;
  coverImage?: string;
  stock?: number;
}
export const updateBook = async (
  bookId: Types.ObjectId,
  userId: Types.ObjectId,
  role: "admin" | "author" | "user",
  cleanData: Partial<BookUpdateInput>,
) => {
  if (Object.keys(cleanData).length === 0) {
    throw new ApiError("No data to update", 400);
  }
  if (cleanData.title !== undefined) {
    if (typeof cleanData.title !== "string") {
      throw new ApiError("Title must be string", 400);
    }
    cleanData.title = cleanData.title.trim();
    if (!cleanData.title) {
      throw new ApiError("Title cannot be empty", 400);
    }
  }
  if (cleanData.description !== undefined) {
    if (typeof cleanData.description !== "string") {
      throw new ApiError("Description must be string", 400);
    }

    cleanData.description = cleanData.description.trim();

    if (!cleanData.description) {
      throw new ApiError("Description cannot be empty", 400);
    }
  }

  if (cleanData.coverImage !== undefined) {
    if (typeof cleanData.coverImage !== "string") {
      throw new ApiError("Cover Image must be string", 400);
    }

    cleanData.coverImage = cleanData.coverImage.trim();

    if (!cleanData.coverImage) {
      throw new ApiError("Cover Image cannot be empty", 400);
    }
  }

  if (cleanData.price !== undefined) {
    if (typeof cleanData.price !== "number" || Number.isNaN(cleanData.price)) {
      throw new ApiError("Price must be a valid number", 400);
    }

    if (cleanData.price <= 0) {
      throw new ApiError("Invalid price", 400);
    }
  }
  if (cleanData.stock !== undefined) {
    if (typeof cleanData.stock !== "number" || Number.isNaN(cleanData.stock)) {
      throw new ApiError("Price must be a valid number", 400);
    }

    if (cleanData.stock <= 0) {
      throw new ApiError("Invalid price", 400);
    }
  }
  const book = await checkOwnership(bookId, userId, role);
  Object.assign(book, cleanData);
  await book.save();
  return book;
};
