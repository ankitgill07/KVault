import Category from "../../models/categoryModel.js";

export const createCategory = async (data: {
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategory?: string;
}): Promise<any> => {
  try {
    const category = await Category.create(data);
    return category;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("Category with this name or slug already exists");
    }
    throw error;
  }
};

export const getAllCategories = async (): Promise<any[]> => {
  try {
    return await Category.find({ isActive: true }).sort({ name: 1 });
  } catch (error) {
    throw error;
  }
};

export const getCategoryById = async (id: string): Promise<any> => {
  try {
    return await Category.findById(id);
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (id: string, data: any): Promise<any> => {
  try {
    return await Category.findByIdAndUpdate(id, data, { returnDocument: "after" });
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("Category with this name or slug already exists");
    }
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await Category.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};
