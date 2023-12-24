import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    ordersFetch,
    approveReturnRequest,
    denyReturnRequest,
    ordersEdit,
} from '../../slices/ordersSlice';
import moment from 'moment';

const OrdersList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [notificationCount, setNotificationCount] = useState(0);

    const { list } = useSelector((state) => state.orders);

    const handleReturnApproval = (id) => {
        if (window.confirm('Do you confirm the return of this order?')) {
            dispatch(approveReturnRequest({ orderId: id }))
                .then((response) => {
                    if (response.payload && response.payload.delivery_status === 'returned') {
                        dispatch(
                            approveReturnRequest({
                                id,
                                delivery_status: 'return_approved',
                            })
                        );
                    }
                })
                .catch((error) => {
                    console.error('Error approving return request:', error);
                });
        }
    };

    const handleReturnDenial = (id) => {
        if (window.confirm('Are you sure you want to deny the return?')) {
            dispatch(denyReturnRequest({ orderId: id }));
        }
    };

    const handleOrderDispatch = (id) => {
        dispatch(ordersEdit({
            id,
            delivery_status: "dispatched",
        }));
    };

    const handleOrderDeliver = (id) => {
        dispatch(ordersEdit({
            id,
            delivery_status: "delivered",
        }));
    };

    useEffect(() => {
        dispatch(ordersFetch());
    }, [dispatch]);

    useEffect(() => {
        const count = list.filter(
            (order) =>
                order.delivery_status === 'canceled' || order.delivery_status === 'returned'
        ).length;
        setNotificationCount(count);
    }, [list]);

    const rowsWithNotifications = list.map((order) => ({
        id: order._id,
        cName: order.shipping.name,
        amount: (order.total / 100)?.toLocaleString(),
        dStatus: order.delivery_status,
        date: moment(order.createdAt).fromNow(),
        returnStatus: order.return_status || 'pending',
    }));

    const renderActions = (params) => {
        const commonActions = (
            <ViewButton onClick={() => navigate(`/order/${params.row.id}`)}>View</ViewButton>
        );

        if (params.row.dStatus === "return_requested" || ["returned", "cancel_requested"].includes(params.row.dStatus)) {
            return (
                <>
                    <ApproveReturnBtn
                        onClick={() => handleReturnApproval(params.row.id)}
                        disabled={params.row.dStatus === "returned"}
                    >
                        {params.row.dStatus === "returned" ? "Return Approved" : "Approve Return"}
                    </ApproveReturnBtn>
                    <DenyReturnBtn
                        onClick={() => handleReturnDenial(params.row.id)}
                        disabled={params.row.dStatus === "returned"}
                    >
                        {params.row.dStatus === "returned" ? "Return Denied" : "Deny Return"}
                    </DenyReturnBtn>
                    {commonActions}
                </>
            );
        }

        if (["canceled", "return_approved", "return_denied"].includes(params.row.dStatus)) {
            return commonActions;
        }

        return (
            <>
                <ActionButton
                    onClick={() => handleOrderDispatch(params.row.id)}
                    disabled={["canceled", "return_approved", "return_denied"].includes(params.row.dStatus)}
                    bgColor={params.row.dStatus === "canceled" ? "#ff0000" : "#FFBD03"}
                >
                    {params.row.dStatus === "canceled" ? "Canceled" : "Dispatch"}
                </ActionButton>
                <ActionButton
                    onClick={() => handleOrderDeliver(params.row.id)}
                    disabled={["canceled", "return_approved", "return_denied"].includes(params.row.dStatus)}
                    bgColor={params.row.dStatus === "canceled" ? "#ff0000" : "#66ccff"}
                >
                    {params.row.dStatus === "canceled" ? "Canceled" : "Deliver"}
                </ActionButton>
                {commonActions}
            </>
        );
    };



    const columns = [
        { field: 'id', headerName: 'ID', width: 220 },
        { field: 'cName', headerName: 'Name', width: 120 },
        { field: 'amount', headerName: 'Amount(₹)', width: 100 },
        {
            field: 'dStatus',
            headerName: 'Status',
            width: 100,
            renderCell: (params) => {
                let statusLabel = '';

                switch (params.row.dStatus) {
                    case 'pending':
                        statusLabel = <Pending>Pending</Pending>;
                        break;
                    case 'dispatched':
                        statusLabel = <Dispatched>Dispatched</Dispatched>;
                        break;
                    case 'delivered':
                        statusLabel = <Delivered>Delivered</Delivered>;
                        break;
                    case 'returned':
                        statusLabel = <Returned>Return Requested</Returned>;
                        break;
                    case 'canceled':
                        statusLabel = <Cancelled>Canceled</Cancelled>;
                        break;
                    case 'return_approved':
                        statusLabel = <ReturnApproved>Return Approved</ReturnApproved>;
                        break;
                    case 'return_requested':
                        statusLabel = <ReturnRequested>Return Requested</ReturnRequested>;
                        break;
                    case 'return_denied':
                        statusLabel = <ReturnDenied>Return Denied</ReturnDenied>;
                        break;
                    default:
                        statusLabel = params.row.dStatus;
                }

                return <>{statusLabel}</>;
            },
        },
        {
            field: 'date',
            headerName: 'Date',
            width: 120,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            width: 420, // Adjusted width to accommodate the new buttons
            renderCell: (params) => <>{renderActions(params)}</>,
        },
    ];

    return (
        <Wrapper>
            <NotificationBadge hasNotification={notificationCount > 0}>
                {notificationCount}
            </NotificationBadge>
            <DataGrid
                rows={rowsWithNotifications}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                disableRowSelectionOnClick
            />
        </Wrapper>
    );
};

export default OrdersList;

const Wrapper = styled.div`
  position: relative;
  height: 100%;
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #dc3545;
  color: white;
  padding: 5px 10px;
  border-radius: 50%;
  font-size: 14px;
  display: ${({ hasNotification }) => (hasNotification ? 'block' : 'none')};
`;

const ViewButton = styled.button`
  background-color: rgb(114, 225, 40);
    padding: 6px 12px;
  margin-right: 8px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  transition: background-color 0.3s ease;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  margin-right: 8px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
   opacity:0.7;
  }

  background-color: ${({ bgColor }) => bgColor || "#4caf50"};
`;

const ApproveReturnBtn = styled(ActionButton)`
  background-color: #28a745;
  color: #fff;
`;

const DenyReturnBtn = styled(ActionButton)`
  background-color: #dc3545;
  color: #fff;
`;

const Cancelled = styled.div`
  color: red;
  background: rgba(255, 0, 0, 0.12);
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 14px;
`;

const ReturnApproved = styled.div`
  color: greenyellow;
  background: rgba(50, 205, 50, 0.12);
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 14px;
`;

const ReturnRequested = styled.div`
  color: purple;
  background: rgba(128, 0, 128, 0.12);
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 14px;
`;

const ReturnDenied = styled.div`
  color: rosybrown;
  background: rgba(188, 143, 143, 0.12);
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 14px;
`;

const Dispatched = styled.div`
  color: rgb(38, 198, 249);
  background-color: rgba(38, 198, 249, 0.12);
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 14px;
`;

const Delivered = styled.div`
  color: rgb(102, 108, 255);
  background-color: rgba(102, 108, 255, 0.12);
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 14px;
`;

const Returned = styled.span`
  color: #ff0000;
  font-weight: bold;
`;

const Pending = styled.div`
  color: rgb(253, 181, 40);
  background: rgba(253, 181, 40, 0.12);
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 14px;
`;

