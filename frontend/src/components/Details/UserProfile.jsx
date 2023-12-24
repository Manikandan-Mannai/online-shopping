import React, { useEffect, useState } from "react";
import styled from "styled-components"; // Import styled-components
import axios from "axios";
import { setHeaders, url } from "../../slices/api";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";




const UserProfile = () => {
  const params = useParams();

  const [user, setUser] = useState({
    name: "",
    email: "",
    isAdmin: false,
    password: "",
  });

  const handleUserTypeChange = (e) => {
    setUser({ ...user, isAdmin: e.target.value === "admin" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${url}/users/${params.id}`, { ...user }, setHeaders());
      setUser({ ...res.data, password: "" });
      toast.success("Profile updated...");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${url}/users/find/${params.id}`, setHeaders());
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, [params.id]);

  return (
    <StyledCard>
      <Header>User Profile</Header>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Name:</Label>
          <Input
            type="text"
            id="name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="email">Email:</Label>
          <Input
            type="text"
            id="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="userType">User Type:</Label>
          <Select
            id="userType"
            value={user.isAdmin ? "admin" : "customer"}
            onChange={handleUserTypeChange}
          >
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </Select>
        </FormGroup>
        <Button>Update</Button>
      </form>
    </StyledCard>
  );
  }
  export default UserProfile;

  const StyledCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 400px; /* Adjust the maximum width as needed */
  margin: 0 auto; /* Center the card horizontally */
`;

  const Header = styled.h3`
  font-size: 20px;
  margin: 0 0 20px;
`;

  const FormGroup = styled.div`
  margin: 15px 0;
`;

  const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
`;

  const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

  const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

  const Button = styled.button`
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;
