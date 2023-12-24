import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { url, setHeaders } from "../slices/api";
import {
  FaTruck,
  FaCheck,
  FaExclamation,
  FaUndo,
  FaTimes,
  FaBan,
  FaCheckCircle,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { cancelOrder, returnRequest } from "../slices/ordersSlice";

const Profile = () => {
  const [orders, setOrders] = useState([]);
  // const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const response = await axios.get(`${url}/orders/user`, setHeaders());
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserOrders();
  }, [auth]);

  const updateOrderButtonText = (orderId, newText) => {
    setOrders((prevOrders) => {
      const updatedOrders = prevOrders.map((order) =>
        order._id === orderId ? { ...order, buttonText: newText } : order
      );
      return updatedOrders;
    });
  };

  const resetOrderButtonText = (orderId) => {
    setOrders((prevOrders) => {
      const updatedOrders = prevOrders.map((order) =>
        order._id === orderId ? { ...order, buttonText: undefined } : order
      );
      return updatedOrders;
    });
  };

  const handleCancelOrder = async (orderId, deliveryStatus) => {
    try {
      if (deliveryStatus === "pending") {
        updateOrderButtonText(orderId, "Canceling...");
        await axios.put(`${url}/orders/cancel/${orderId}`, {}, setHeaders());
        dispatch(cancelOrder({ orderId }));
        toast.success("Order canceled successfully!");
      } else if (deliveryStatus === "cancel requested") {
        toast.info("Cancel request is already pending for this order.");
      } else {
        toast.info("Cannot cancel this order. It may have already been processed.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to cancel order. Please try again.");
      resetOrderButtonText(orderId);
    }
  };

  const handleReturnOrder = async (orderId, deliveryStatus) => {
    try {
      updateOrderButtonText(orderId, "Returning...");
      await axios.put(`${url}/orders/return/${orderId}`, {}, setHeaders());
      dispatch(returnRequest({ orderId }));
      toast.error("Return Requested!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to return order. Please try again.");
      resetOrderButtonText(orderId);
    }
  };

  const toggleShowAllOrders = () => {
    setShowAllOrders(!showAllOrders);
  };

  const visibleOrders = showAllOrders ? orders : orders.slice(0, 5);

  const getDeliveryStatus = (status) => {
    switch (status) {
      case "pending":
        return (
          <PendingStatus>
            <FaExclamation /> Pending
          </PendingStatus>
        );
      case "dispatched":
        return (
          <DispatchedStatus>
            <FaTruck /> Dispatched
          </DispatchedStatus>
        );
      case "delivered":
        return (
          <DeliveredStatus>
            <FaCheck /> Delivered
          </DeliveredStatus>
        );
      case "canceled":
        return (
          <CancelledStatus>
            <FaTimes /> Canceled
          </CancelledStatus>
        );
      case "returned":
        return (
          <ReturnedStatus>
            <FaUndo /> Return Applied
          </ReturnedStatus>
        );
      case "return_denied":
        return (
          <ReturnDeniedStatus>
            <FaBan /> Return Denied
          </ReturnDeniedStatus>
        );
      case "return_approved":
        return (
          <ReturnApprovedStatus>
            <FaCheckCircle /> Return Approved
          </ReturnApprovedStatus>
        );
      case "return_requested":
        return (
          <ReturnRequestedStatus>
            <FaUndo /> Return Requested
          </ReturnRequestedStatus>
        );
      default:
        return "Error";
    }
  };

  const formatCurrency = (amount) => `₹${(amount / 100).toFixed(2)}`;

  return (
    <ProfileContainer>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <ProfileInfo>
            <h2>Profile Information</h2>
            <p>Name: {auth.name}</p>
            <p>Email: {auth.email}</p>
          </ProfileInfo>
          {visibleOrders.length > 0 ? (
            <OrdersContainer>
              <h2>My Orders</h2>
                {visibleOrders.map((order) => (
                  <OrderCard key={order._id}>
                  <OrderHeader >
                    <div>ORDER PLACED: {new Date(order.createdAt).toDateString()}</div>
                    <div>TOTAL: {formatCurrency(order.total)}</div>
                    {order.shipping && (
                      <div>
                        SHIP TO: {order.shipping.address.line1}, {order.shipping.address.city},{" "}
                        {order.shipping.address.state} {order.shipping.address.postal_code}
                      </div>
                    )}
                    <div>ORDER ID: {order._id}</div>
                    <div>Delivered Status: {getDeliveryStatus(order.delivery_status)}</div>
                  </OrderHeader>
                  <OrderProducts>
                    {order.products.map((product) => (
                      <ProductItem key={product.id}>
                        <ProductImage src={product.image_url} alt={product.description} />
                        <div>
                          {/* <p>ID: {order._id}</p> */}
                          <p>Name: {product.name}</p>
                          <p>Quantity: {product.quantity}</p>
                        </div>
                      </ProductItem>
                    ))}
                  </OrderProducts>
                  <OrderActions>
                    {order.delivery_status === "pending" && (
                      <CancelButton
                        onClick={() => handleCancelOrder(order._id, order.delivery_status)}
                        disabled={order.buttonText !== undefined}
                      >
                        {order.buttonText || "Cancel Order"}
                      </CancelButton>
                    )}
                    {order.delivery_status === "delivered" && (
                      <ReturnButton
                        onClick={() => handleReturnOrder(order._id, order.delivery_status)}
                        disabled={order.buttonText !== undefined}
                      >
                        {order.buttonText || "Return Order"}
                      </ReturnButton>
                    )}
                  </OrderActions>
                </OrderCard>
              ))}
            </OrdersContainer>
          ) : (
            <NoOrdersContainer>
              <h2>No Orders</h2>
              <p>You have no orders. Start shopping now!</p>
              <ShopNowButton onClick={() => navigate("/shop")}>Shop Now</ShopNowButton>
            </NoOrdersContainer>
          )}
          {orders.length > 5 && (
            <LoadMoreButton onClick={toggleShowAllOrders}>
              {showAllOrders ? "Show Fewer Orders" : "Load More Orders"}
            </LoadMoreButton>
          )}
        </div>
      )}
    </ProfileContainer>
  );
};

