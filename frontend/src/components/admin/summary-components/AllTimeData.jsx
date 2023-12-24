import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { setHeaders, url } from '../../../slices/api';

function formatCurrency(incomeInPaise) {
  const incomeInRupees = incomeInPaise / 100; 
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(incomeInRupees);
}

const AllTimeData = () => {
  const { items } = useSelector((state) => state.products);
  const [orderCount, setOrderCount] = useState(0);
  const [income, setIncome] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {

        const orderStatsRes = await axios.get(`${url}/orders/stats`, setHeaders());
        const incomeStatsRes = await axios.get(`${url}/orders/income/stats`, setHeaders());
        const userStatsRes = await axios.get(`${url}/users/stats`, setHeaders());


        const totalOrders = orderStatsRes.data.reduce((total, stat) => total + stat.total, 0);
        setOrderCount(totalOrders);


        const totalIncomeInPaise = incomeStatsRes.data.reduce((total, stat) => total + stat.total, 0);
        setIncome(formatCurrency(totalIncomeInPaise));


        const totalUsers = userStatsRes.data.reduce((total, stat) => total + stat.total, 0);
        setUserCount(totalUsers);
      } catch (err) {
        console.log('Error fetching data:', err);
      }
    }

    fetchData();
  }, []);

  return (
    <Main>
      <h3>All Time</h3>
      <Info>
        <Title>Users</Title>
        <Data>{userCount}</Data>
      </Info>
      <Info>
        <Title>Products</Title>
        <Data>{items.length}</Data>
      </Info>
      <Info>
        <Title>Orders</Title>
        <Data>{orderCount}</Data>
      </Info>
      <Info>
        <Title>Earnings</Title>
        <Data>{income}</Data>
      </Info>
    </Main>
  );
};

export default AllTimeData;



const Main = styled.div`
    background: rgba(48, 51, 78);
    color: rgba(234, 234, 255, 0.87);
    margin-top: 1.5rem;
    border-radius: 5px;
    padding: 1rem;
    font-size: 14px;
  `;

const Info = styled.div`
    display: flex;
    margin-top: 1rem;
    padding: 0.3rem;
    border-radius: 3px;
    background: rgba(38, 198, 249, 0.12);
    
    &:nth-child(even) {
      background: rgba(102, 108, 255, 0.12);
    }
  `;

const Title = styled.div`
    flex: 1;
  `;

const Data = styled.div`
    flex: 1;
    font-weight: 700;
  `;
