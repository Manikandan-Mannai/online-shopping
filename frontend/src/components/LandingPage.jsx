import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { productsFetch } from '../slices/productsSlice';
import ShoppingVector from "../Assets/bg.jpg";

const LandingPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items: data, status } = useSelector((state) => state.products);
    const maxDescriptionWords = 10;

    const truncateDescription = (description) => {
        const words = description.split(" ");
        if (words.length > maxDescriptionWords) {
            return words.slice(0, maxDescriptionWords).join(" ") + " ...";
        }
        return description;
    };

    useEffect(() => {
        dispatch(productsFetch());
    }, [dispatch]);

    return (
        <Container>
            <HeroSection>
                <TextContainer>
                    <h1>Welcome to Our Store</h1>
                    <p>Your go-to place for amazing products.</p>
                </TextContainer>
                <ImageContainer>
                    <img src={ShoppingVector} alt="" />
                </ImageContainer>
            </HeroSection>

            <ProductSection id="featured-products">
                <h2>Featured Products</h2>
                <ProductContainer>
                    {status === 'success' && data && data.slice(0, 4).map((product) => (
                        <ProductCard key={product._id}>
                            <img src={product.images[0].url} alt={product.name} />
                            <h3>{product.name}</h3>
                            <p>{truncateDescription(product.desc)}</p>
                        </ProductCard>
                    ))}
                </ProductContainer>
                <Button onClick={() => navigate('/shopping')}>Shop Now</Button>
            </ProductSection>

            <AboutUsSection>
                <h2>About Us</h2>
                <p>We are a team dedicated to providing the best products and services.</p>
            </AboutUsSection>
        </Container>
    );
};

export default LandingPage;


const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const HeroSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 0;
  height: 80vh;
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const TextContainer = styled.div`
  flex: 1;
`;

const ImageContainer = styled.div`
  flex: 1;
  margin-left: 40px;

  img {
    width: 100%;
    max-width: 400px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 20px;
  }
`;

const ProductSection = styled.section`
  padding: 40px 0;
  text-align: center;
  h2 {
    margin-bottom: 50px;
  }
`;

const ProductContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const ProductCard = styled.div`
  width: calc(33.333% - 20px);
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    border-radius: 8px;
  }

  h3 {
    margin-top: 10px;
    font-size: 18px;
    color: #333;
  }

  p {
    color: #666;
    margin-top: 5px;
    font-size: 14px;
  }

  @media (max-width: 1024px) {
    width: calc(50% - 20px);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const AboutUsSection = styled.section`
  padding: 40px 0;

  h2 {
    margin-bottom: 20px;
  }
`;
