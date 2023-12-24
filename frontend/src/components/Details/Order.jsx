import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import axios from "axios";
import { setHeaders, url } from "../../slices/api";
import {
  FaTruck,
  FaCheck,
  FaExclamation,
  FaUndo,
  FaTimes,
  FaBan,
  FaCheckCircle,
} from "react-icons/fa";
const Order = () => {
  const params = useParams();
  const [order, setOrder] = useState(3);
  const [loading, setLoading] = useState(false);
  console.log("order", order);
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${url}/orders/findOne/${params.id}`, setHeaders());
        setOrder(res.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchOrder();
  }, [params.id]);

  return (
    <StyledOrder>
      {loading ? (
        <Loading>Loading ...</Loading>
      ) : (
        <OrdersContainer>
          <h2>Order Details</h2>
          <DeliveryStatus>
            <span>Delivery Status: </span>
            {(() => {
              switch (order.delivery_status) {
                case 'pending':
                  return <Pending><FaExclamation /> Pending</Pending>;
                case 'dispatched':
                  return <Dispatched><FaTruck /> Dispatched</Dispatched>;
                case 'delivered':
                  return <Delivered><FaCheck /> Delivered</Delivered>;
                case 'canceled':
                  return <CancelledStatus><FaTimes /> Canceled</CancelledStatus>;
                case 'returned':
                  return <ReturnedStatus><FaUndo /> Return Applied</ReturnedStatus>;
                case 'return_denied':
                  return <ReturnDeniedStatus><FaBan /> Return Denied</ReturnDeniedStatus>;
                case 'return_approved':
                  return <ReturnApprovedStatus><FaCheckCircle /> Return Approved</ReturnApprovedStatus>;
                case 'return_requested':
                  return <ReturnRequestedStatus><FaUndo /> Return Requested</ReturnRequestedStatus>;
                default:
                  return 'Error';
              }
            })()}
          </DeliveryStatus>

          <h3>Ordered Products</h3>
          <Items>
            {order.products?.map((product, index) => (
              product.amount_total && (
                <Item key={index}>
                  <span>{product.description}</span>
                  <span>{product.quantity}</span>
                  <span>
                    {'₹' + (product.amount_total / 100).toLocaleString()}
                  </span>
                </Item>
              )
            ))}
          </Items>
            <TotalPrice>
              <span>Total Price: {'₹' + (order.total ? order.total.toLocaleString() : 'N/A')}</span>
            </TotalPrice>
          <ShippingDetails>
            <h3>Shipping Details</h3>
            <p>Customer: {order.shipping?.name}</p>
            <p>City: {order.shipping?.address.city}</p>
            <p>Line1: {order.shipping?.address.line1}</p>
            {order.shipping?.address.line2 && <p>Line2: {order.shipping.address.line2}</p>}
            <p>Postal Code: {order.shipping?.address.postal_code}</p>
            <p>Phone: {order.shipping?.phone}</p>
            <p>Email: {order.shipping?.email}</p>
          </ShippingDetails>
        </OrdersContainer>
      )}
    </StyledOrder>

  );
};

export default Order;

const StyledOrder = styled.div`
  background-color: #f5f5f5;
  padding: 20px;
  border: 1px solid #ccc;
  margin: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const OrdersContainer = styled.div`
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const DeliveryStatus = styled.p`
  font-weight: bold;
  font-size: 18px;
  margin-top: 20px;
  display: flex;
  align-items: center;
`;

const Pending = styled.span`
  color: orange;
  display: flex;
  align-items: center;
`;

const Dispatched = styled.span`
  color: green;
  display: flex;
  align-items: center;
`;

const Delivered = styled.span`
  color: blue;
  display: flex;
  align-items: center;
`;

const Items = styled.div`
  margin-top: 20px;
`;

const Item = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  border-radius: 5px;
`;

const TotalPrice = styled.div`
  font-weight: bold;
  font-size: 18px;
  margin-top: 20px;
`;

const ShippingDetails = styled.div`
  margin-top: 20px;
`;

const Loading = styled.p`
text-align: center;
`

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