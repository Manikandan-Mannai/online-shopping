import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { url, setHeaders } from "./api";

const initialState = {
    list: [],
    status: null,
};

export const ordersFetch = createAsyncThunk("orders/ordersFetch", async () => {
    try {
        const response = await axios.get(`${url}/orders`, setHeaders());
        return response.data;
    } catch (error) {
        console.log(error);
    }
});

export const ordersEdit = createAsyncThunk(
    "orders/ordersEdit",
    async (values, { getState }) => {
        const state = getState();
        let currentOrder = state.orders.list.filter(
            (order) => order.id === values.id
        );

        const newOrder = {
            ...currentOrder[0],
            delivery_status: values.delivery_status,
        };

        try {
            const response = await axios.put(
                `${url}/orders/${values.id}`,
                newOrder,
                setHeaders()
            );
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
);

export const cancelOrder = createAsyncThunk(
    "orders/cancelOrder",
    async ({ orderId }) => {
        try {
            const response = await axios.put(
                `${url}/orders/cancel/${orderId}`,
                {},
                setHeaders()
            );
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
);

export const returnRequest = createAsyncThunk(
    "orders/returnRequest",
    async ({ orderId }) => {
        try {
            const response = await axios.put(
                `${url}/orders/request/return/${orderId}`,
                {},
                setHeaders()
            );
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
);


export const approveReturnRequest = createAsyncThunk(
    "orders/approveReturnRequest",
    async ({ orderId }) => {
        try {
            const response = await axios.put(
                `${url}/orders/request/approve/return/${orderId}`,
                {},
                setHeaders()
            );
            return { orderId, data: response.data }; // Include orderId in the response
        } catch (error) {
            console.log(error);
            throw error; // Re-throw the error so it can be caught in the component
        }
    }
);


export const denyReturnRequest = createAsyncThunk(
    "orders/denyReturnRequest",
    async ({ orderId }) => {
        try {
            const response = await axios.put(
                `${url}/orders/request/deny/return/${orderId}`,
                {},
                setHeaders()
            );
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
);

const ordersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {},
    extraReducers: {
        [ordersFetch.pending]: (state) => {
            state.status = "pending";
        },
        [ordersFetch.fulfilled]: (state, action) => {
            state.list = action.payload;
            state.status = "fulfilled";
        },
        [ordersFetch.rejected]: (state) => {
            state.status = "rejected";
        },
        [ordersEdit.pending]: (state) => {
            state.status = "pending";
        },
        [ordersEdit.fulfilled]: (state, action) => {
            const updatedOrders = state.list.map((order) =>
                order._id === action.payload._id ? action.payload : order
            );
            state.list = updatedOrders;
            state.status = "success";
        },
        [ordersEdit.rejected]: (state) => {
            state.status = "rejected";
        },
        [approveReturnRequest.pending]: (state) => {
            state.status = "pending";
        },
        // [approveReturnRequest.fulfilled]: (state, action) => {
        //     const { orderId, data } = action.payload;
        //     const updatedOrders = state.list.map((order) =>
        //         order._id === orderId ? { ...order, delivery_status: data.delivery_status } : order
        //     );
        //     state.list = updatedOrders;
        //     state.status = "success";
        // },
        [approveReturnRequest.fulfilled]: (state, action) => {
            const { orderId, data } = action.payload;
            const updatedOrders = state.list.map((order) =>
                order._id === orderId ? { ...order, delivery_status: data.delivery_status } : order
            );
            return {
                ...state,
                list: updatedOrders,
                status: "success",
            };
        },
        [approveReturnRequest.rejected]: (state) => {
            state.status = "rejected";
        },
        [denyReturnRequest.pending]: (state) => {
            state.status = "pending";
        },
        [denyReturnRequest.fulfilled]: (state, action) => {
            const updatedOrders = state.list.map((order) =>
                order._id === action.payload?._id ? action.payload : order
            );
            state.list = updatedOrders;
            state.status = "success";
        },
        [denyReturnRequest.rejected]: (state) => {
            state.status = "rejected";
        },
        [cancelOrder.pending]: (state) => {
            state.status = "pending";
        },
        [cancelOrder.fulfilled]: (state, action) => {
            const updatedOrders = state.list.map((order) =>
                order._id === action.payload._id ? action.payload : order
            );
            state.list = updatedOrders;
            state.status = "success";
        },
        [cancelOrder.rejected]: (state) => {
            state.status = "rejected";
        },
    },
});

export default ordersSlice.reducer;
