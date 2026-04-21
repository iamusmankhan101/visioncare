import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #e0e0e0;
  margin-bottom: 1.5rem;
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
`;

const EmptyMessage = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #48b2ee;
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: #3a9de8;
    transform: translateY(-2px);
    color: white;
  }
`;

const SignInPrompt = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
`;

const SignInIcon = styled.div`
  font-size: 4rem;
  color: #48b2ee;
  margin-bottom: 1.5rem;
`;

const SignInTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
`;

const SignInMessage = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const WishlistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const WishlistItem = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ItemImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ItemContent = styled.div`
  padding: 1.5rem;
`;

const ItemName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const ItemPrice = styled.p`
  font-size: 1.2rem;
  font-weight: 700;
  color: #48b2ee;
  margin-bottom: 1rem;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AddToCartBtn = styled.button`
  flex: 1;
  background: #48b2ee;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #3a9de8;
  }
`;

const RemoveBtn = styled.button`
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e0e0e0;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #fee;
    color: #dc3545;
    border-color: #dc3545;
  }
`;

const WishlistPage = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const wishlistItems = useSelector(state => state.wishlist?.items || []);

  // If user is not authenticated, show sign-in prompt
  if (!isAuthenticated) {
    return (
      <PageContainer>
        <Container>
          <Header>
            <Title>Your Wishlist</Title>
            <Subtitle>Save your favorite eyewear for later</Subtitle>
          </Header>
          
          <SignInPrompt>
            <SignInIcon>
              <FiHeart />
            </SignInIcon>
            <SignInTitle>Sign in to view your wishlist</SignInTitle>
            <SignInMessage>
              Create an account or sign in to save your favorite eyewear and access your wishlist from any device.
            </SignInMessage>
            <ActionButton to="/auth">
              Sign In
            </ActionButton>
          </SignInPrompt>
        </Container>
      </PageContainer>
    );
  }

  // If user is authenticated but wishlist is empty
  if (wishlistItems.length === 0) {
    return (
      <PageContainer>
        <Container>
          <Header>
            <Title>Your Wishlist</Title>
            <Subtitle>Save your favorite eyewear for later</Subtitle>
          </Header>
          
          <EmptyState>
            <EmptyIcon>
              <FiHeart />
            </EmptyIcon>
            <EmptyTitle>Your wishlist is empty</EmptyTitle>
            <EmptyMessage>
              Start browsing our collection and add your favorite eyewear to your wishlist. 
              You can save items for later and easily find them here.
            </EmptyMessage>
            <ActionButton to="/products">
              <FiShoppingBag />
              Continue Shopping
            </ActionButton>
          </EmptyState>
        </Container>
      </PageContainer>
    );
  }

  // If user has items in wishlist
  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>Your Wishlist</Title>
          <Subtitle>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</Subtitle>
        </Header>
        
        <WishlistGrid>
          {wishlistItems.map((item) => (
            <WishlistItem key={item.id}>
              <ItemImage src={item.image} alt={item.name} />
              <ItemContent>
                <ItemName>{item.name}</ItemName>
                <ItemPrice>PKR {item.price}</ItemPrice>
                <ItemActions>
                  <AddToCartBtn>Add to Cart</AddToCartBtn>
                  <RemoveBtn>
                    <FiHeart />
                  </RemoveBtn>
                </ItemActions>
              </ItemContent>
            </WishlistItem>
          ))}
        </WishlistGrid>
      </Container>
    </PageContainer>
  );
};

export default WishlistPage;
