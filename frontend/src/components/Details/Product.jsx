import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { setHeaders, url } from "../../slices/api";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addToCart } from "../../slices/cartSlice";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const Product = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(false);

  console.log("product", product);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    navigate("/cart");
  };

  useEffect(() => {
    setLoading(true);

    async function fetchData() {
      try {
        const res = await axios.get(`${url}/products/find/${params.id}`, setHeaders());
        setProduct(res.data);
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    }

    fetchData();
  }, [params.id]);

  return (
    <StyledProduct>
      <ProductContainer>
        {loading ? (
          <LoadingContainer>
            <p>Loading...</p>
          </LoadingContainer>
        ) : (
          <>
            <ImageContainer>
              {product.images && product.images.length > 0 ? (
                <Carousel showStatus={false} showIndicators={true} infiniteLoop={true}>
                  {product.images.map((image, index) => (
                    <div key={index}>
                      <img src={image.url} alt={product.name} />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <img src={product.image?.url} alt={product.name} />
              )}
            </ImageContainer>
            <ProductDetails>
              <h2>{product.name}</h2>
              <ProductInfo>
                <p>Brand: {product.brand}</p>
                <p>Description: {product.desc}</p>
                <p>Price: ₹{product.price}</p>
              </ProductInfo>
              <AddToCartButton
                className="product-add-to-cart"
                onClick={() => handleAddToCart(product)}
              >
                Add To Cart
              </AddToCartButton>
            </ProductDetails>
          </>
        )}
      </ProductContainer>
    </StyledProduct>
  );
};

const StyledProduct = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const ProductContainer = styled.div`
  max-width: 90%;
  display: flex;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  height: 80%;
  width: 80%;
  display: flex;
`;

const ImageContainer = styled.div`
  flex: 1;
  padding: 1em;
  overflow: hidden;

  .carousel-root {
    width: 100%;
  }
`;

const ProductDetails = styled.div`
  flex: 2;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ProductInfo = styled.div`
  font-size: 18px;
  p {
    margin-bottom: 1rem;
  }
`;

const AddToCartButton = styled.button`
  padding: 10px 20px;
  background-color: #f0c040;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #e0a030;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export default Product;
