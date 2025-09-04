import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiChevronUp } from 'react-icons/fi';

const ScrollButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #48b2ee;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)'};
  pointer-events: ${props => props.isVisible ? 'auto' : 'none'};
  
  &:hover {
    background-color: #e55a00;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 107, 0, 0.4);
  }
  
  &:active {
    transform: translateY(0) scale(0.95);
  }
  
  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }
`;

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <ScrollButton isVisible={isVisible} onClick={scrollToTop}>
      <FiChevronUp />
    </ScrollButton>
  );
};

export default ScrollToTopButton;