export default Profile;


const NoOrdersContainer = styled.div`
  text-align: center;
  padding: 20px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: #f0f0f0;
  margin: 20px 0;

  h2 {
    font-size: 24px;
    margin-bottom: 10px;
  }

  p {
    font-size: 16px;
  }
`;

const ShopNowButton = styled.button`
  background-color: #007bff;
  color: #fff;
  font-size: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const PendingStatus = styled.span`
  color: orange;
`;

const DispatchedStatus = styled.span`
  color: green;
`;

const DeliveredStatus = styled.span`
  color: blue;
`;

const ProfileContainer = styled.div`
  padding: 20px;
`;

const ProfileInfo = styled.div`
  margin-bottom: 20px;
  h2 {
    font-size: 20px;
  }
`;

const OrdersContainer = styled.div`
  h2 {
    font-size: 20px;
  }
`;

const OrderCard = styled.div`
  margin: 20px 0;
  padding: 10px;
  border: 1px solid #ddd;
`;

const OrderHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 10px;
  div {
    flex: 1;
    margin-right: 10px;
  }
`;

const OrderProducts = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const ProductItem = styled.div`
  margin: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  width: 200px;
`;

const LoadMoreButton = styled.button`
  background-color: #007BFF;
  color: #fff;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
`;

const OrderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;

  button {
    margin-left: 10px;
  }
`;

const CancelButton = styled.button`
  background-color: #dc3545;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ReturnButton = styled.button`
  background-color: #28a745;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const CancelledStatus = styled.span`
  color: red;
`;

const ReturnedStatus = styled.span`
  color: purple;
`;

const ReturnDeniedStatus = styled.span`
  color: rosybrown;
`;

const ReturnApprovedStatus = styled.span`
  color: greenyellow;
`;

const ReturnRequestedStatus = styled.span`
  color: orange;
`;

const ProductImage = styled.img`
  max-width: 50px; 
  `;