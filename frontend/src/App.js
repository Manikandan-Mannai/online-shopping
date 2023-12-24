import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Home from "./components/Home";
import NavBar from "./components/NavBar";
import NotFound from "./components/NotFound";
import Cart from "./components/Cart";

import "react-toastify/dist/ReactToastify.css";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUser } from "./slices/authSlice";
import CheckoutSuccess from "./components/CheckoutSuccess";
import Dashboard from "./components/admin/Dashboard ";
import Products from "./components/admin/Products";
import CreateProduct from "./components/admin/CreateProduct";
import Summary from "./components/admin/Summary";
import Orders from "./components/admin/Orders";
import Users from "./components/admin/Users";
import ProductsList from "./components/list/ProductsList";
import Product from "./components/Details/Product";
import Order from "./components/Details/Order";
import UserProfile from "./components/Details/UserProfile";
import Profile from "./components/Profile";
import LandingPage from "./components/LandingPage";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser(null));
  }, [dispatch]);

  return (
    <div className="App">
      <BrowserRouter>
        <ToastContainer />
        <NavBar />
        <div className="content-container">
          <Routes>
            <Route path="/shopping" element={<Home />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/order/:id" element={<Order />} />
            <Route path="/user/:id" element={<UserProfile />} />

            <Route path="/userProfile/:id" element={<Profile />} />

            <Route path="/admin" element={<Dashboard />}>
              <Route path="products" element={<Products />}>
                <Route index element={<ProductsList />} />
                <Route path="create-product" element={<CreateProduct />} />
              </Route>
              <Route path="summary" element={<Summary />} />
              <Route path="users" element={<Users />} />
              <Route path="orders" element={<Orders />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>

        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
