import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import confetti from "canvas-confetti";
import { FaShoppingBag } from "react-icons/fa";
import { clearCart, getTotals } from "../slices/cartSlice";

const CheckoutSuccess = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Clear cart and get totals
        dispatch(clearCart());
        dispatch(getTotals());

        // Use canvas-confetti for a minimal confetti effect
        const confettiSettings = {
            particleCount: 70,
            spread: 100,
            origin: { x: 0.5, y: 0.1 },
        };

        // Trigger confetti immediately
        confetti(confettiSettings);

        // Trigger confetti every 2 seconds
        const intervalId = setInterval(() => {
            confetti(confettiSettings);
        }, 2000);

        // Clear interval and confetti after 2 minutes (120 seconds)
        const confettiTimeout = setTimeout(() => {
            clearInterval(intervalId);
            confetti.reset();
        }, 120000);

        // Clean up intervals and confetti on component unmount
        return () => {
            clearInterval(intervalId);
            clearTimeout(confettiTimeout);
            confetti.reset();
        };
    }, [dispatch]);

    return (
        <Container>
            <h2>
                <FaShoppingBag style={{ marginRight: "10px", color: "#029e02" }} />
                Checkout Successful
            </h2>
            <p>Your order might take some time to process.</p>
            <p>Check your order status at your profile after about 10 mins.</p>
            <p>
                In case of any inquiries, contact support at{" "}
                <strong>iammanikandan@gmail.com</strong>
            </p>
            <ConfettiCanvas id="my-canvas" />
        </Container>
    );
};

const Container = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    h2 {
        margin-bottom: 0.5rem;
        color: #029e02;
    }
`;

const ConfettiCanvas = styled.canvas`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 100;
`;

export default CheckoutSuccess;
