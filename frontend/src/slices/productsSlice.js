import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { url, setHeaders } from "./api";
import { toast } from "react-toastify";

const initialState = {
  items: [],
  status: null,
  createStatus: null,
  editStatus: null,
  deleteStatus: null
};

export const productsFetch = createAsyncThunk(
  "products/productsFetch",
  async () => {
    try {
      const response = await axios.get(
        `${url}/products`
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const productsCreate = createAsyncThunk(
  "products/productsCreate",
  async (values) => {
    try {
      const response = await axios.post(
        `https://e-commerce-ylbo.onrender.com/api/products`,
        values,
        setHeaders()
      );

      return response.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data);
    }
  }
);

export const productsEdit = createAsyncThunk(
  "products/productsEdit",
  async (values) => {
    try {
      const response = await axios.put(
        `${url}/products/${values.product._id}`,
        values,
        setHeaders()
      );
      return response.data;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data);
    }
  }
);



export const productsDelete = createAsyncThunk(
  "products/productsDelete",
  async (id) => {
    try {
      const response = await axios.delete(
        `https://e-commerce-ylbo.onrender.com/api/products/${id}`,
        setHeaders()
      );
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data);
    }
  }
);


const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: {
    // FETCH
    [productsFetch.pending]: (state, action) => {
      state.status = "pending";
    },
    [productsFetch.fulfilled]: (state, action) => {
      state.items = action.payload;
      state.status = "success";
    },
    [productsFetch.rejected]: (state, action) => {
      state.status = "rejected";
    },
    // CREATE
    [productsCreate.pending]: (state, action) => {
      state.createStatus = "pending";
    },
    [productsCreate.fulfilled]: (state, action) => {
      state.items.push(action.payload);
      state.createStatus = "success";
      toast.success("Product Created!");
    },
    [productsCreate.rejected]: (state, action) => {
      state.createStatus = "rejected";
    },

    // UPDATED
    [productsEdit.pending]: (state, action) => {
      state.editStatus = "pending";
    },

    [productsEdit.fulfilled]: (state, action) => {
      if (action.payload && action.payload._id) {
        const updatedProducts = state.items.map((product) =>
          product._id === action.payload._id ? action.payload : product
        );
        state.items = updatedProducts;
        state.editStatus = "success";
        toast.info("Product Edited");
      } else {
        state.editStatus = "error";
        toast.error("Error editing product");
      }
    },
    [productsEdit.rejected]: (state, action) => {
      state.editStatus = "rejected";
    },

    // DELETE
    [productsDelete.pending]: (state, action) => {
      state.deleteStatus = "pending";
    },
    [productsDelete.fulfilled]: (state, action) => {
      if (action.payload && action.payload._id) {
        const newlist = state.items.filter((item) => item._id !== action.payload._id);
        state.items = newlist;
        state.deleteStatus = "success";
        toast.error("Product Deleted");
      } else {
        // Handle the case where action.payload or action.payload._id is undefined.
        // You can add error handling or log an error message here.
      }
    },
    [productsDelete.rejected]: (state, action) => {
      state.deleteStatus = "rejected";
    },
  },
});

export default productsSlice.reducer;
