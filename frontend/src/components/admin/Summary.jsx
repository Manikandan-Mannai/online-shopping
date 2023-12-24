import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { FaUsers, FaChartBar, FaClipboard } from "react-icons/fa";
import Widget from "./summary-components/Widget";
import axios from 'axios';
import { setHeaders, url } from '../../slices/api';
import Chart from './summary-components/Chart';
import Transactions from './summary-components/Transaction';
import AllTimeData from './summary-components/AllTimeData';

const Summary = () => {

  const [users, setUsers] = useState([]);
  const [usersPrec, setUsersPrec] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersPrec, setOrdersPrec] = useState(0);
  const [Income, setIncome] = useState([]);
  const [IncomePrec, setIncomePrec] = useState(0);

  console.log("orders", orders);

  function compare(a, b) {
    if (a._id < b._id) {
      return -1;
    } else if (a._id > b._id) {
      return 1;
    }
    return 0;
  }

  useEffect(() => {
    async function fetchUserStats() {
      try {
        const res = await axios.get(`${url}/users/stats`, setHeaders());
        res.data.sort(compare);
        setUsers(res.data);
        setUsersPrec((((res.data[1].total - res.data[0].total) / res.data[0].total * 100))
        )
      } catch (err) {
        console.log("Error fetching user stats:", err);
      }
    }
    fetchUserStats();
  }, []);

  useEffect(() => {
    async function fetchOrderStats() {
      try {
        const res = await axios.get(`https://e-commerce-ylbo.onrender.com/api/orders/stats`, setHeaders());
        res.data.sort(compare);
        setOrders(res.data);
        setOrdersPrec((((res.data[1].total - res.data[0].total) / res.data[0].total) * 100));
      } catch (err) {
        console.log("Error fetching order stats:", err);
      }
    }
    fetchOrderStats();
  }, []);

  useEffect(() => {
    async function fetchOrderStats() {
      try {
        const res = await axios.get(`https://e-commerce-ylbo.onrender.com/api/orders/income/stats`, setHeaders());
        res.data.sort(compare);
        setIncome(res.data);
        setIncomePrec((((res.data[1].total - res.data[0].total) / res.data[0].total) * 100));
      } catch (err) {
        console.log("Error fetching order stats:", err);
      }
    }
    fetchOrderStats();
  }, []);

  const data = [
    {
      icon: <FaUsers />,
      digits: users[0]?.total,
      isMoney: false,
      title: "Users",
      color: "rgb(102, 108, 255)",
      bColor: "rgba(102, 108, 255, 0.12)",
      percentage: usersPrec,
    },
    {
      icon: <FaClipboard />,
      digits: orders[0]?.total,
      isMoney: false,
      title: "Orders",
      color: "rgb(38, 198, 249)",
      bColor: "rgba(255, 99, 71, 0.12)",
      percentage: ordersPrec,
    },
    {
      icon: <FaChartBar />,
      digits: Income[0]?.total ? Income[0]?.total / 100 : "",
      isMoney: true,
      title: "Earnings",
      color: "rgb(253, 181, 40)",
      bColor: "rgba(253, 181,40, 0.12)",
      percentage: IncomePrec,
    },
  ];

  return (
    <StyledSummary>
      <MainStats>
        <Overview>
          <Title>
            <h2>Overview</h2>
            <p>How your shop is performing compared to the previous month.</p>
          </Title>
          <WidgetWrapper>
            {
              data?.map((data, index) => (
                <Widget key={index} data={data} />
              ))
            }
          </WidgetWrapper>
        </Overview>
        <Chart />
      </MainStats>
      <SideStats>
        <Transactions />
        <AllTimeData />
      </SideStats>
    </StyledSummary>
  );
};

export default Summary;


const StyledSummary = styled.div`
  width: 100%;
  display: flex;
`;

const MainStats = styled.div`
  flex: 2;
  width: 100%;
`;

const Title = styled.div`
  p {
    font-size: 14px;
    color: rgba(234, 234, 255, 0.68);
  }
`;

const Overview = styled.div`
  background: ${props => props.bColor || 'rgb(48, 51, 78)'};
  color: rgba(234, 234, 255, 0.87);
  width: 100%;
  padding: 1.5rem;
  height: 170px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const WidgetWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const SideStats = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 2rem;
  width: 100%;
`;
