import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { FaBars, FaTimes } from "react-icons/fa";
import { RiShoppingBagLine } from "react-icons/ri";
import { logoutUser } from "../slices/authSlice";
import { toast } from "react-toastify";

const NavBar = () => {
  const dispatch = useDispatch();
  const { cartTotalQuantity } = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <NavContainer>
      <LogoContainer>
        <Link to="/">
          <Logo>OnlineShop</Logo>
        </Link>
      </LogoContainer>

      <CartLink to="/cart" className="nav-bag">
        <ShoppingBagIcon />
        <BagQuantity>{cartTotalQuantity}</BagQuantity>
      </CartLink>
      <MobileMenuIcon onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
      </MobileMenuIcon>

      <LinksContainer mobileMenuOpen={mobileMenuOpen}>
        {auth._id ? (
          <>
            <Links to={`/userProfile/${auth._id}`} className="nav-link">
              {auth.name}
            </Links>
            {auth.isAdmin && (
              <Links to="/admin/summary" className="nav-link">
                Admin
              </Links>
            )}
            <LogoutLink
              onClick={() => {
                dispatch(logoutUser(null));
                toast.warning("Logged out!", { position: "bottom-left" });
              }}
            >
              Logout
            </LogoutLink>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </>
        )}

        <NavLink to="/shopping" className="nav-link">
          Shop
        </NavLink>
      </LinksContainer>


    </NavContainer>
  );
};

export default NavBar;

const NavContainer = styled.nav`
  width: 100%;
  background-color: #0B0D0E;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  padding: 1rem;

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const LogoContainer = styled.div`
  flex: 0.95;
`;

const Logo = styled.h2`
  font-size: 22px;
  color: #fff;
  margin: 0;
`;

const MobileMenuIcon = styled.div`
  display: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
    position: absolute;
    padding-top: 0.2rem;
    color: #fff;  // Adjust this color if needed
    right: 0;
    margin-right: 1rem;
  }

  @media (max-width: 480px) {
    display: inline-block;
  }
`;

const Links = styled(Link)`
color: #fff;
`

const CartLink = styled(Link)`
  text-decoration: none;
  color: white;
  @media (max-width: 768px) {
  margin-right: 7rem;
  }
`;

const ShoppingBagIcon = styled(RiShoppingBagLine)`
  font-size: 1.5rem;
`;

const BagQuantity = styled.span`
  background-color: #ff4500;
  color: white;
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
  font-size: 12px;
`;
const LinksContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    margin-top: ${({ mobileMenuOpen }) => (mobileMenuOpen ? "1rem" : 0)};
    display: flex;
    position: absolute;
    width: 100%;
    background-color: #0B0D0E;
    height: ${({ mobileMenuOpen }) => (mobileMenuOpen ? "auto" : "0")};
    overflow: hidden;
    transition: height 0.3s ease-in;
    top: 46px;
    left: 0;
    color: #fff;
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #efefef;
  cursor: pointer;
`;

const LogoutLink = styled.div`
  cursor: pointer;
  color: #fff;
`;