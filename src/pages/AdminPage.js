import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addProduct, updateProduct, deleteProduct, fetchProducts, createProductAsync, updateProductAsync, deleteProductAsync } from '../redux/slices/productSlice';
import { syncProductIdsWithNeonDatabase, checkProductSyncStatus, deleteAllProducts } from '../api/productApi';
import productApi from '../api/productApi';
import { FiUpload, FiX, FiEdit, FiTrash2, FiEye, FiPlus, FiMinus, FiChevronDown, FiHome, FiPackage, FiUsers, FiSettings, FiLogOut, FiSearch, FiBell, FiUser, FiShoppingBag, FiTrendingUp, FiDollarSign, FiMenu, FiChevronLeft, FiChevronRight, FiBarChart2 } from 'react-icons/fi';
import OrderManagement from '../components/admin/OrderManagement';
import OrderDashboard from '../components/admin/OrderDashboard';
import AdminHeader from '../components/admin/AdminHeader';
import { getAllOrders, getOrderStats } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

// Modern Dashboard Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  scroll-behavior: smooth;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: ${props => props.collapsed ? '80px' : '280px'};
  background: linear-gradient(135deg, #279EFF 0%, #0E21A0 100%);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    width: 280px;
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    box-shadow: ${props => props.isOpen ? '0 0 20px rgba(0, 0, 0, 0.3)' : 'none'};
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: ${props => props.collapsed ? 'center' : 'space-between'};
  position: relative;
`;

const CollapseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: ${props => props.collapsed ? 'none' : 'flex'};
  align-items: center;
  gap: 0.5rem;
  filter: invert(1);
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const LogoImage = styled.img`
  width: 120px;
  height: 50px;
  object-fit: contain;
`;

const NavSection = styled.div`
  padding: 1rem 0;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: ${props => props.collapsed ? '0.75rem' : '0.75rem 1.5rem'};
  color: ${props => props.active ? '#ffffff' : '#ffffff'};
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border-right: ${props => props.active ? '3px solid #ffffff' : 'none'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${props => props.active ? '600' : '500'};
  border-radius: 8px;
  margin: 0 0.5rem;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    color: #ffffff;
    transform: translateY(-1px);
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: #ffffff;
    flex-shrink: 0;
  }
  
  span {
    display: ${props => props.collapsed ? 'none' : 'block'};
    transition: all 0.3s ease;
    
    @media (max-width: 768px) {
      display: block;
    }
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.5rem;
    justify-content: flex-start;
    
    span {
      display: block;
    }
  }
`;

const LogoutButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #3ABEF9 0%, #3572EF 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(53, 114, 239, 0.3);
  transition: all 0.2s ease;
  z-index: 1000;
  
  &:hover {
    background: linear-gradient(135deg, #2AA8E8 0%, #2461DE 100%);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(53, 114, 239, 0.4);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: #ffffff;
    pointer-events: none;
  }
`;

const MainContent = styled.div`
  margin-left: ${props => props.collapsed ? '80px' : '280px'};
  flex: 1;
  background: #f8fafc;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
  position: relative;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
  background: white;
  border-radius: 16px;
  height: 70px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    height: auto;
    min-height: 60px;
    margin: 0 0.5rem 1rem 0.5rem;
    border-radius: 12px;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  @media (max-width: 480px) {
    margin: 0 0.25rem 1rem 0.25rem;
    padding: 0.5rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #3ABEF9;
  border-radius: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f1f5f9;
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 400px;
  margin-left: 2rem;
  
  @media (max-width: 768px) {
    width: auto;
    flex: 1;
    margin-left: 1rem;
    margin-right: 1rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  background: #f8fafc;
  color: #64748b;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px 8px 36px;
    font-size: 14px;
    border-radius: 20px;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  width: 18px;
  height: 18px;
  pointer-events: none;
  
  @media (max-width: 768px) {
    left: 12px;
    width: 16px;
    height: 16px;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 10;
  
  &:hover {
    background: #f1f5f9;
    color: #475569;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    background: #e2e8f0;
  }
  
  svg {
    width: 18px;
    height: 18px;
    pointer-events: none;
  }
`;

const ProfileButton = styled.button`
  background: linear-gradient(135deg, #3ABEF9 0%, #3572EF 100%);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(58, 190, 249, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 14px 20px;
    font-size: 16px;
    width: 100%;
  }
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 16px;
    width: 12px;
    height: 12px;
    background: white;
    border: 1px solid #e2e8f0;
    border-bottom: none;
    border-right: none;
    transform: rotate(45deg);
  }
`;

const NotificationHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
`;

const NotificationBadge = styled.span`
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
`;

const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const NotificationIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.type === 'order' ? '#dbeafe' : props.type === 'user' ? '#dcfce7' : '#fef3c7'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.type === 'order' ? '#3b82f6' : props.type === 'user' ? '#22c55e' : '#f59e0b'};
  }
`;

const NotificationText = styled.div`
  flex: 1;
`;

const NotificationMessage = styled.p`
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.4;
`;

const NotificationTime = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const ProfileDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 240px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  margin-top: 8px;
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 16px;
    width: 12px;
    height: 12px;
    background: white;
    border: 1px solid #e2e8f0;
    border-bottom: none;
    border-right: none;
    transform: rotate(45deg);
  }
`;

const ProfileHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
`;

const ProfileName = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
`;

const ProfileEmail = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
`;

const ProfileMenu = styled.div`
  padding: 0.5rem 0;
`;

const ProfileMenuItem = styled.button`
  width: 100%;
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  
  &:hover {
    background: #f8fafc;
  }
  
  svg {
    width: 16px;
    height: 16px;
    color: #6b7280;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const WelcomeSection = styled.div`
  margin-bottom: 2rem;
  padding: 0 1rem;
  position: relative;
  
  @media (max-width: 768px) {
    text-align: left;
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  width:95%;
  margin:auto;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
  text-align:left;
  
  @media (max-width: 768px) {
    padding: 1rem;
    max-width: 100%;
    text-align:left;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    margin: 0 auto;
    width: 85%;
    text-align:left;
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
`;

const StatIcon = styled.div`
  width: 24px;
  height: 24px;
  color: #64748b;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #ffffff;
  font-weight: 500;
`;

const StatChart = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 120px;
  height: 60px;
  opacity: 0.1;
  background: ${props => props.color || '#3b82f6'};
  border-radius: 12px 0 12px 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  height:450px;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const ChartControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;


const ChartSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const TopProductsContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
`;

const TopProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const TopProductsTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const TopProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TopProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TopProductImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color || '#f1f5f9'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const TopProductInfo = styled.div`
  flex: 1;
`;

const TopProductName = styled.div`
  font-weight: 500;
  color: #1a202c;
  font-size: 0.875rem;
`;

const ProductStats = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
`;

const ChartContainer2 = styled.div`
  height: 400px;
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  border: 1px solid #f1f5f9;
  
  @media (max-width: 768px) {
    height: 350px;
    padding: 1rem;
  }
`;

const ChartHeader2 = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ChartTitle2 = styled.h3`
  margin: 0;
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 600;
`;

const ChartLegend = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
`;

const LegendDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const TimeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  cursor: pointer;
`;

const ChartNavigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 8px;
  z-index:1;
  
  @media (max-width: 768px) {
    margin-bottom: 3.5rem;
    padding: 0.25rem;
    gap: 0.5rem;
  }

  @media (max-width: 480px) {
    z-index: 2;
    margin-bottom: 2rem;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #475569;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DateRangeDisplay = styled.div`
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  min-width: 200px;
  text-align: center;
`;

const ChartTooltip = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  pointer-events: none;
  z-index: 10000;
  white-space: nowrap;
  transform: translate(-50%, -100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`;

const ChartCanvas = styled.div`
  flex: 1;
  position: relative;
  background: transparent;
  overflow: visible;
  display: flex;
  flex-direction: column;
`;

const ChartArea = styled.div`
  flex: 1;
  position: relative;
  padding: 150px 40px 60px 80px;
  
  @media (max-width: 768px) {
    padding: 80px 30px 40px 60px;
  }
`;

const YAxis = styled.div`
  position: absolute;
  left: 0;
  top: 20px;
  bottom: 40px;
  width: 60px;
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  align-items: flex-end;
  padding-right: 10px;
`;

const YAxisLabel = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 400;
`;

const XAxis = styled.div`
  position: absolute;
  bottom: 0;
  left: 60px;
  right: 20px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const XAxisLabel = styled.div`
  font-size: 0.75rem;
  text-align: center;
`;

const BarChart = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

const ChartGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const GridLine = styled.div`
  position: absolute;
  left: 60px;
  right: 20px;
  height: 1px;
  background: #f1f5f9;
  top: ${props => props.top}%;
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
  max-width: 800px;
  
  @media (max-width: 768px) {
    gap: 1rem;
    max-width: 100%;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    font-weight: 600;
  }
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3ABEF9;
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  appearance: auto;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 16px; /* Prevents zoom on iOS */
    border-radius: 8px;
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 16px; /* Prevents zoom on iOS */
    border-radius: 8px;
    min-height: 80px;
  }
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ContentArea = styled.div`
  flex-grow: 1;
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  margin: 0 1rem 2rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin: 0 0.5rem 1rem 0.5rem;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 0 0.25rem;
    margin-bottom: 1rem;
    
    h2 {
      font-size: 1.25rem;
    }
  }
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
  
  h2 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
    color: #1a202c;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 0 0.5rem;
    margin-bottom: 1.5rem;
    
    h2 {
      font-size: 1.5rem;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0 0.25rem;
    margin-bottom: 1rem;
    
    h2 {
      font-size: 1.25rem;
    }
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 8px;
    min-height: 44px; /* Touch target size */
  }
`;

const ColorRadioContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  margin-top: 0.5rem;
`;

const ColorImageSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 8px;
  }
`;

const ColorImageTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #1a202c;
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin: 0 0 1rem 0;
  }
`;

const ColorImageGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const ColorImageItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3ABEF9;
    box-shadow: 0 2px 8px rgba(58, 190, 249, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const ColorImageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const ColorImageLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #1a202c;
  font-size: 0.875rem;
`;

const ColorImageUploadButton = styled.button`
  padding: 0.5rem 1rem;
  background: #3ABEF9;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
  }
`;

const ColorImageGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 0.5rem;
  }
`;

const ColorImagePreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3ABEF9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(58, 190, 249, 0.2);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ColorImageRemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
    transform: scale(1.1);
  }
`;

const ColorImagePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.75rem;
  line-height: 1.4;
  
  span:first-child {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;

const ColorRadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 2px solid ${props => props.selected ? '#3498db' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.selected ? '#f8f9fa' : 'white'};
  
  &:hover {
    border-color: #3498db;
    background-color: #f8f9fa;
  }
`;

const ColorSwatch = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
  flex-shrink: 0;
`;

const ColorInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ColorName = styled.span`
  font-weight: 500;
  font-size: 0.9rem;
  color: #333;
`;

const ColorHex = styled.span`
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
`;

const RadioInput = styled.input`
  margin: 0;
  flex-shrink: 0;
`;

const SubmitButton = styled.button`
  background-color: #3498db;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px; /* Prevents zoom on iOS */
    border-radius: 8px;
    margin-top: 1rem;
    min-height: 44px; /* Touch target size */
  }
`;


const MobileAddProductButton = styled.button`
  display: none;
  width: 100%;
  padding: 1.25rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #279EFF 0%, #0E21A0 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(39, 158, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(39, 158, 255, 0.5);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    display: flex !important;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
`;

const ProductList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ProductCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
`;

const ProductPrice = styled.p`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #3b82f6;
`;

const AdminPriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem 0;
  flex-wrap: wrap;
`;

const AdminDiscountedPrice = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #e74c3c;
`;

const AdminOriginalPrice = styled.span`
  font-size: 0.875rem;
  font-weight: 400;
  color: #999;
  text-decoration: line-through;
`;

const AdminDiscountPercentage = styled.span`
  background: #e74c3c;
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ProductCategory = styled.p`
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #64748b;
  text-transform: capitalize;
`;

const ProductStatus = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    if (props.children?.includes('Featured')) return '#dbeafe';
    if (props.children?.includes('Best Seller')) return '#dcfce7';
    return '#f1f5f9';
  }};
  color: ${props => {
    if (props.children?.includes('Featured')) return '#1e40af';
    if (props.children?.includes('Best Seller')) return '#166534';
    return '#475569';
  }};
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.danger ? '#ef4444' : '#3b82f6'};
  background: ${props => props.danger ? '#ef4444' : '#3b82f6'};
  color: white;
  border-radius: 6px;
  }
  
  &.delete {
    background-color: #e74c3c;
    color: white;
    
    &:hover {
      background-color: #c0392b;
    }
  }
`;

const ImageUploadContainer = styled.div`
  margin-bottom: 1rem;
`;

const ImagePreviewContainer = styled.div`
  width: 100px;
  height: 100px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
  overflow: hidden;
  background-color: #f8f8f8;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const UploadActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
`;

// Modern Product Form Styled Components
const ProductFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 2rem;
`;

const ProductFormHeader = styled.div`
  border-bottom: 1px solid #e2e8f0;
  border-radius: 20px;
  display: flex;;
  align-items: center;
  padding: 1.5rem 2rem;
  min-height: 20px;
  
  h2 {
    margin: 0;
    font-size: 2.2rem;
    font-weight: 600;
    color: #000000;
    font-family: 'Montserrat', sans-serif;
    text-align: left;
  }
`;

const ProductFormLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  text-align:left;
  padding:1rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    gap: 1rem;
  }
`;

const ProductFormMain = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  
  form {
    padding: 1.5rem;
  }
  
  @media (max-width: 1024px) {
    order: 0; /* Ensure main form content appears first on tablet/mobile */
  }
  
  @media (max-width: 768px) {
    border-radius: 8px;
    
    form {
      padding: 1rem;
    }
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const TabButton = styled.button`
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#1a202c' : '#64748b'};
  font-weight: ${props => props.active ? '600' : '400'};
  border-bottom: ${props => props.active ? '2px solid #3b82f6' : 'none'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'white' : '#f1f5f9'};
  }
`;

const FormHint = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.5rem 0 0 0;
`;

const RichTextEditor = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const EditorToolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const ToolbarButton = styled.button`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const MediaUploadArea = styled.div`
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: #f0f9ff;
  }
`;

const MediaUploadIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const MediaUploadText = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
`;

const GalleryContainer = styled.div`
  margin-top: 1rem;
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
  }
  margin-top: 1rem;
`;

const GalleryItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3ABEF9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(58, 190, 249, 0.2);
  }
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const GalleryRemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
    transform: scale(1.1);
  }
`;

const GalleryAddButton = styled.div`
  aspect-ratio: 1;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
  
  &:hover {
    border-color: #3ABEF9;
    background: #f0f9ff;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    min-height: 100px;
    font-size: 0.75rem;
  }
  
  svg {
    font-size: 1.5rem;
    color: #64748b;
    margin-bottom: 0.5rem;
  }
  
  span {
    font-size: 0.75rem;
    color: #64748b;
    text-align: center;
  }
`;

const ImageSection = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #1a202c;
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin: 0 0 0.75rem 0;
  }
`;

const MainImageContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
`;

const MainImagePreview = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .placeholder {
    color: #94a3b8;
    text-align: center;
    font-size: 0.875rem;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: 150px;
  }
`;

const ImageActions = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

const ImageActionButton = styled.button`
  padding: 0.75rem 1rem;
  border: 2px solid #3ABEF9;
  background: ${props => props.primary ? '#3ABEF9' : 'white'};
  color: ${props => props.primary ? 'white' : '#3ABEF9'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.primary ? '#2563eb' : '#f0f9ff'};
    border-color: ${props => props.primary ? '#2563eb' : '#2563eb'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    flex: 1;
    padding: 12px 16px;
    font-size: 14px;
    min-height: 44px; /* Touch target size */
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

// Product Type Selection Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: modalSlideIn 0.3s ease-out;
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h2 {
    margin: 0 0 0.5rem 0;
    color: #1a202c;
    font-size: 1.5rem;
    font-weight: 700;
  }
  
  p {
    margin: 0;
    color: #64748b;
    font-size: 1rem;
  }
`;

const ModalClose = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    color: #1a202c;
  }
`;

const ProductTypeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ProductTypeCard = styled.div`
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
  
  &:hover {
    border-color: #3ABEF9;
    background: #f0f9ff;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(58, 190, 249, 0.15);
  }
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #1a202c;
    font-size: 1.125rem;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: #64748b;
    font-size: 0.875rem;
    line-height: 1.4;
  }
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  
  h2 {
    margin: 0;
    color: #1a202c;
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #1a202c;
  }
`;

const FormSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
`;

const PricingContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

const PricingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProductFormSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    order: 1; /* Keep sidebar after main content on tablet/mobile */
  }
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const SidebarSection = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    border-radius: 8px;
    padding: 1rem;
  }
`;

const SidebarTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
`;

const ThumbnailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ThumbnailImage = styled.div`
  width: 100%;
  height: 200px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: #f0f9ff;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    height: 150px;
  }
`;

const ThumbnailPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  text-align: center;
  
  span:first-child {
    font-size: 2rem;
  }
  
  span:last-child {
    font-size: 0.75rem;
    color: #64748b;
    line-height: 1.4;
  }
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'published': return '#10b981';
      case 'featured': return '#3b82f6';
      case 'draft': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
`;

const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DetailsItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TagInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;


// Start of the AdminPage component
const AdminPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Helper function to calculate discounted price
  const calculateDiscountedPrice = (product) => {
    if (!product.discount || !product.discount.hasDiscount) {
      return null;
    }

    const originalPrice = parseFloat(product.price);
    const discountPercentage = product.discount.discountPercentage || 0;
    const discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);

    return {
      original: originalPrice,
      discounted: discountedPrice,
      percentage: discountPercentage
    };
  };
  const { items: products, status, error } = useSelector(state => state.products);
  const isProductsLoading = status === 'loading';

  // Debug Redux state
  console.log('🔍 Redux Debug - Products count:', products?.length || 0);
  console.log('🔍 Redux Debug - Status:', status);
  console.log('🔍 Redux Debug - Error:', error);
  console.log('🔍 Redux Debug - Products:', products);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Product type selection modal
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Default product state - used for initialization and reset
  const defaultProductData = {
    name: '',
    price: '',
    category: '',
    material: '',
    shape: '',
    style: 'Classic', // Default value instead of empty string
    frameColor: '',
    description: '',
    image: '',
    gallery: [],
    colorImages: {}, // New field for color-specific images
    featured: false,
    bestSeller: false,
    colors: [],
    sizes: [],
    features: [],
    lensTypes: [],
    status: 'In Stock', // Default value instead of empty string
    rim: '',
    brand: '',
    gender: 'Unisex', // Default value instead of empty string
    type: '',
    discount: {
      hasDiscount: false,
      discountPercentage: 0
    },
    // Lens-specific fields
    thumbnail: '',
    lensColors: [],
    hasPowerOptions: false,
    lensType: '',
    waterContent: '',
    baseCurve: '',
    diameter: '',
    powerRange: ''
  };

  const [productData, setProductData] = useState(defaultProductData);
  const fileInputRef = useRef(null);

  // Options arrays for form fields
  const categories = ['sunglasses', 'eyeglasses', 'reading-glasses', 'computer-glasses', 'sports-glasses', 'contact-lenses', 'transparent-lenses', 'colored-lenses'];
  const materials = ['acetate', 'metal', 'titanium', 'plastic', 'wood', 'carbon-fiber', 'stainless-steel', 'aluminum'];
  const shapes = ['round', 'square', 'oval', 'cat-eye', 'aviator', 'wayfarer', 'rectangular', 'geometric'];
  const genders = ['male', 'female', 'unisex', 'kids'];
  const brandOptions = ['', 'Ray-Ban', 'Oakley', 'Persol', 'Maui Jim', 'Tom Ford', 'Gucci', 'Prada', 'Versace', 'Dior', 'Chanel', 'Burberry', 'Police', 'Carrera', 'Hugo Boss', 'Emporio Armani', 'Giorgio Armani', 'Dolce & Gabbana', 'Fendi', 'Bulgari', 'Cartier', 'Chopard', 'Tiffany & Co', 'Coach', 'Kate Spade', 'Marc Jacobs', 'Michael Kors', 'Polo Ralph Lauren', 'Tommy Hilfiger', 'Calvin Klein', 'Lacoste', 'Diesel', 'Fossil', 'Guess', 'Vogue', 'Arnette', 'Costa Del Mar', 'Revo', 'Serengeti', 'Bolle', 'Spy', 'Electric', 'Dragon', 'VonZipper', 'Smith', 'Kaenon', 'Wiley X', 'Rudy Project', 'Tifosi', 'Julbo', 'Cebe', 'Uvex', 'Alpina', 'Adidas', 'Nike', 'Under Armour', 'Reebok', 'Puma', 'New Balance', 'Champion', 'Fila', 'Converse', 'Vans', 'DC', 'Quiksilver', 'Billabong', 'Rip Curl', 'Volcom', 'Hurley', 'ONeill', 'Reef', 'Roxy', 'Dakine', 'Arnette', 'Anon', 'Ashbury', 'Bern', 'Giro', 'POC', 'Scott', 'Sweet Protection', 'Zeal'];
  const typeOptions = ['', 'reading', 'computer', 'polarized', 'aviator', 'sports', 'fashion'];
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'One Size'];
  const featureOptions = ['uv-protection', 'polarized', 'anti-glare', 'scratch-resistant', 'lightweight', 'flexible'];
  const lensTypeOptions = ['Standard', 'Blue Light Blocking', 'Progressive', 'Photochromic', 'Polarized'];
  
  // Lens-specific options
  const [lensColorOptions, setLensColorOptions] = useState([
    { id: 1, name: 'Clear', hex: '#FFFFFF' },
    { id: 2, name: 'Blue', hex: '#0066CC' },
    { id: 3, name: 'Green', hex: '#00AA00' },
    { id: 4, name: 'Brown', hex: '#8B4513' },
    { id: 5, name: 'Gray', hex: '#808080' },
    { id: 6, name: 'Hazel', hex: '#8E7618' },
    { id: 7, name: 'Violet', hex: '#8A2BE2' },
    { id: 8, name: 'Honey', hex: '#FFC649' }
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const lensStatusOptions = ['In Stock', 'Out of Stock', 'Coming Soon'];
  const colorOptions = [
    { name: 'Black', hex: '#000000' },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Blue', hex: '#0066CC' },
    { name: 'Red', hex: '#CC0000' },
    { name: 'Green', hex: '#00CC00' },
    { name: 'Purple', hex: '#6600CC' },
    { name: 'Pink', hex: '#FF69B4' },
    { name: 'Clear', hex: '#FFFFFF' },
    { name: 'Tortoiseshell', hex: '#8B4513' },
    { name: 'Gray', hex: '#808080' }
  ];


  // Calculate real statistics from products data
  const calculateStats = () => {
    if (!products || products.length === 0) {
      return {
        totalProducts: 0,
        totalValue: 0,
        averagePrice: 0,
        featuredProducts: 0,
        bestSellerProducts: 0,
        discountedProducts: 0
      };
    }

    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => {
      const price = parseFloat(product.price) || 0;
      return sum + price;
    }, 0);
    const averagePrice = totalValue / totalProducts;
    const featuredProducts = products.filter(p => p.featured).length;
    const bestSellerProducts = products.filter(p => p.bestSeller).length;
    const discountedProducts = products.filter(p => p.discount?.hasDiscount).length;

    return {
      totalProducts,
      totalValue,
      averagePrice,
      featuredProducts,
      bestSellerProducts,
      discountedProducts
    };
  };

  const stats = calculateStats();

  // Calculate top products based on real data
  const getTopProducts = () => {
    if (!products || products.length === 0) {
      return [];
    }

    // Sort products by featured status, best seller status, and price
    return products
      .slice()
      .sort((a, b) => {
        // Prioritize featured products
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;

        // Then best sellers
        if (a.bestSeller && !b.bestSeller) return -1;
        if (!a.bestSeller && b.bestSeller) return 1;

        // Then by price (higher price = more premium)
        return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      })
      .slice(0, 6); // Get top 6 products
  };

  const topProducts = getTopProducts();

  // Navigation functions for chart
  const navigateChart = (direction) => {
    setChartDateOffset(prev => {
      const newOffset = direction === 'prev' ? prev - 7 : prev + 7;
      // Don't allow future dates beyond today
      return Math.min(newOffset, 0);
    });
  };

  // Get date range display text
  const getDateRangeText = (dateOffset) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + dateOffset);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    const formatDate = (date) => date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Handle tooltip events
  const handlePointHover = (event, point, type) => {
    event.preventDefault();
    event.stopPropagation();

    const chartCanvasRect = event.target.closest('.chart-canvas').getBoundingClientRect();

    // Get mouse position relative to the chart canvas
    const mouseX = event.clientX - chartCanvasRect.left;
    const mouseY = event.clientY - chartCanvasRect.top;

    const content = type === 'revenue'
      ? `${point.shortLabel}: ${formatPKR(point.revenue)}`
      : `${point.shortLabel}: ${point.orders} orders`;

    setTooltip({
      show: true,
      x: mouseX,
      y: mouseY - 10, // Offset above the point
      content
    });
  };

  const handlePointLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: '' });
  };



  // Format PKR currency
  const formatPKR = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch reviews function
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/reviews/all');
      if (response.ok) {
        const reviewsData = await response.json();
        setReviews(reviewsData);
      } else {
        console.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Approve review function
  const approveReview = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/reviews/${reviewId}/approve`, {
        method: 'PUT'
      });
      if (response.ok) {
        fetchReviews(); // Refresh reviews
        setSuccessMessage('Review approved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  // Reject review function
  const rejectReview = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/reviews/${reviewId}/reject`, {
        method: 'PUT'
      });
      if (response.ok) {
        fetchReviews(); // Refresh reviews
        setSuccessMessage('Review rejected successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  // Load reviews when reviews tab is active
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab]);

  // Fetch products when component mounts
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Test API connection first
        const { testConnection } = await import('../api/productApi');
        const isConnected = await testConnection();

        if (isConnected) {
          setDataSource('api');
          console.log('🌐 Using backend API for products');
        } else {
          setDataSource('localStorage');
          console.log('📦 Using localStorage backup for products');
        }

        dispatch(fetchProducts());
      } catch (error) {
        console.error('Error testing API connection:', error);
        setDataSource('localStorage');
        dispatch(fetchProducts());
      }
    };

    loadProducts();
    loadOrderStats();
    loadRealOrders();

    // Ensure page starts at the top
    window.scrollTo(0, 0);
  }, [dispatch]);

  // Auto-refresh chart data every 30 seconds - TEMPORARILY DISABLED
  useEffect(() => {
    console.log('🔄 Setting up auto-refresh interval...');
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh triggered - loading orders and stats...');
      loadRealOrders();
      loadOrderStats();
    }, 30000);

    return () => {
      console.log('🔄 Cleaning up auto-refresh interval...');
      clearInterval(interval);
      // Also clear any pending loadRealOrders timeout
      if (loadRealOrdersRef.current) {
        clearTimeout(loadRealOrdersRef.current);
      }
    };
  }, []);

  // Click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdowns when clicking outside
      if (!event.target.closest('.dropdown-container')) {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce mechanism to prevent excessive API calls
  const loadRealOrdersRef = useRef(null);
  const isLoadingOrdersRef = useRef(false);

  // Load real orders for chart
  const loadRealOrders = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingOrdersRef.current) {
      console.log('📊 loadRealOrders already in progress, skipping...');
      return;
    }

    // Clear any existing timeout
    if (loadRealOrdersRef.current) {
      clearTimeout(loadRealOrdersRef.current);
    }

    // Debounce the API call by 300ms
    loadRealOrdersRef.current = setTimeout(async () => {
      isLoadingOrdersRef.current = true;
      console.log('📊 loadRealOrders executing...');
      try {
        const orders = await getAllOrders();
        setRealOrders(orders);
      } catch (error) {
        console.error('Error loading real orders:', error);
        setRealOrders([]);
      } finally {
        isLoadingOrdersRef.current = false;
      }
    }, 300);
  }, []);

  // Load order statistics
  const loadOrderStats = async () => {
    try {
      const { getOrderStats } = await import('../services/orderService');
      const stats = await getOrderStats();
      setOrderStats({
        totalOrders: stats.total || 0,
        totalRevenue: stats.totalRevenue || 0,
        pendingOrders: stats.pending || 0,
        deliveredOrders: stats.delivered || 0
      });
    } catch (error) {
      console.error('Error loading order stats:', error);
    }
  };


  // Force fetch products if empty - commented out automatic sample product addition
  useEffect(() => {
    if (!isProductsLoading && !error && (!products || products.length === 0)) {
      // handleAddSampleProducts(); // Commented out to prevent automatic popup
    }
  }, [products, isProductsLoading, error]);

  // Scroll to top when component mounts or active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Prevent auto-scroll to bottom on page load
  useEffect(() => {
    // Set scroll restoration to manual to prevent browser auto-scroll
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Force scroll to top immediately
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    return () => {
      // Restore default scroll restoration when component unmounts
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // Additional state variables
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [realOrders, setRealOrders] = useState([]);
  const [dataSource, setDataSource] = useState('unknown'); // 'api', 'localStorage', 'unknown'

  const [chartDateOffset, setChartDateOffset] = useState(0); // 0 = today, -1 = yesterday, etc.
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });

  // Sample notifications data
  const [notifications] = useState([
    {
      id: 1,
      type: 'order',
      message: 'New order #1234 received from John Doe',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'user',
      message: 'New customer Sarah Wilson registered',
      time: '15 minutes ago',
      unread: true
    },
    {
      id: 3,
      type: 'order',
      message: 'Order #1233 has been delivered',
      time: '1 hour ago',
      unread: false
    },
    {
      id: 4,
      type: 'system',
      message: 'Low stock alert: Ray-Ban Aviator',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 5,
      type: 'order',
      message: 'Payment received for order #1232',
      time: '3 hours ago',
      unread: false
    }
  ]);

  const unreadNotifications = notifications.filter(n => n.unread).length;

  // Header button handlers
  const handleNotificationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Notification clicked!');
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
  };

  const handleSettingsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Settings clicked!');
    // Navigate to settings or show settings modal
  };

  const handleDarkModeToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Dark mode toggled!', !isDarkMode);
    setIsDarkMode(!isDarkMode);
    // Apply dark mode logic here
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Profile clicked!');
    setShowProfileMenu(!showProfileMenu);
    setShowNotifications(false);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Logout clicked!');
    // Clear any auth tokens or user data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Navigate to admin login page
    navigate('/admin/login');
  };

  // Helper function to handle tab clicks and close mobile menu
  const handleTabClick = (tabName) => {
    if (tabName === 'add-product') {
      // Show product type selection modal instead of directly going to add-product
      setShowProductTypeModal(true);
    } else {
      setActiveTab(tabName);
    }
    // Close mobile menu when tab is clicked
    setIsMobileMenuOpen(false);
  };

  // Handle product type selection
  const handleProductTypeSelect = (productType) => {
    setSelectedProductType(productType);
    setShowProductTypeModal(false);

    if (productType === 'eyewear') {
      setActiveTab('add-eyewear-product');
    } else if (productType === 'lens') {
      setActiveTab('add-lens-product');
    }

    // Reset form data for new product
    setProductData({
      name: '',
      price: '',
      material: '',
      shape: '',
      style: '',
      colors: [],
      frameColor: '',
      lensTypes: [],
      features: [],
      category: '',
      description: '',
      image: '',
      gallery: [],
      featured: false,
      status: 'active',
      discount: {
        hasDiscount: false,
        discountPercentage: 0
      }
    });
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowProductTypeModal(false);
  };

  // Handle going back from form to type selection
  const handleBackToTypeSelection = () => {
    setSelectedProductType(null);
    setActiveTab('dashboard');
  };

  // Enhanced input change handler for lens-specific fields
  const handleLensInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData({
      ...productData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle lens color selection
  const handleLensColorToggle = (colorId) => {
    const selectedColors = productData.lensColors || [];
    const updatedColors = selectedColors.includes(colorId)
      ? selectedColors.filter(id => id !== colorId)
      : [...selectedColors, colorId];
    
    setProductData({
      ...productData,
      lensColors: updatedColors
    });
  };

  // Add new lens color
  const handleAddLensColor = () => {
    if (newColorName.trim() && newColorHex) {
      const newColor = {
        id: Date.now(),
        name: newColorName.trim(),
        hex: newColorHex
      };
      setLensColorOptions([...lensColorOptions, newColor]);
      setNewColorName('');
      setNewColorHex('#000000');
    }
  };

  // Remove lens color
  const handleRemoveLensColor = (colorId) => {
    setLensColorOptions(lensColorOptions.filter(color => color.id !== colorId));
    // Also remove from selected colors if it was selected
    const selectedColors = productData.lensColors || [];
    if (selectedColors.includes(colorId)) {
      setProductData({
        ...productData,
        lensColors: selectedColors.filter(id => id !== colorId)
      });
    }
  };

  // Handle lens thumbnail upload
  const handleLensThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductData({
          ...productData,
          thumbnail: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    console.log('🔥 DEBUG: handleInputChange called!');
    console.log('🔥 DEBUG: Event target:', e.target);
    console.log('🔥 DEBUG: Event type:', e.type);

    const { name, value } = e.target;
    console.log(`🔄 AdminPage: Input changed - ${name}: "${value}"`);
    console.log(`🔄 AdminPage: Input name type:`, typeof name);
    console.log(`🔄 AdminPage: Input value type:`, typeof value);

    // Special handling for specific fields
    let processedValue = value;
    if (name === 'price') {
      processedValue = parseFloat(value);
    }

    console.log('🔄 AdminPage: Current productData before update:', productData);

    const updatedData = {
      ...productData,
      [name]: processedValue
    };

    console.log('🔄 AdminPage: New updatedData:', updatedData);
    console.log(`🔄 AdminPage: Specific field ${name} in updatedData:`, updatedData[name]);

    setProductData(updatedData);
    console.log('🔄 AdminPage: setProductData called with:', updatedData);

    // Debug specific fields that were having issues
    if (name === 'gender' || name === 'style' || name === 'status' || name === 'category') {
      console.log(`✅ AdminPage: ${name} field updated successfully to: "${processedValue}"`);
      console.log(`✅ AdminPage: Current ${name} value in state:`, updatedData[name]);

      // Show immediate visual feedback
      setSuccessMessage(`✅ ${name.charAt(0).toUpperCase() + name.slice(1)} updated to: ${processedValue}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }

    // Debug colors array changes
    if (name === 'colors') {
      console.log(`🎨 AdminPage: Colors updated:`, updatedData.colors);
    }
  };

  // Handle feature checkbox changes
  const handleFeatureToggle = (feature) => {
    const updatedFeatures = productData.features?.includes(feature)
      ? productData.features.filter(f => f !== feature)
      : [...(productData.features || []), feature];

    setProductData({
      ...productData,
      features: updatedFeatures
    });
  };

  // Handle checkbox change for featured products
  const handleFeaturedToggle = () => {
    setProductData({
      ...productData,
      featured: !productData.featured
    });
  };

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        // Update product data with the image data URL
        setProductData({
          ...productData,
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Generate chart data based on real orders, with demo data fallback
  const chartData = useMemo(() => {
    const data = [];

    // Get the last 7 days starting from today going backwards
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i); // Go back i days from today
      date.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
      const dateString = date.toISOString().split('T')[0];

      // Filter real orders for this specific date
      const ordersForDate = realOrders.filter(order => {
        if (!order.createdAt && !order.date) return false;
        const orderDate = new Date(order.createdAt || order.date);
        orderDate.setHours(0, 0, 0, 0); // Set to start of day
        return orderDate.toISOString().split('T')[0] === dateString;
      });

      // Calculate actual revenue for this date (only from real orders)
      const dailyRevenue = ordersForDate.reduce((total, order) => {
        return total + (parseFloat(order.total) || parseFloat(order.amount) || 0);
      }, 0);

      data.push({
        date: dateString,
        orders: ordersForDate.length, // Actual count, could be 0
        revenue: Math.round(dailyRevenue), // Actual revenue, could be 0
        shortLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    // Debug: Log the data to console (reduced frequency)
    if (Math.random() < 0.2) {
      console.log('📊 Chart: Real Orders:', realOrders.length, '| Has Data:', data.some(d => d.orders > 0 || d.revenue > 0));
    }

    // Calculate max values for scaling (minimum 1 to prevent division by zero)
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    const maxOrders = Math.max(...data.map(d => d.orders), 1);

    const hasAnyData = data.some(d => d.orders > 0 || d.revenue > 0);

    return { orderData: data, maxRevenue, maxOrders, hasAnyData };
  }, [realOrders]); // Removed chartDateOffset dependency since we're showing last 7 days

  // Eyewear categories (excluding contact lenses and lens-only products)
  const eyewearCategories = [
    'sunglasses', 'eyeglasses', 'reading-glasses', 'computer-glasses', 'sports-glasses',
    'Sunglasses', 'Eyeglasses', 'Reading Glasses', 'Computer Glasses', 'Sports Glasses',
    'Fashion Glasses', 'fashion-glasses', 'prescription-glasses', 'Prescription Glasses'
  ];

  // Function to check if a product is eyewear (more flexible matching)
  const isEyewearProduct = (product) => {
    // If no category is set, check product name for eyewear keywords
    if (!product.category || product.category.trim() === '') {
      const productName = (product.name || '').toLowerCase();
      // Include if product name suggests it's eyewear
      return productName.includes('glasses') ||
        productName.includes('sunglasses') ||
        productName.includes('eyeglasses') ||
        productName.includes('eyewear') ||
        productName.includes('frame') ||
        productName.includes('lens') ||
        // For now, include all products without categories as potential eyewear
        // (since this is an eyewear store, most products are likely eyewear)
        true;
    }

    const category = product.category.toLowerCase();

    // Exclude contact lenses and lens-only products
    if (category.includes('contact') || category.includes('transparent-lenses') || category.includes('colored-lenses')) {
      return false;
    }

    // Include any product with glasses/sunglasses related keywords
    return category.includes('glasses') ||
      category.includes('sunglasses') ||
      category.includes('eyeglasses') ||
      category.includes('eyewear') ||
      eyewearCategories.includes(product.category);
  };

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        // Update product data with the image data URL
        setProductData({
          ...productData,
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle input changes
  const handleInputChange = (e) => {
    console.log('🔥 DEBUG: handleInputChange called!');
    console.log('🔥 DEBUG: Event target:', e.target);
    console.log('🔥 DEBUG: Event type:', e.type);

    const { name, value } = e.target;
    console.log(`🔄 AdminPage: Input changed - ${name}: "${value}"`);
    console.log(`🔄 AdminPage: Input name type:`, typeof name);
    console.log(`🔄 AdminPage: Input value type:`, typeof value);

    // Special handling for specific fields
    let processedValue = value;
    if (name === 'price') {
      processedValue = parseFloat(value);
    }

    console.log('🔄 AdminPage: Current productData before update:', productData);

    const updatedData = {
      ...productData,
      [name]: processedValue
    };

    console.log('🔄 AdminPage: New updatedData:', updatedData);
    console.log(`🔄 AdminPage: Specific field ${name} in updatedData:`, updatedData[name]);

    setProductData(updatedData);
    console.log('🔄 AdminPage: setProductData called with:', updatedData);

    // Debug specific fields that were having issues
    if (name === 'gender' || name === 'style' || name === 'status' || name === 'category') {
      console.log(`✅ AdminPage: ${name} field updated successfully to: "${processedValue}"`);
      console.log(`✅ AdminPage: Current ${name} value in state:`, updatedData[name]);

      // Show immediate visual feedback
      setSuccessMessage(`✅ ${name.charAt(0).toUpperCase() + name.slice(1)} updated to: ${processedValue}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }

    // Debug colors array changes
    if (name === 'colors') {
      console.log(`🎨 AdminPage: Colors updated:`, updatedData.colors);
    }
  };

  // Handle feature checkbox changes
  const handleFeatureToggle = (feature) => {
    const updatedFeatures = productData.features?.includes(feature)
      ? productData.features.filter(f => f !== feature)
      : [...(productData.features || []), feature];

    setProductData({
      ...productData,
      features: updatedFeatures
    });
  };

  // Handle checkbox change for featured products
  const handleFeaturedToggle = () => {
    setProductData({
      ...productData,
      featured: !productData.featured
    });
  };


  // Add these new handler functions
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newGalleryImages = [];

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newGalleryImages.push(reader.result);
          if (newGalleryImages.length === files.length) {
            setProductData({
              ...productData,
              gallery: [...(productData.gallery || []), ...newGalleryImages]
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index) => {
    const updatedGallery = [...(productData.gallery || [])];
    updatedGallery.splice(index, 1);
    setProductData({
      ...productData,
      gallery: updatedGallery
    });
  };

  const handleSizeToggle = (size) => {
    const updatedSizes = productData.sizes?.includes(size)
      ? productData.sizes.filter(s => s !== size)
      : [...(productData.sizes || []), size];

    setProductData({
      ...productData,
      sizes: updatedSizes
    });
  };

  const handleLensTypeToggle = (lensType) => {
    const updatedLensTypes = productData.lensTypes?.includes(lensType)
      ? productData.lensTypes.filter(lt => lt !== lensType)
      : [...(productData.lensTypes || []), lensType];

    setProductData({
      ...productData,
      lensTypes: updatedLensTypes
    });
  };

  const handleDiscountToggle = () => {
    setProductData({
      ...productData,
      discount: {
        ...productData.discount,
        hasDiscount: !productData.discount.hasDiscount
      }
    });
  };

  const handleDiscountPercentageChange = (e) => {
    setProductData({
      ...productData,
      discount: {
        ...productData.discount,
        discountPercentage: parseFloat(e.target.value)
      }
    });
  };

  // Handle color selection
  const handleColorToggle = (colorOption) => {
    const currentColors = Array.isArray(productData.colors) ? productData.colors : [];
    const isSelected = currentColors.some(c => c.name === colorOption.name);

    if (isSelected) {
      // Remove color and its associated images
      const updatedColorImages = { ...(productData.colorImages || {}) };
      delete updatedColorImages[colorOption.name];

      const updatedData = {
        ...productData,
        colors: currentColors.filter(c => c.name !== colorOption.name),
        colorImages: updatedColorImages
      };

      setProductData(updatedData);
      console.log(`🎨 AdminPage: Color "${colorOption.name}" removed. Total colors:`, updatedData.colors.length);
      setSuccessMessage(`❌ Color "${colorOption.name}" removed`);
      setTimeout(() => setSuccessMessage(''), 2000);
    } else {
      // Add color
      const updatedData = {
        ...productData,
        colors: [...currentColors, colorOption]
      };

      setProductData(updatedData);
      console.log(`🎨 AdminPage: Color "${colorOption.name}" added. Total colors:`, updatedData.colors.length);
      setSuccessMessage(`✅ Color "${colorOption.name}" added`);
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  // Handle color-specific image upload
  const handleColorImageUpload = (colorName, files) => {
    const fileArray = Array.from(files);
    if (fileArray.length > 0) {
      const newColorImages = [];

      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newColorImages.push(reader.result);
          if (newColorImages.length === fileArray.length) {
            setProductData({
              ...productData,
              colorImages: {
                ...(productData.colorImages || {}),
                [colorName]: [...((productData.colorImages && productData.colorImages[colorName]) || []), ...newColorImages]
              }
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove color-specific image
  const removeColorImage = (colorName, imageIndex) => {
    const updatedColorImages = { ...(productData.colorImages || {}) };
    if (updatedColorImages[colorName]) {
      updatedColorImages[colorName] = updatedColorImages[colorName].filter((_, index) => index !== imageIndex);
      if (updatedColorImages[colorName].length === 0) {
        delete updatedColorImages[colorName];
      }
    }
    setProductData({
      ...productData,
      colorImages: updatedColorImages
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('🚀 Adding product:', productData.name);

    try {
      // Format the product data with proper field mapping and null handling
      const formattedProduct = {
        ...productData,
        price: parseFloat(productData.price),
        // Handle color field - extract from colors array or use direct color field
        color: productData.colors && productData.colors.length > 0
          ? productData.colors.map(c => c.name).join(', ')
          : productData.color || null,
        // Ensure proper field mapping for API
        framecolor: productData.frameColor || null, // Map frameColor to framecolor for API
        lenstypes: Array.isArray(productData.lensTypes) ? JSON.stringify(productData.lensTypes) : null,
        colorimages: productData.colorImages ? JSON.stringify(productData.colorImages) : null,
        sizes: Array.isArray(productData.sizes) ? JSON.stringify(productData.sizes) : null,
        gallery: Array.isArray(productData.gallery) ? JSON.stringify(productData.gallery) : null,
        features: Array.isArray(productData.features) ? JSON.stringify(productData.features) : null,
        // Ensure required fields have defaults
        gender: productData.gender || 'Unisex',
        style: productData.style || 'Classic',
        status: productData.status || 'In Stock',
        // Note: ID will be generated by the API
      };

      console.log('🔍 AdminPage: Formatted product data:', formattedProduct);
      console.log('🔍 AdminPage: Final - color:', formattedProduct.color);
      console.log('🔍 AdminPage: Final - image:', formattedProduct.image ? 'Present (base64)' : 'Missing');
      console.log('🔍 AdminPage: Final - gallery:', formattedProduct.gallery);
      console.log('🔍 AdminPage: Final - colorimages:', formattedProduct.colorimages);
      console.log('🔍 AdminPage: Final - gender:', formattedProduct.gender);
      console.log('🔍 AdminPage: Final - style:', formattedProduct.style);
      console.log('🔍 AdminPage: Final - status:', formattedProduct.status);
      console.log('🔍 AdminPage: Final - framecolor:', formattedProduct.framecolor);

      // Dispatch async action to add product to API and Redux store
      console.log('🚀 Dispatching createProductAsync with data:', formattedProduct);
      const result = await dispatch(createProductAsync(formattedProduct)).unwrap();
      console.log('✅ Product created successfully:', result);
      console.log('✅ Product name:', result?.name);
      console.log('✅ Product ID:', result?.id);

      // Refresh the product list to show the new product
      console.log('🔄 Refreshing product list...');
      await dispatch(fetchProducts());
      console.log('✅ Product list refreshed');

      // Show success message
      setSuccessMessage('Product added successfully!');

      // Reset file upload state
      setSelectedFile(null);
      setPreviewUrl('');

      // Reset form
      setTimeout(() => {
        setSuccessMessage('');
        setProductData(defaultProductData);
      }, 2000);
    } catch (error) {
      console.error('Failed to add product:', error);
      setSuccessMessage('Error adding product: ' + (error?.message || error || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit product - MOVED INSIDE COMPONENT
  const handleEditProduct = (product) => {
    console.log('✏️ AdminPage: Editing product:', product.name);
    console.log('✏️ AdminPage: Product ID:', product.id || product._id);
    console.log('✏️ AdminPage: Product data:', product);

    const editData = {
      ...defaultProductData, // Start with default values
      ...product, // Override with product data
      price: product.price ? product.price.toString() : '', // Convert price to string for form input
      // Ensure all fields have proper defaults
      name: product.name || '',
      category: product.category || '',
      material: product.material || '',
      shape: product.shape || '',
      style: product.style || '',
      frameColor: product.frameColor || '',
      description: product.description || '',
      image: product.image || '',
      status: product.status || 'In Stock',
      rim: product.rim || '',
      brand: product.brand || '',
      gender: product.gender || 'Unisex',
      featured: Boolean(product.featured),
      bestSeller: Boolean(product.bestSeller),
      colors: Array.isArray(product.colors) ? product.colors : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      features: Array.isArray(product.features) ? product.features : [],
      lensTypes: Array.isArray(product.lensTypes) ? product.lensTypes : [],
      gallery: Array.isArray(product.gallery) ? product.gallery : [],
      colorImages: product.colorImages || {},
      discount: product.discount || { hasDiscount: false, discountPercentage: 0 }
    };

    console.log('✏️ AdminPage: Setting edit data:', editData);
    console.log('🔍 AdminPage: Edit data - gender:', editData.gender);
    console.log('🔍 AdminPage: Edit data - style:', editData.style);
    console.log('🔍 AdminPage: Edit data - status:', editData.status);

    setProductData(editData);
    setActiveTab('edit-product');
  };

  // Handle delete product - MOVED INSIDE COMPONENT
  const handleDeleteProduct = async (productId) => {
    console.log('🗑️ AdminPage: Delete button clicked for product ID:', productId);
    console.log('🗑️ AdminPage: Product ID type:', typeof productId);

    if (!productId) {
      console.error('❌ AdminPage: No product ID provided for deletion');
      setSuccessMessage('Error: No product ID provided');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        console.log('🗑️ AdminPage: User confirmed deletion, proceeding...');
        console.log('🗑️ AdminPage: Dispatching deleteProductAsync with ID:', productId);

        const result = await dispatch(deleteProductAsync(productId)).unwrap();
        console.log('✅ AdminPage: Delete operation completed:', result);

        // Handle different success messages based on result
        if (result.message && result.message.includes('was not in database')) {
          setSuccessMessage('Product removed successfully! (It was not found in the database)');
        } else {
          setSuccessMessage('Product deleted successfully!');
        }
        setTimeout(() => setSuccessMessage(''), 3000);

        // Refresh the product list to ensure UI is updated
        console.log('🔄 AdminPage: Refreshing product list...');
        dispatch(fetchProducts());
      } catch (error) {
        console.error('❌ AdminPage: Failed to delete product:', error);
        console.error('❌ AdminPage: Error details:', error.message);

        // Provide more user-friendly error messages
        let errorMessage = 'Error deleting product: ';
        if (error.message.includes('Product not found') || error.message.includes('404')) {
          errorMessage += 'Product not found. It may have already been deleted or the ID is incorrect.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          errorMessage += 'Network error. Please check your connection and try again.';
        } else {
          errorMessage += error.message;
        }

        setSuccessMessage(errorMessage);
        setTimeout(() => setSuccessMessage(''), 5000);

        // Refresh the product list to sync with current database state
        console.log('🔄 AdminPage: Refreshing product list after failed deletion...');
        dispatch(fetchProducts());
      }
    } else {
      console.log('🚫 AdminPage: User cancelled deletion');
    }
  };

  // Handle update product submission - MOVED INSIDE COMPONENT
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('✏️ AdminPage: Submitting product update');
      console.log('✏️ AdminPage: Current productData:', productData);

      // Validate required fields
      if (!productData.id && !productData._id) {
        throw new Error('Product ID is missing. Cannot update product.');
      }

      if (!productData.name || !productData.price) {
        throw new Error('Product name and price are required.');
      }

      // Ensure price is a number
      const updatedProduct = {
        ...productData,
        price: parseFloat(productData.price)
      };

      const productId = updatedProduct.id || updatedProduct._id;
      console.log('✏️ AdminPage: Updating product with ID:', productId);
      console.log('✏️ AdminPage: Updated product data:', updatedProduct);

      // Debug the specific fields that were having issues
      console.log('🔍 AdminPage: Submitting - gender:', updatedProduct.gender);
      console.log('🔍 AdminPage: Submitting - style:', updatedProduct.style);
      console.log('🔍 AdminPage: Submitting - status:', updatedProduct.status);
      console.log('🔍 AdminPage: Submitting - frameColor:', updatedProduct.frameColor);
      console.log('🔍 AdminPage: Submitting - sizes:', updatedProduct.sizes);

      // Dispatch async action to update product in API and Redux store
      const result = await dispatch(updateProductAsync({
        id: productId,
        productData: updatedProduct
      })).unwrap();

      console.log('✅ AdminPage: Product updated successfully');
      console.log('✅ AdminPage: Update result:', result);

      // Show success message
      setSuccessMessage('Product updated successfully!');

      // Reset file upload state
      setSelectedFile(null);
      setPreviewUrl('');

      // Refresh the product list to ensure UI is updated
      dispatch(fetchProducts());

      // Reset form and go back to manage products
      setTimeout(() => {
        setSuccessMessage('');
        setActiveTab('manage-products');
      }, 2000);
    } catch (error) {
      console.error('❌ AdminPage: Failed to update product:', error);
      const errorMessage = error?.message || error?.error || error || 'Unknown error occurred';

      // If it's a "product not found" error, suggest refreshing the product list
      if (errorMessage.includes('not found in database')) {
        setSuccessMessage('⚠️ Product not found in database. This may happen if the product was deleted or database was reset. Refreshing product list...');
        // Automatically refresh the product list to sync with database
        setTimeout(() => {
          dispatch(fetchProducts());
          setActiveTab('manage-products');
          setSuccessMessage('✅ Product list refreshed. Please try updating again.');
        }, 2000);
      } else {
        setSuccessMessage('Error updating product: ' + errorMessage);
      }

      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync product IDs with Neon database
  const handleSyncProductIds = async () => {
    if (!window.confirm('This will sync all product IDs with the Neon database. Products that don\'t exist in Neon will be created. Continue?')) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 AdminPage: Starting product ID sync...');
      setSuccessMessage('🔄 Syncing product IDs with Neon database...');

      const syncResult = await syncProductIdsWithNeonDatabase();

      console.log('✅ AdminPage: Sync completed:', syncResult);

      // Refresh the product list to show updated IDs
      await dispatch(fetchProducts());

      // Show detailed results
      const { synced, created, errors, total } = syncResult;
      let message = `✅ Sync completed! `;

      if (synced > 0) message += `${synced} products synced, `;
      if (created > 0) message += `${created} products created in Neon, `;
      if (errors > 0) message += `${errors} errors occurred, `;

      message += `${total} total products processed.`;

      if (errors > 0) {
        message += ` Check console for error details.`;
        console.warn('⚠️ AdminPage: Sync errors:', syncResult.results.filter(r => r.status === 'failed'));
      }

      setSuccessMessage(message);

    } catch (error) {
      console.error('❌ AdminPage: Sync failed:', error);
      setSuccessMessage(`❌ Sync failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(''), 8000); // Longer timeout for detailed message
    }
  };

  // Quick sync localStorage IDs with Neon database IDs
  const handleQuickIdSync = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 AdminPage: Starting quick ID sync...');
      setSuccessMessage('🔄 Syncing localStorage IDs with Neon database...');

      // Step 1: Get products from Neon database
      const neonResponse = await productApi.getAllProducts();
      const neonProducts = Array.isArray(neonResponse) ? neonResponse : (neonResponse?.products || []);
      console.log('📊 Neon products:', neonProducts.length);
      console.log('📊 Neon product names:', neonProducts.map(p => `"${p.name}" (ID: ${p.id})`));

      // Step 2: Get products from localStorage
      const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
      console.log('📦 Local products:', localProducts.length);
      console.log('📦 Local product names:', localProducts.map(p => `"${p.name}" (ID: ${p.id})`));

      if (neonProducts.length === 0) {
        setSuccessMessage('⚠️ No products found in Neon database. Please add products first.');
        return;
      }

      if (localProducts.length === 0) {
        setSuccessMessage('⚠️ No products found in localStorage. Fetching from Neon database...');
        await dispatch(fetchProducts());
        return;
      }

      let syncedCount = 0;
      let updatedProducts = [];

      // Step 3: Match products by name and update IDs (more flexible matching)
      for (const localProduct of localProducts) {
        const localName = localProduct.name?.toLowerCase().trim().replace(/\s+/g, ' ');

        const matchingNeonProduct = neonProducts.find(neonProduct => {
          const neonName = neonProduct.name?.toLowerCase().trim().replace(/\s+/g, ' ');
          return neonName === localName;
        });

        if (matchingNeonProduct) {
          // Update local product with Neon database ID
          const updatedProduct = {
            ...localProduct,
            id: matchingNeonProduct.id
          };
          updatedProducts.push(updatedProduct);
          syncedCount++;
          console.log(`✅ Synced: "${localProduct.name}" - Local ID ${localProduct.id} → Neon ID ${matchingNeonProduct.id}`);
        } else {
          // Keep original product if no match found
          updatedProducts.push(localProduct);
          console.warn(`⚠️ No match found for: "${localProduct.name}" (ID: ${localProduct.id})`);

          // Try partial matching for debugging
          const partialMatches = neonProducts.filter(neonProduct =>
            neonProduct.name?.toLowerCase().includes(localName.split(' ')[0]) ||
            localName.includes(neonProduct.name?.toLowerCase().split(' ')[0] || '')
          );
          if (partialMatches.length > 0) {
            console.log(`🔍 Possible matches for "${localProduct.name}":`, partialMatches.map(p => p.name));
          }
        }
      }

      // Step 4: Update localStorage with synced IDs
      if (syncedCount > 0) {
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        localStorage.setItem('productBackup', JSON.stringify(updatedProducts));

        // Step 5: Refresh Redux store
        await dispatch(fetchProducts());
      }

      setSuccessMessage(`✅ Quick sync completed! ${syncedCount} product IDs synced with Neon database.`);
      console.log('✅ AdminPage: Quick ID sync completed');

      if (syncedCount === 0) {
        setSuccessMessage('⚠️ No products were synced. Check console for product name comparisons.');
      }

    } catch (error) {
      console.error('❌ AdminPage: Quick sync failed:', error);
      setSuccessMessage(`❌ Quick sync failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(''), 8000);
    }
  };

  // Check sync status
  const handleCheckSyncStatus = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 AdminPage: Checking sync status...');
      setSuccessMessage('🔍 Checking sync status...');

      const status = await checkProductSyncStatus();

      console.log('📊 AdminPage: Sync status:', status);

      let message = `📊 Sync Status: ${status.localCount} local, ${status.neonCount} in Neon. `;

      if (status.needsSync) {
        message += `⚠️ Sync needed: ${status.issues.join(', ')}`;
      } else {
        message += `✅ All products are in sync!`;
      }

      setSuccessMessage(message);

    } catch (error) {
      console.error('❌ AdminPage: Status check failed:', error);
      setSuccessMessage(`❌ Status check failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(''), 6000);
    }
  };

  // Quick fix for Product ID 98 issue
  const handleQuickFixProductId = async () => {
    if (!window.confirm('This will attempt to fix the Product ID 98 issue by clearing the problematic product from local storage. Continue?')) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔧 AdminPage: Quick fixing Product ID issue...');
      setSuccessMessage('🔧 Fixing Product ID issue...');

      // Get products from localStorage
      const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
      console.log('📦 Found products in localStorage:', storedProducts.length);

      // Find and remove product with ID 98
      const filteredProducts = storedProducts.filter(p => p.id !== 98 && p.id !== '98');
      const removedCount = storedProducts.length - filteredProducts.length;

      if (removedCount > 0) {
        // Update localStorage
        localStorage.setItem('products', JSON.stringify(filteredProducts));
        console.log(`🗑️ Removed ${removedCount} products with ID 98 from localStorage`);

        // Refresh Redux store
        await dispatch(fetchProducts());

        setSuccessMessage(`✅ Fixed! Removed ${removedCount} problematic products. Try updating again.`);
      } else {
        console.log('ℹ️ No products with ID 98 found in localStorage');

        // Just refresh the product list
        await dispatch(fetchProducts());
        setSuccessMessage('✅ Product list refreshed. Try updating again.');
      }

    } catch (error) {
      console.error('❌ AdminPage: Quick fix failed:', error);
      setSuccessMessage(`❌ Quick fix failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(''), 6000);
    }
  };

  // Delete all products from Neon database and local storage
  const handleDeleteAllProducts = async () => {
    const confirmMessage = `⚠️ DANGER: This will permanently delete ALL products from:
    
• Neon Database (${products.length} products)
• Local Storage
• All cached data

This action CANNOT be undone!

Type "DELETE ALL" to confirm:`;

    const userInput = prompt(confirmMessage);

    if (userInput !== 'DELETE ALL') {
      setSuccessMessage('❌ Deletion cancelled - confirmation text did not match');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🗑️ AdminPage: Starting complete product deletion...');
      setSuccessMessage('🗑️ Deleting all products from Neon database and local storage...');

      const deleteResult = await deleteAllProducts();

      console.log('✅ AdminPage: Deletion completed:', deleteResult);

      // Refresh the product list to show empty state
      await dispatch(fetchProducts());

      // Show detailed results
      const { neonDeleted, neonErrors, localCleared, totalErrors } = deleteResult;
      let message = `🎉 Deletion completed! `;

      if (neonDeleted > 0) message += `${neonDeleted} products deleted from Neon, `;
      if (localCleared) message += `local storage cleared, `;
      if (neonErrors > 0) message += `${neonErrors} deletion errors, `;
      if (totalErrors > 0) message += `${totalErrors} total errors occurred.`;

      if (totalErrors === 0) {
        message = `🎉 SUCCESS! All products deleted. ${neonDeleted} removed from Neon database, local storage cleared.`;
      } else {
        message += ` Check console for error details.`;
        console.warn('⚠️ AdminPage: Deletion errors:', deleteResult.errors);
      }

      setSuccessMessage(message);

    } catch (error) {
      console.error('❌ AdminPage: Complete deletion failed:', error);
      setSuccessMessage(`❌ Deletion failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(''), 10000); // Longer timeout for important message
    }
  };


  // Update existing products with random style values
  const handleUpdateExistingProductsWithStyles = () => {
    if (window.confirm('This will update all existing products without style data with random styles. Continue?')) {
      try {
        setIsLoading(true);
        const styleOptions = ['Classic', 'Eco Friendly', 'Artsy', 'Retro', 'Street Style', 'Bold'];

        for (const product of products) {
          if (!product.style) {
            const randomStyle = styleOptions[Math.floor(Math.random() * styleOptions.length)];
            const updatedProduct = { ...product, style: randomStyle };
            dispatch(updateProduct({
              id: product.id,
              ...updatedProduct
            }));
          }
        }

        setIsLoading(false);
        setSuccessMessage('Existing products updated with style data successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setIsLoading(false);
        console.error('Failed to update products:', error);
        setSuccessMessage('Error updating products: ' + error.message);
      }
    }
  };



  if (isLoading) {
    return (
      <DashboardContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Loading...</h2>
            <p>Please wait while we prepare the admin dashboard</p>
          </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <MobileOverlay
        isOpen={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <Sidebar isOpen={isMobileMenuOpen} collapsed={isSidebarCollapsed}>
        <SidebarHeader collapsed={isSidebarCollapsed}>
          <Logo collapsed={isSidebarCollapsed}>
            <LogoImage src="/images/logo2.png" alt="Vision Care Logo" />
          </Logo>
          <CollapseButton onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </CollapseButton>
        </SidebarHeader>

        <NavSection>
          <NavItem
            active={activeTab === 'dashboard'}
            onClick={() => handleTabClick('dashboard')}
            collapsed={isSidebarCollapsed}
          >
            <FiHome />
            <span>Dashboard</span>
          </NavItem>
          <NavItem
            active={activeTab === 'orders'}
            onClick={() => handleTabClick('orders')}
            collapsed={isSidebarCollapsed}
          >
            <FiShoppingBag />
            <span>Orders</span>
          </NavItem>
          <NavItem
            active={activeTab === 'add-product'}
            onClick={() => handleTabClick('add-product')}
            collapsed={isSidebarCollapsed}
          >
            <FiPackage />
            <span>Add Product</span>
          </NavItem>
          <NavItem
            active={activeTab === 'manage-products'}
            onClick={() => handleTabClick('manage-products')}
            collapsed={isSidebarCollapsed}
          >
            <FiBarChart2 />
            <span>Manage Products</span>
          </NavItem>
          <NavItem
            active={activeTab === 'eyewear-products'}
            onClick={() => handleTabClick('eyewear-products')}
            collapsed={isSidebarCollapsed}
          >
            <FiTrendingUp />
            <span>Eyewear Products</span>
          </NavItem>
          <NavItem
            active={activeTab === 'lens-products'}
            onClick={() => handleTabClick('lens-products')}
            collapsed={isSidebarCollapsed}
          >
            <FiSettings />
            <span>Lens Products</span>
          </NavItem>
          <NavItem
            active={activeTab === 'customers'}
            onClick={() => handleTabClick('customers')}
            collapsed={isSidebarCollapsed}
          >
            <FiUsers />
            <span>Customers</span>
          </NavItem>
          <NavItem
            active={activeTab === 'reviews'}
            onClick={() => handleTabClick('reviews')}
            collapsed={isSidebarCollapsed}
          >
            <FiDollarSign />
            <span>Reviews</span>
          </NavItem>
        </NavSection>
      </Sidebar>

      <MainContent collapsed={isSidebarCollapsed}>

        {activeTab === 'dashboard' && (
          <>
            <DashboardHeader>
              <HeaderLeft>
                <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <FiX /> : <FiMenu />}
                </MobileMenuButton>
                <SearchContainer>
                  <SearchIcon />
                  <SearchInput placeholder="Search" />
                </SearchContainer>
              </HeaderLeft>
              <HeaderRight>
                <AdminHeader
                  showNotifications={showNotifications}
                  setShowNotifications={setShowNotifications}
                  showProfileMenu={showProfileMenu}
                  setShowProfileMenu={setShowProfileMenu}
                  notifications={notifications}
                  unreadNotifications={unreadNotifications}
                  handleLogout={handleLogout}
                  setActiveTab={setActiveTab}
                />
              </HeaderRight>
            </DashboardHeader>

            <WelcomeSection>
              <WelcomeTitle>Welcome Back, {user?.name || 'Vision Care'}!</WelcomeTitle>
              <WelcomeSubtitle>Here's what happening with your store today</WelcomeSubtitle>
            </WelcomeSection>

            <StatsGrid>
              <StatCard style={{ background: 'linear-gradient(135deg, #279EFF 0%, #0E21A0 100%)' }}>
                <StatHeader>
                  <StatTitle>Total Revenue</StatTitle>
                </StatHeader>
                <StatValue style={{ color: '#ffffff', fontSize: '2rem', fontWeight: '700' }}>
                  {formatPKR(orderStats.totalRevenue)}
                </StatValue>
                <StatChange positive>
                  ↗ {orderStats.totalRevenue > 0 ? ((orderStats.deliveredOrders / Math.max(orderStats.totalOrders, 1)) * 100).toFixed(1) : '0'}% <span style={{ color: '#e2e8f0', fontSize: '0.75rem' }}>({orderStats.deliveredOrders} delivered)</span>
                </StatChange>
              </StatCard>

              <StatCard style={{ background: 'linear-gradient(135deg, #279EFF 0%, #0E21A0 100%)' }}>
                <StatHeader>
                  <StatTitle>New Customers</StatTitle>
                </StatHeader>
                <StatValue style={{ color: '#ffffff', fontSize: '2rem', fontWeight: '700' }}>
                  {orderStats.totalOrders - orderStats.pendingOrders}
                </StatValue>
                <StatChange positive>
                  ↗ {orderStats.totalOrders > 0 ? (((orderStats.totalOrders - orderStats.pendingOrders) / Math.max(orderStats.totalOrders, 1)) * 100).toFixed(1) : '0'}% <span style={{ color: '#e2e8f0', fontSize: '0.75rem' }}>({orderStats.totalOrders - orderStats.pendingOrders} completed)</span>
                </StatChange>
              </StatCard>

              <StatCard style={{ background: 'linear-gradient(135deg, #279EFF 0%, #0E21A0 100%)' }}>
                <StatHeader>
                  <StatTitle>Total Orders</StatTitle>
                </StatHeader>
                <StatValue style={{ color: '#ffffff', fontSize: '2rem', fontWeight: '700' }}>
                  {orderStats.totalOrders.toLocaleString()}
                </StatValue>
                <StatChange positive>
                  ↗ {orderStats.pendingOrders} <span style={{ color: '#e2e8f0', fontSize: '0.75rem' }}>pending orders</span>
                </StatChange>
              </StatCard>

              <StatCard style={{ background: 'linear-gradient(135deg, #279EFF 0%, #0E21A0 100%)' }}>
                <StatHeader>
                  <StatTitle>Average Order Value</StatTitle>
                </StatHeader>
                <StatValue style={{ color: '#ffffff', fontSize: '2rem', fontWeight: '700' }}>
                  {formatPKR(Math.round(orderStats.totalRevenue / Math.max(orderStats.totalOrders, 1)))}
                </StatValue>
                <StatChange positive>
                  ↗ {orderStats.totalOrders > 0 ? ((orderStats.deliveredOrders / Math.max(orderStats.totalOrders, 1)) * 100).toFixed(1) : '0'}% <span style={{ color: '#e2e8f0', fontSize: '0.75rem' }}>delivery rate</span>
                </StatChange>
              </StatCard>

            </StatsGrid>

            <ContentGrid>
              <ChartContainer>
                <ChartHeader>
                  <ChartTitle>Sales & Orders Overview</ChartTitle>
                  <ChartControls>
                    <ChartLegend>
                      <LegendItem>
                        <LegendDot color="#3b82f6" />
                        Revenue
                      </LegendItem>
                      <LegendItem>
                        <LegendDot color="#60a5fa" />
                        Orders
                      </LegendItem>
                    </ChartLegend>
                    <ChartSelect
                      value={`Last ${Math.abs(chartDateOffset) === 0 ? '7' : Math.abs(chartDateOffset)} days`}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'Last 7 days') setChartDateOffset(0);
                        else if (value === 'Last 14 days') setChartDateOffset(-7);
                        else if (value === 'Last 21 days') setChartDateOffset(-14);
                      }}
                    >
                      <option>Last 7 days</option>
                      <option>Last 14 days</option>
                      <option>Last 21 days</option>
                    </ChartSelect>
                  </ChartControls>
                </ChartHeader>
                <div style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '700', color: '#1a202c' }}>
                  {formatPKR(orderStats.totalRevenue)} <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '500' }}>↗ {orderStats.totalOrders} Orders</span>
                </div>
                <ChartContainer2>

                  <ChartNavigation>
                    <NavButton
                      onClick={() => navigateChart('prev')}
                      title="Previous 7 days"
                    >
                      <FiChevronLeft />
                    </NavButton>
                    <DateRangeDisplay>
                      {getDateRangeText(chartDateOffset)}
                    </DateRangeDisplay>
                    <NavButton
                      onClick={() => navigateChart('next')}
                      disabled={chartDateOffset >= 0}
                      title="Next 7 days"
                    >
                      <FiChevronRight />
                    </NavButton>
                  </ChartNavigation>
                  <ChartCanvas className="chart-canvas">
                    {tooltip.show && (
                      <ChartTooltip
                        style={{
                          left: tooltip.x,
                          top: tooltip.y
                        }}
                      >
                        {tooltip.content}
                      </ChartTooltip>
                    )}
                    {(() => {
                      // Extract data from chartData
                      const { orderData, maxRevenue, maxOrders, hasAnyData } = chartData;

                      // Show "no data" message if there are no real orders
                      if (!hasAnyData) {
                        return (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '300px',
                            color: '#64748b',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                            <h3 style={{ color: '#1a202c', marginBottom: '0.5rem' }}>No Sales Data Yet</h3>
                            <p>Your sales chart will appear here once you start receiving orders.</p>
                          </div>
                        );
                      }

                      // Memoize normalized data to prevent re-calculation on hover
                      const revenuePoints = orderData.map((data, index) => ({
                        ...data,
                        normalized: data.revenue / maxRevenue
                      }));

                      const orderPoints = orderData.map((data, index) => ({
                        ...data,
                        normalized: data.orders / maxOrders
                      }));

                      // Y-axis labels starting from 0
                      const yAxisLabels = (() => {
                        const max = Math.max(maxRevenue, maxOrders * 500); // Scale orders for comparison
                        const step = Math.ceil(max / 5) / 1000 * 1000; // Round to nearest 1000
                        return Array.from({ length: 6 }, (_, i) => {
                          const value = i * step;
                          return value >= 1000 ? `${Math.round(value / 1000)}K` : `${value}`;
                        });
                      })();

                      return (
                        <>
                          <ChartGrid>
                            {[0, 25, 50, 75, 100].map((top, index) => (
                              <GridLine key={index} top={top} />
                            ))}
                          </ChartGrid>
                          <ChartArea>
                            <YAxis>
                              {yAxisLabels.map((label, index) => (
                                <YAxisLabel key={index}>{label}</YAxisLabel>
                              ))}
                            </YAxis>
                            <BarChart viewBox="0 0 100 100" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.6" />
                                </linearGradient>
                                <linearGradient id="orderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.6" />
                                </linearGradient>
                              </defs>

                              {/* Revenue Bars */}
                              {revenuePoints.map((point, index) => {
                                const barWidth = 70 / (revenuePoints.length * 2); // Half width for grouped bars
                                const x = 15 + (index / (revenuePoints.length - 1)) * 70 - barWidth;
                                const barHeight = point.normalized * 80;
                                const y = 85 - barHeight;
                                return (
                                  <rect
                                    key={`revenue-bar-${index}`}
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    fill="url(#revenueGradient)"
                                    stroke="#3b82f6"
                                    strokeWidth="0.1"
                                    style={{
                                      cursor: 'pointer',
                                      filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2))'
                                    }}
                                    onMouseEnter={(e) => handlePointHover(e, point, 'revenue')}
                                    onMouseLeave={handlePointLeave}
                                  />
                                );
                              })}

                              {/* Order Bars */}
                              {orderPoints.map((point, index) => {
                                const barWidth = 70 / (orderPoints.length * 2); // Half width for grouped bars
                                const x = 15 + (index / (orderPoints.length - 1)) * 70;
                                const barHeight = point.normalized * 80;
                                const y = 85 - barHeight;
                                return (
                                  <rect
                                    key={`order-bar-${index}`}
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    fill="url(#orderGradient)"
                                    stroke="#60a5fa"
                                    strokeWidth="0.1"
                                    style={{
                                      cursor: 'pointer',
                                      filter: 'drop-shadow(0 2px 4px rgba(96, 165, 250, 0.2))'
                                    }}
                                    onMouseEnter={(e) => handlePointHover(e, point, 'orders')}
                                    onMouseLeave={handlePointLeave}
                                  />
                                );
                              })}
                            </BarChart>
                          </ChartArea>
                          <XAxis>
                            {orderData.map((data, index) => (
                              <XAxisLabel key={`${data.date}-${index}`}>{data.shortLabel}</XAxisLabel>
                            ))}
                          </XAxis>
                        </>
                      );
                    })()}


                  </ChartCanvas>
                </ChartContainer2>
              </ChartContainer>

              <TopProductsContainer>
                <TopProductsHeader>
                  <TopProductsTitle>Top Products</TopProductsTitle>
                </TopProductsHeader>
                <TopProductsList>
                  {topProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                      No products available. Add products to see top performers.
                    </div>
                  ) : (
                    topProducts.map((product, index) => {
                      const colors = ['#fef3c7', '#ddd6fe', '#fed7aa', '#e0e7ff', '#dcfce7', '#fce7f3'];
                      const icons = ['👓', '🕶️', '👁️', '🔍', '💎', '⭐'];

                      return (
                        <TopProductItem key={product.id}>
                          <TopProductImage color={colors[index % colors.length]}>
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                              />
                            ) : (
                              icons[index % icons.length]
                            )}
                          </TopProductImage>
                          <TopProductInfo>
                            <TopProductName>{product.name}</TopProductName>
                            <ProductStats>
                              {formatPKR(product.price)}
                              {product.featured && ' • Featured'}
                              {product.bestSeller && ' • Best Seller'}
                              {product.discount?.hasDiscount && ` • ${product.discount.discountPercentage}% OFF`}
                            </ProductStats>
                          </TopProductInfo>
                        </TopProductItem>
                      );
                    })
                  )}
                </TopProductsList>
              </TopProductsContainer>
            </ContentGrid>
          </>
        )}

        {activeTab !== 'dashboard' && (
          <>
            <DashboardHeader>
              <HeaderLeft>
                <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <FiX /> : <FiMenu />}
                </MobileMenuButton>
                <SearchContainer>
                  <SearchIcon />
                  <SearchInput placeholder="Search" />
                </SearchContainer>
              </HeaderLeft>
              <HeaderRight>
                <AdminHeader
                  showNotifications={showNotifications}
                  setShowNotifications={setShowNotifications}
                  showProfileMenu={showProfileMenu}
                  setShowProfileMenu={setShowProfileMenu}
                  notifications={notifications}
                  unreadNotifications={unreadNotifications}
                  handleLogout={handleLogout}
                  setActiveTab={setActiveTab}
                />
              </HeaderRight>
            </DashboardHeader>
            <ContentArea>
              {/* Product Type Selection Modal */}
              {showProductTypeModal && (
                <ModalOverlay onClick={handleCloseModal}>
                  <ModalContent onClick={(e) => e.stopPropagation()}>
                    <ModalClose onClick={handleCloseModal}>×</ModalClose>
                    <ModalHeader>
                      <h2>Choose Product Type</h2>
                      <p>Select the type of product you want to add</p>
                    </ModalHeader>
                    <ProductTypeGrid>
                      <ProductTypeCard onClick={() => handleProductTypeSelect('eyewear')}>
                        <span className="icon">👓</span>
                        <h3>Eyewear Product</h3>
                        <p>Add sunglasses, eyeglasses, reading glasses, and other eyewear products</p>
                      </ProductTypeCard>
                      <ProductTypeCard onClick={() => handleProductTypeSelect('lens')}>
                        <span className="icon">🔍</span>
                        <h3>Lens Product</h3>
                        <p>Add contact lenses, lens solutions, and lens accessories</p>
                      </ProductTypeCard>
                    </ProductTypeGrid>
                  </ModalContent>
                </ModalOverlay>
              )}

              {/* Eyewear Product Form */}
              {activeTab === 'add-eyewear-product' && (
                <>
                  <FormContainer>
                    <FormHeader>
                      <h2>👓 Add Eyewear Product</h2>
                      <BackButton onClick={handleBackToTypeSelection}>
                        ← Back to Selection
                      </BackButton>
                    </FormHeader>
                  </FormContainer>
                  <ProductFormContainer>
                    <ProductFormHeader>
                      <h2>Add New Product</h2>
                      {successMessage && (
                        <SuccessMessage>{successMessage}</SuccessMessage>
                      )}
                    </ProductFormHeader>

                    <Form onSubmit={handleSubmit}>
                      <ProductFormLayout>
                        <ProductFormMain>
                          <TabContainer>
                            <TabButton active={true}>General</TabButton>

                          </TabContainer>
                          <FormGroup>
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                              type="text"
                              id="name"
                              name="name"
                              value={productData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="price">Price (PKR)</Label>
                            <Input
                              type="number"
                              id="price"
                              name="price"
                              min="0"
                              step="0.01"
                              value={productData.price}
                              onChange={handleInputChange}
                              required
                            />
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="material">Material</Label>
                            <Select
                              id="material"
                              name="material"
                              value={productData.material}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Material</option>
                              {materials.map(material => (
                                <option key={material} value={material}>
                                  {material.charAt(0).toUpperCase() + material.slice(1)}
                                </option>
                              ))}
                            </Select>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="shape">Shape</Label>
                            <Select
                              id="shape"
                              name="shape"
                              value={productData.shape}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Shape</option>
                              {shapes.map(shape => (
                                <option key={shape} value={shape}>
                                  {shape.charAt(0).toUpperCase() + shape.slice(1)}
                                </option>
                              ))}
                            </Select>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="rim">Rim Type</Label>
                            <Select
                              id="rim"
                              name="rim"
                              value={productData.rim}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Rim Type</option>
                              {rimOptions.map(rim => (
                                <option key={rim} value={rim}>
                                  {rim}
                                </option>
                              ))}
                            </Select>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="style">Style</Label>
                            <Select
                              id="style"
                              name="style"
                              value={productData.style}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Style</option>
                              {styleOptions.map(style => (
                                <option key={style} value={style}>
                                  {style}
                                </option>
                              ))}
                            </Select>
                          </FormGroup>

                          <FormGroup>
                            <Label>Available Colors</Label>
                            <ColorRadioContainer>
                              {colorOptions.map(colorOption => (
                                <ColorRadioOption
                                  key={colorOption.name}
                                  selected={Array.isArray(productData.colors) && productData.colors.some(c => c.name === colorOption.name)}
                                >
                                  <RadioInput
                                    type="checkbox"
                                    checked={Array.isArray(productData.colors) && productData.colors.some(c => c.name === colorOption.name)}
                                    onChange={() => handleColorToggle(colorOption)}
                                  />
                                  <ColorSwatch color={colorOption.hex} />
                                  <ColorInfo>
                                    <ColorName>{colorOption.name}</ColorName>
                                    <ColorHex>{colorOption.hex}</ColorHex>
                                  </ColorInfo>
                                </ColorRadioOption>
                              ))}
                            </ColorRadioContainer>
                          </FormGroup>

                          {/* Color-Specific Images Section */}
                          {Array.isArray(productData.colors) && productData.colors.length > 0 && (
                            <ColorImageSection>
                              <ColorImageTitle>
                                🎨 Color-Specific Images
                              </ColorImageTitle>
                              <p style={{
                                margin: '0 0 1.5rem 0',
                                color: '#64748b',
                                fontSize: '0.875rem',
                                lineHeight: '1.5'
                              }}>
                                Upload specific images for each color variant. These images will be shown when customers select different colors.
                              </p>
                              <ColorImageGrid>
                                {productData.colors.map((color) => (
                                  <ColorImageItem key={color.name}>
                                    <ColorImageHeader>
                                      <ColorImageLabel>
                                        <ColorSwatch color={color.hex} />
                                        {color.name}
                                      </ColorImageLabel>
                                      <ColorImageUploadButton
                                        type="button"
                                        onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.accept = 'image/*';
                                          input.multiple = true;
                                          input.onchange = (e) => handleColorImageUpload(color.name, e.target.files);
                                          input.click();
                                        }}
                                      >
                                        <FiUpload />
                                        Add Images
                                      </ColorImageUploadButton>
                                    </ColorImageHeader>

                                    {productData.colorImages && productData.colorImages[color.name] && productData.colorImages[color.name].length > 0 ? (
                                      <ColorImageGallery>
                                        {productData.colorImages[color.name].map((image, index) => (
                                          <ColorImagePreview key={index}>
                                            <img src={image} alt={`${color.name} variant ${index + 1}`} />
                                            <ColorImageRemoveButton
                                              type="button"
                                              onClick={() => removeColorImage(color.name, index)}
                                              title="Remove image"
                                            >
                                              ×
                                            </ColorImageRemoveButton>
                                          </ColorImagePreview>
                                        ))}
                                      </ColorImageGallery>
                                    ) : (
                                      <ColorImagePlaceholder>
                                        <span>📷</span>
                                        <span>No images uploaded for {color.name} yet. Click "Add Images" to upload photos for this color variant.</span>
                                      </ColorImagePlaceholder>
                                    )}
                                  </ColorImageItem>
                                ))}
                              </ColorImageGrid>
                            </ColorImageSection>
                          )}

                          {/* Frame Color */}
                          <FormGroup>
                            <Label htmlFor="frameColor">Frame Color</Label>
                            <Input
                              type="text"
                              id="frameColor"
                              name="frameColor"
                              value={productData.frameColor}
                              onChange={handleInputChange}
                            />
                          </FormGroup>


                          {/* Lens Types */}
                          <FormGroup>
                            <Label>Available Lens Types</Label>
                            <CheckboxContainer>
                              {lensTypeOptions.map(lensType => (
                                <CheckboxLabel key={lensType}>
                                  <input
                                    type="checkbox"
                                    checked={productData.lensTypes?.includes(lensType) || false}
                                    onChange={() => handleLensTypeToggle(lensType)}
                                  />
                                  {lensType}
                                </CheckboxLabel>
                              ))}
                            </CheckboxContainer>
                          </FormGroup>

                          {/* Discount */}
                          <FormGroup>
                            <Label>Discount</Label>
                            <CheckboxLabel>
                              <input
                                type="checkbox"
                                checked={(productData && productData.discount) ? productData.discount.hasDiscount : false}
                                onChange={handleDiscountToggle}
                              />
                              Apply Discount
                            </CheckboxLabel>

                            {(productData && productData.discount && productData.discount.hasDiscount) && (
                              <div style={{ marginTop: '10px' }}>
                                <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                                <Input
                                  type="number"
                                  id="discountPercentage"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={(productData && productData.discount) ? productData.discount.discountPercentage : 0}
                                  onChange={handleDiscountPercentageChange}
                                />
                              </div>
                            )}
                          </FormGroup>

                          {/* Product Status */}
                          <FormGroup>
                            <Label htmlFor="status">Product Status</Label>
                            <Select
                              id="status"
                              name="status"
                              value={productData.status}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Status</option>
                              {statusOptions.map(status => (
                                <option key={status} value={status}>
                                  {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </option>
                              ))}
                            </Select>
                          </FormGroup>

                          {/* Product Description */}
                          <FormGroup>
                            <Label htmlFor="description">Product Description</Label>
                            <TextArea
                              id="description"
                              name="description"
                              value={productData.description}
                              onChange={handleInputChange}
                            />
                          </FormGroup>
                        </ProductFormMain>

                        <ProductFormSidebar>
                          <SidebarSection>
                            <SidebarTitle>Thumbnail</SidebarTitle>
                            <ThumbnailContainer>
                              <ThumbnailImage onClick={handleUploadClick}>
                                {previewUrl ? (
                                  <img src={previewUrl} alt="Product thumbnail" />
                                ) : (
                                  <ThumbnailPlaceholder>
                                    <span>📷</span>
                                    <span>Click to upload thumbnail image</span>
                                  </ThumbnailPlaceholder>
                                )}
                              </ThumbnailImage>
                              <FileInput
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleFileSelect}
                              />
                            </ThumbnailContainer>
                          </SidebarSection>

                          <SidebarSection>
                            <SidebarTitle>Status</SidebarTitle>
                            <StatusContainer>
                              <StatusIndicator status="draft" />
                              <Select
                                value={productData.featured && productData.bestSeller ? 'both' : productData.featured ? 'featured' : productData.bestSeller ? 'bestSeller' : 'draft'}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setProductData({
                                    ...productData,
                                    featured: value === 'featured' || value === 'both',
                                    bestSeller: value === 'bestSeller' || value === 'both'
                                  });
                                }}
                              >
                                <option value="draft">Draft</option>
                                <option value="featured">Featured</option>
                                <option value="bestSeller">Best Seller</option>
                                <option value="both">Featured & Best Seller</option>
                              </Select>
                            </StatusContainer>
                          </SidebarSection>

                          <SidebarSection>
                            <SidebarTitle>Product Details</SidebarTitle>
                            <DetailsList>
                              <DetailsItem>
                                <Label>Categories</Label>
                                <Select
                                  name="category"
                                  value={productData.category}
                                  onChange={handleInputChange}
                                  required
                                >
                                  <option value="">Select Category</option>
                                  {categories.map(category => (
                                    <option key={category} value={category}>
                                      {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </option>
                                  ))}
                                </Select>
                              </DetailsItem>

                              <DetailsItem>
                                <Label>Material</Label>
                                <Select
                                  name="material"
                                  value={productData.material}
                                  onChange={handleInputChange}
                                >
                                  <option value="">Select Material</option>
                                  {materials.map(material => (
                                    <option key={material} value={material}>
                                      {material.charAt(0).toUpperCase() + material.slice(1)}
                                    </option>
                                  ))}
                                </Select>
                              </DetailsItem>

                              <DetailsItem>
                                <Label>Tags</Label>
                                <TagsContainer>
                                  <TagInput placeholder="Sunglasses" />
                                </TagsContainer>
                              </DetailsItem>
                            </DetailsList>
                          </SidebarSection>

                          <SidebarSection>
                            <SidebarTitle>Brand</SidebarTitle>
                            <DetailsList>
                              <DetailsItem>
                                <Input
                                  type="text"
                                  name="brand"
                                  value={productData.brand}
                                  onChange={handleInputChange}
                                  placeholder="Enter brand name"
                                />
                              </DetailsItem>
                            </DetailsList>
                          </SidebarSection>

                          <SidebarSection>
                            <SidebarTitle>Gender</SidebarTitle>
                            <DetailsList>
                              <DetailsItem>
                                <Select
                                  name="gender"
                                  value={productData.gender}
                                  onChange={handleInputChange}
                                >
                                  <option value="">Select Gender</option>
                                  {genders.map(gender => (
                                    <option key={gender} value={gender}>
                                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                                    </option>
                                  ))}
                                </Select>
                              </DetailsItem>
                            </DetailsList>
                          </SidebarSection>

                          <SidebarSection>
                            <SidebarTitle>Type</SidebarTitle>
                            <DetailsList>
                              <DetailsItem>
                                <Select
                                  name="type"
                                  value={productData.type}
                                  onChange={handleInputChange}
                                >
                                  <option value="">Select Type (Optional)</option>
                                  {typeOptions.slice(1).map(type => (
                                    <option key={type} value={type}>
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                  ))}
                                </Select>
                              </DetailsItem>
                            </DetailsList>
                          </SidebarSection>

                          <SidebarSection>
                            <SidebarTitle>Available Sizes</SidebarTitle>
                            <DetailsList>
                              <DetailsItem>
                                <Select
                                  name="sizes"
                                  value={productData.sizes?.[0] || ''}
                                  onChange={(e) => {
                                    console.log('📏 DEBUG: Size selection triggered!');
                                    const selectedSize = e.target.value;
                                    console.log('📏 DEBUG: Selected size:', selectedSize);
                                    console.log('📏 DEBUG: Current sizes:', productData.sizes);

                                    if (selectedSize && !productData.sizes?.includes(selectedSize)) {
                                      const newSizes = [...(productData.sizes || []), selectedSize];
                                      console.log('📏 DEBUG: Adding size. New sizes array:', newSizes);

                                      setProductData({
                                        ...productData,
                                        sizes: newSizes
                                      });

                                      setSuccessMessage(`✅ Size "${selectedSize}" added`);
                                      setTimeout(() => setSuccessMessage(''), 2000);
                                    } else if (selectedSize && productData.sizes?.includes(selectedSize)) {
                                      console.log('📏 DEBUG: Size already exists:', selectedSize);
                                      setSuccessMessage(`⚠️ Size "${selectedSize}" already added`);
                                      setTimeout(() => setSuccessMessage(''), 2000);
                                    }
                                  }}
                                >
                                  <option value="">Select a size</option>
                                  {sizeOptions.map(size => (
                                    <option key={size} value={size}>
                                      {size}
                                    </option>
                                  ))}
                                </Select>
                                {Array.isArray(productData.sizes) && productData.sizes.length > 0 && (
                                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {productData.sizes.map((size, index) => (
                                      <span
                                        key={index}
                                        style={{
                                          background: '#3b82f6',
                                          color: 'white',
                                          padding: '4px 8px',
                                          borderRadius: '12px',
                                          fontSize: '12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}
                                      >
                                        {size}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setProductData({
                                              ...productData,
                                              sizes: productData.sizes.filter(s => s !== size)
                                            });
                                          }}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            padding: '0',
                                            lineHeight: '1'
                                          }}
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </DetailsItem>
                            </DetailsList>
                          </SidebarSection>

                          <SidebarSection>
                            <SidebarTitle>Features</SidebarTitle>
                            <DetailsList>
                              <DetailsItem>
                                <Select
                                  name="features"
                                  value=""
                                  onChange={(e) => {
                                    const selectedFeature = e.target.value;
                                    if (selectedFeature && !productData.features?.includes(selectedFeature)) {
                                      setProductData({
                                        ...productData,
                                        features: [...(productData.features || []), selectedFeature]
                                      });
                                    }
                                  }}
                                >
                                  <option value="">Select a feature</option>
                                  {featureOptions.map(feature => (
                                    <option key={feature} value={feature}>
                                      {feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </option>
                                  ))}
                                </Select>
                                {Array.isArray(productData.features) && productData.features.length > 0 && (
                                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {productData.features.map((feature, index) => (
                                      <span
                                        key={index}
                                        style={{
                                          background: '#10b981',
                                          color: 'white',
                                          padding: '4px 8px',
                                          borderRadius: '12px',
                                          fontSize: '12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}
                                      >
                                        {feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setProductData({
                                              ...productData,
                                              features: productData.features.filter(f => f !== feature)
                                            });
                                          }}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            padding: '0',
                                            lineHeight: '1'
                                          }}
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </DetailsItem>
                            </DetailsList>
                          </SidebarSection>

                          <SidebarSection>
                            <SidebarTitle>Product Gallery</SidebarTitle>
                            <DetailsList>
                              <DetailsItem>
                                <MediaUploadArea onClick={() => document.getElementById('galleryUpload').click()}>
                                  <MediaUploadIcon>🖼️</MediaUploadIcon>
                                  <MediaUploadText>
                                    {productData.gallery?.length || 0} images selected
                                    <br />
                                    Click to add gallery images
                                  </MediaUploadText>
                                  <FileInput
                                    type="file"
                                    id="galleryUpload"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGalleryUpload}
                                  />
                                </MediaUploadArea>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                  {(Array.isArray(productData.gallery) ? productData.gallery : []).map((img, index) => (
                                    <div key={index} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                      <img
                                        src={img}
                                        alt={`Gallery ${index}`}
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                          borderRadius: '4px',
                                          border: '1px solid #e2e8f0'
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeGalleryImage(index)}
                                        style={{
                                          position: 'absolute',
                                          top: '-6px',
                                          right: '-6px',
                                          background: '#ef4444',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '50%',
                                          width: '18px',
                                          height: '18px',
                                          cursor: 'pointer',
                                          fontSize: '10px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </DetailsItem>
                            </DetailsList>
                            <SubmitButton
                              type="submit"
                              disabled={isLoading}
                            >
                              {isLoading ? 'Adding Product...' : 'Add Product'}
                            </SubmitButton>

                          </SidebarSection>
                        </ProductFormSidebar>
                      </ProductFormLayout>
                    </Form>
                  </ProductFormContainer>
                </>
              )}

              {/* Lens Product Form */}
              {activeTab === 'add-lens-product' && (
                <>
                  <FormContainer>
                    <FormHeader>
                      <h2>🔍 Add Lens Product</h2>
                      <BackButton onClick={handleBackToTypeSelection}>
                        ← Back to Selection
                      </BackButton>
                    </FormHeader>
                  </FormContainer>
                  <ProductFormContainer>
                    <ProductFormHeader>
                      <h2>Lens Product Details</h2>
                      <p>Add comprehensive information about your lens product</p>
                    </ProductFormHeader>

                    <Form onSubmit={handleSubmit}>
                      <ProductFormLayout>
                        <ProductFormMain>
                          {/* Basic Information */}
                          <FormSection>
                            <SectionTitle>📋 Basic Information</SectionTitle>

                            <FormGroup>
                              <Label htmlFor="name">Product Name *</Label>
                              <Input
                                type="text"
                                id="name"
                                name="name"
                                value={productData.name}
                                onChange={handleLensInputChange}
                                placeholder="e.g., Daily Comfort Contact Lenses"
                                required
                              />
                              <FormHint>Enter a descriptive name for your lens product</FormHint>
                            </FormGroup>

                            <FormGroup>
                              <Label htmlFor="price">Price (PKR) *</Label>
                              <Input
                                type="number"
                                id="price"
                                name="price"
                                min="0"
                                step="0.01"
                                value={productData.price}
                                onChange={handleLensInputChange}
                                placeholder="2500"
                                required
                              />
                            </FormGroup>

                            <FormGroup>
                              <Label htmlFor="category">Lens Category *</Label>
                              <Select
                                id="category"
                                name="category"
                                value={productData.category}
                                onChange={handleLensInputChange}
                                required
                              >
                                <option value="">Select Category</option>
                                <option value="contact-lenses">Contact Lenses</option>
                                <option value="transparent-lenses">Transparent Lenses</option>
                                <option value="colored-lenses">Colored Lenses</option>
                                <option value="prescription-lenses">Prescription Lenses</option>
                              </Select>
                            </FormGroup>

                            <FormGroup>
                              <Label>
                                <input
                                  type="checkbox"
                                  name="hasPowerOptions"
                                  checked={productData.hasPowerOptions || false}
                                  onChange={handleLensInputChange}
                                  style={{ marginRight: '8px' }}
                                />
                                Has Power Options
                              </Label>
                              <FormHint>Check if this lens product is available in different powers</FormHint>
                            </FormGroup>

                            <FormGroup>
                              <Label htmlFor="lensType">Lens Type</Label>
                              <Select
                                id="lensType"
                                name="lensType"
                                value={productData.lensType || ''}
                                onChange={handleLensInputChange}
                              >
                                <option value="">Select Type</option>
                                <option value="Daily">Daily Disposable</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Yearly">Yearly</option>
                                <option value="Colored">Colored</option>
                                <option value="Toric">Toric (Astigmatism)</option>
                                <option value="Multifocal">Multifocal</option>
                              </Select>
                            </FormGroup>
                          </FormSection>

                          {/* Lens Colors */}
                          <FormSection>
                            <SectionTitle>🎨 Available Lens Colors</SectionTitle>

                            <FormGroup>
                              <Label>Select Available Colors</Label>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                                {lensColorOptions.map(color => (
                                  <div key={color.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
                                    <div 
                                      style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        backgroundColor: color.hex, 
                                        borderRadius: '50%', 
                                        border: '2px solid #e2e8f0',
                                        marginBottom: '5px'
                                      }}
                                    ></div>
                                    <CheckboxLabel style={{ fontSize: '12px', textAlign: 'center' }}>
                                      <input
                                        type="checkbox"
                                        checked={(productData.lensColors || []).includes(color.id)}
                                        onChange={() => handleLensColorToggle(color.id)}
                                        style={{ marginRight: '4px' }}
                                      />
                                      {color.name}
                                    </CheckboxLabel>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveLensColor(color.id)}
                                      style={{
                                        position: 'absolute',
                                        top: '2px',
                                        right: '2px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '18px',
                                        height: '18px',
                                        fontSize: '10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div style={{ display: 'flex', gap: '10px', alignItems: 'end', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ flex: 1 }}>
                                  <Label htmlFor="newColorName">Add New Color</Label>
                                  <Input
                                    type="text"
                                    id="newColorName"
                                    value={newColorName}
                                    onChange={(e) => setNewColorName(e.target.value)}
                                    placeholder="Color name"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="newColorHex">Color</Label>
                                  <input
                                    type="color"
                                    id="newColorHex"
                                    value={newColorHex}
                                    onChange={(e) => setNewColorHex(e.target.value)}
                                    style={{ width: '50px', height: '38px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleAddLensColor}
                                  style={{
                                    padding: '8px 16px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    height: '38px'
                                  }}
                                >
                                  Add
                                </button>
                              </div>
                            </FormGroup>
                          </FormSection>

                          {/* Lens Specifications */}
                          <FormSection>
                            <SectionTitle>🔬 Lens Specifications</SectionTitle>

                            <FormGroup>
                              <Label htmlFor="material">Material</Label>
                              <Select
                                id="material"
                                name="material"
                                value={productData.material}
                                onChange={handleLensInputChange}
                              >
                                <option value="">Select Material</option>
                                <option value="Hydrogel">Hydrogel</option>
                                <option value="Silicone Hydrogel">Silicone Hydrogel</option>
                                <option value="PMMA">PMMA</option>
                                <option value="RGP">Rigid Gas Permeable (RGP)</option>
                              </Select>
                            </FormGroup>

                            <FormGroup>
                              <Label htmlFor="waterContent">Water Content (%)</Label>
                              <Input
                                type="number"
                                id="waterContent"
                                name="waterContent"
                                min="0"
                                max="100"
                                value={productData.waterContent || ''}
                                onChange={handleLensInputChange}
                                placeholder="58"
                              />
                            </FormGroup>

                            <FormGroup>
                              <Label htmlFor="baseCurve">Base Curve (mm)</Label>
                              <Input
                                type="number"
                                id="baseCurve"
                                name="baseCurve"
                                step="0.1"
                                min="8.0"
                                max="10.0"
                                value={productData.baseCurve || ''}
                                onChange={handleLensInputChange}
                                placeholder="8.6"
                              />
                            </FormGroup>

                            <FormGroup>
                              <Label htmlFor="diameter">Diameter (mm)</Label>
                              <Input
                                type="number"
                                id="diameter"
                                name="diameter"
                                step="0.1"
                                min="13.0"
                                max="15.0"
                                value={productData.diameter || ''}
                                onChange={handleLensInputChange}
                                placeholder="14.2"
                              />
                            </FormGroup>
                          </FormSection>

                          {/* Available Powers - Only show when hasPowerOptions is checked */}
                          {productData.hasPowerOptions && (
                            <FormSection>
                              <SectionTitle>👁️ Available Powers</SectionTitle>

                              <FormGroup>
                                <Label htmlFor="powerRange">Power Range</Label>
                                <Input
                                  type="text"
                                  id="powerRange"
                                  name="powerRange"
                                  value={productData.powerRange || ''}
                                  onChange={handleLensInputChange}
                                  placeholder="e.g., -10.00 to +6.00"
                                />
                                <FormHint>Specify the available power range for this lens</FormHint>
                              </FormGroup>

                              <FormGroup>
                                <Label>Available Features</Label>
                                <CheckboxContainer>
                                  {['UV Protection', 'Blue Light Filter', 'Moisture Lock', 'Anti-Bacterial', 'Oxygen Permeable', 'Astigmatism Correction'].map(feature => (
                                    <CheckboxLabel key={feature}>
                                      <input
                                        type="checkbox"
                                        checked={productData.features?.includes(feature) || false}
                                        onChange={() => handleFeatureToggle(feature)}
                                      />
                                      {feature}
                                    </CheckboxLabel>
                                  ))}
                                </CheckboxContainer>
                              </FormGroup>
                            </FormSection>
                          )}

                          {/* Product Description */}
                          <FormSection>
                            <SectionTitle>📝 Product Description</SectionTitle>

                            <FormGroup>
                              <Label htmlFor="description">Description</Label>
                              <TextArea
                                id="description"
                                name="description"
                                value={productData.description}
                                onChange={handleLensInputChange}
                                placeholder="Describe the lens product, its benefits, and usage instructions..."
                                rows="4"
                              />
                            </FormGroup>
                          </FormSection>
                        </ProductFormMain>

                        <ProductFormSidebar>
                          {/* Thumbnail Upload Section */}
                          <ImageSection>
                            <SectionTitle>📸 Lens Thumbnail</SectionTitle>

                            <MainImageContainer>
                              <MainImagePreview>
                                {productData.thumbnail ? (
                                  <img src={productData.thumbnail} alt="Lens thumbnail" style={{ borderRadius: '8px' }} />
                                ) : (
                                  <div className="placeholder">
                                    <FiUpload size={24} />
                                    <p>No thumbnail selected</p>
                                  </div>
                                )}
                              </MainImagePreview>

                              <ImageActions>
                                <ActionButton primary onClick={() => document.getElementById('lensThumbnailInput').click()}>
                                  <FiUpload />
                                  Upload Thumbnail
                                </ActionButton>
                                {productData.thumbnail && (
                                  <ActionButton onClick={() => setProductData({ ...productData, thumbnail: '' })}>
                                    <FiX />
                                    Remove Thumbnail
                                  </ActionButton>
                                )}
                              </ImageActions>
                            </MainImageContainer>

                            <input
                              id="lensThumbnailInput"
                              type="file"
                              accept="image/*"
                              onChange={handleLensThumbnailUpload}
                              style={{ display: 'none' }}
                            />
                          </ImageSection>

                          {/* Product Status & Settings */}
                          <SidebarSection>
                            <SidebarTitle>⚙️ Product Settings</SidebarTitle>

                            <DetailsList>
                              <DetailsItem>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                  id="status"
                                  name="status"
                                  value={productData.status}
                                  onChange={handleLensInputChange}
                                >
                                  {lensStatusOptions.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </Select>
                              </DetailsItem>

                              <DetailsItem>
                                <CheckboxLabel>
                                  <input
                                    type="checkbox"
                                    checked={productData.featured || false}
                                    onChange={handleFeaturedToggle}
                                  />
                                  Featured Product
                                </CheckboxLabel>
                              </DetailsItem>
                            </DetailsList>
                          </SidebarSection>

                          {/* Discount Settings */}
                          <SidebarSection>
                            <SidebarTitle>💰 Pricing & Discounts</SidebarTitle>

                            <DetailsList>
                              <DetailsItem>
                                <CheckboxLabel>
                                  <input
                                    type="checkbox"
                                    checked={(productData && productData.discount) ? productData.discount.hasDiscount : false}
                                    onChange={handleDiscountToggle}
                                  />
                                  Apply Discount
                                </CheckboxLabel>

                                {(productData && productData.discount && productData.discount.hasDiscount) && (
                                  <div style={{ marginTop: '10px' }}>
                                    <Label htmlFor="discountPercentage">Discount %</Label>
                                    <Input
                                      type="number"
                                      id="discountPercentage"
                                      min="0"
                                      max="100"
                                      step="1"
                                      value={(productData && productData.discount) ? productData.discount.discountPercentage : 0}
                                      onChange={handleDiscountPercentageChange}
                                    />
                                  </div>
                                )}
                              </DetailsItem>
                            </DetailsList>
                          </SidebarSection>
                        </ProductFormSidebar>
                      </ProductFormLayout>

                      <SubmitButton type="submit" disabled={isLoading}>
                        {isLoading ? 'Adding Lens Product...' : 'Add Lens Product'}
                      </SubmitButton>
                    </Form>
                  </ProductFormContainer>
                </>
              )}

              {activeTab === 'manage-products' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <h2>Manage Products</h2>
                      <button
                        onClick={() => {
                          setIsLoading(true);
                          dispatch(fetchProducts()).then(() => {
                            setIsLoading(false);
                            setSuccessMessage('✅ Product list refreshed successfully!');
                            setTimeout(() => setSuccessMessage(''), 3000);
                          }).catch(() => {
                            setIsLoading(false);
                            setSuccessMessage('❌ Failed to refresh product list');
                            setTimeout(() => setSuccessMessage(''), 3000);
                          });
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        disabled={isLoading}
                      >
                        🔄 Refresh List
                      </button>

                      <button
                        onClick={handleCheckSyncStatus}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        disabled={isLoading}
                      >
                        📊 Check Sync
                      </button>

                      <button
                        onClick={handleSyncProductIds}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        disabled={isLoading}
                      >
                        🔗 Sync IDs
                      </button>

                      <button
                        onClick={handleQuickIdSync}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        disabled={isLoading}
                      >
                        ⚡ Quick Sync
                      </button>

                      <button
                        onClick={() => {
                          console.log('🔍 DEBUG: Current productData:', productData);
                          console.log('🔍 DEBUG: Style:', productData.style);
                          console.log('🔍 DEBUG: Gender:', productData.gender);
                          console.log('🔍 DEBUG: Status:', productData.status);
                          console.log('🔍 DEBUG: Colors:', productData.colors);
                          alert(`Style: ${productData.style || 'Not set'}\nGender: ${productData.gender || 'Not set'}\nStatus: ${productData.status || 'Not set'}\nColors: ${productData.colors?.length || 0} selected`);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        🔍 Debug State
                      </button>

                      <button
                        onClick={() => {
                          console.log('🧪 TEST: Manually triggering handleInputChange');
                          const fakeEvent = {
                            target: {
                              name: 'style',
                              value: 'Classic'
                            }
                          };
                          handleInputChange(fakeEvent);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        🧪 Test Handler
                      </button>

                      <button
                        onClick={handleQuickFixProductId}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        disabled={isLoading}
                      >
                        🔧 Quick Fix ID 98
                      </button>

                      <button
                        onClick={handleDeleteAllProducts}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#7c2d12',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginLeft: '1rem'
                        }}
                        disabled={isLoading}
                      >
                        🗑️ Delete All Products
                      </button>
                    </div>
                    {dataSource !== 'unknown' && (
                      <div style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        background: dataSource === 'api' ? '#dcfce7' : '#fef3c7',
                        color: dataSource === 'api' ? '#166534' : '#92400e',
                        border: `1px solid ${dataSource === 'api' ? '#bbf7d0' : '#fde68a'}`,
                        cursor: dataSource === 'localStorage' ? 'pointer' : 'default',
                        transition: 'all 0.2s ease'
                      }}
                        onClick={() => {
                          if (dataSource === 'localStorage') {
                            const hostname = window.location.hostname;
                            const isDeployed = !hostname.includes('localhost') &&
                              !hostname.includes('127.0.0.1') &&
                              !hostname.match(/^\d+\.\d+\.\d+\.\d+$/);

                            if (isDeployed) {
                              alert(`🌐 Deployed Website Mode\n\nYou're using a deployed version of the website. This is normal!\n\n✅ Products are loaded from built-in data\n✅ All features work normally\n✅ No backend server needed\n\nTo use live backend data:\n• Deploy your backend API separately\n• Set REACT_APP_PRODUCTS_API_URL environment variable\n\nCurrent URL: ${window.location.href}`);
                            } else {
                              alert(`📱 Mobile Connection Issue Detected!\n\nYour mobile device is using offline data. To see live products:\n\n1. Find your computer's IP address\n2. Access admin panel via: http://[YOUR-IP]:3000/admin\n3. Make sure product server is running on port 5004\n\nCurrent URL: ${window.location.href}\nAPI URL: ${window.location.hostname}:5004`);
                            }
                          }
                        }}
                        title={dataSource === 'localStorage' ? 'Click for troubleshooting help' : 'Connected to live backend'}
                      >
                        {dataSource === 'api' ? '🌐 Live Data' : (() => {
                          const hostname = window.location.hostname;
                          const isDeployed = !hostname.includes('localhost') &&
                            !hostname.includes('127.0.0.1') &&
                            !hostname.match(/^\d+\.\d+\.\d+\.\d+$/);
                          return isDeployed ? '🌐 Deployed Mode (Click for info)' : '📦 Offline Mode (Click for help)';
                        })()}
                      </div>
                    )}
                  </div>

                  {successMessage && (
                    <SuccessMessage>{successMessage}</SuccessMessage>
                  )}

                  <ProductList>
                    {isProductsLoading ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        Loading products...
                      </div>
                    ) : products && products.length > 0 ? (
                      products.map(product => (
                        <ProductCard key={product.id}>
                          <ProductImage>
                            {product.image ? (
                              <img src={product.image} alt={product.name} />
                            ) : (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                background: '#f8fafc',
                                color: '#64748b'
                              }}>
                                No Image
                              </div>
                            )}
                          </ProductImage>
                          <ProductInfo>
                            <ProductName>{product.name}</ProductName>
                            <ProductPrice>PKR {product.price}</ProductPrice>
                            <ProductCategory>{product.category}</ProductCategory>
                            <ProductStatus status={product.status}>
                              {product.featured && 'Featured '}
                              {product.bestSeller && 'Best Seller'}
                              {!product.featured && !product.bestSeller && 'Regular'}
                            </ProductStatus>
                          </ProductInfo>
                          <ProductActions>
                            <ActionButton
                              onClick={() => {
                                setSelectedProduct(product);
                                setProductData(product);
                                setActiveTab('edit-product');
                              }}
                            >
                              Edit
                            </ActionButton>
                            <ActionButton
                              danger
                              onClick={() => handleDeleteProduct(product.id || product._id)}
                            >
                              Delete
                            </ActionButton>
                          </ProductActions>
                        </ProductCard>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        No products found. <a href="#" onClick={() => setActiveTab('add-product')}>Add your first product</a>
                      </div>
                    )}
                  </ProductList>

                  {/* Mobile Add Product Button - Below Product Gallery */}
                  <MobileAddProductButton onClick={() => handleTabClick('add-product')}>
                    <FiPlus />
                    Add New Product
                  </MobileAddProductButton>
                </>
              )}

              {activeTab === 'orders' && (
                <OrderManagement />
              )}

              {activeTab === 'edit-product' && (
                <>
                  <ProductFormContainer>
                    <ProductFormHeader>
                      <h2>Edit Product</h2>
                      {successMessage && (
                        <SuccessMessage>{successMessage}</SuccessMessage>
                      )}
                    </ProductFormHeader>

                    <ProductFormLayout>
                      <ProductFormMain>
                        <TabContainer>
                          <TabButton active={true}>General</TabButton>
                        </TabContainer>

                        <Form onSubmit={handleUpdateSubmit}>
                          {/* Main Product Image Section */}
                          <ImageSection>
                            <SectionTitle>
                              📷 Product Image
                            </SectionTitle>
                            <MainImageContainer>
                              <MainImagePreview>
                                {productData.image ? (
                                  <img src={productData.image} alt="Product preview" />
                                ) : (
                                  <div className="placeholder">
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                    <div>No image selected</div>
                                  </div>
                                )}
                              </MainImagePreview>
                              <ImageActions>
                                <ImageActionButton
                                  type="button"
                                  primary
                                  onClick={() => document.getElementById('edit-main-image-input').click()}
                                >
                                  <FiUpload />
                                  {productData.image ? 'Change Image' : 'Upload Image'}
                                </ImageActionButton>
                                {productData.image && (
                                  <ImageActionButton
                                    type="button"
                                    onClick={() => setProductData({ ...productData, image: '' })}
                                  >
                                    <FiX />
                                    Remove Image
                                  </ImageActionButton>
                                )}
                                <HiddenFileInput
                                  id="edit-main-image-input"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setProductData({ ...productData, image: reader.result });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </ImageActions>
                            </MainImageContainer>
                          </ImageSection>

                          {/* Product Gallery Section */}
                          <ImageSection>
                            <SectionTitle>
                              🖼️ Product Gallery
                            </SectionTitle>
                            <GalleryContainer>
                              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                                Add multiple images to showcase your product from different angles
                              </p>
                              <GalleryGrid>
                                {(Array.isArray(productData.gallery) ? productData.gallery : []).map((image, index) => (
                                  <GalleryItem key={index}>
                                    <GalleryImage src={image} alt={`Gallery image ${index + 1}`} />
                                    <GalleryRemoveButton
                                      type="button"
                                      onClick={() => {
                                        const currentGallery = Array.isArray(productData.gallery) ? productData.gallery : [];
                                        const updatedGallery = [...currentGallery];
                                        updatedGallery.splice(index, 1);
                                        setProductData({ ...productData, gallery: updatedGallery });
                                      }}
                                    >
                                      <FiX />
                                    </GalleryRemoveButton>
                                  </GalleryItem>
                                ))}
                                <GalleryAddButton
                                  onClick={() => document.getElementById('edit-gallery-input').click()}
                                >
                                  <FiPlus />
                                  <span>Add Images</span>
                                </GalleryAddButton>
                              </GalleryGrid>
                              <HiddenFileInput
                                id="edit-gallery-input"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files);
                                  if (files.length > 0) {
                                    const newGalleryImages = [];
                                    let filesProcessed = 0;

                                    files.forEach(file => {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        newGalleryImages.push(reader.result);
                                        filesProcessed++;
                                        if (filesProcessed === files.length) {
                                          setProductData({
                                            ...productData,
                                            gallery: [...(productData.gallery || []), ...newGalleryImages]
                                          });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                  }
                                }}
                              />
                            </GalleryContainer>
                          </ImageSection>

                          <FormGroup>
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                              type="text"
                              id="name"
                              name="name"
                              value={productData.name}
                              onChange={handleInputChange}
                              placeholder="Sample Product"
                              required
                            />
                            <FormHint>Add a name that is recommended to be unique.</FormHint>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="price">Price (PKR)</Label>
                            <Input
                              type="number"
                              id="price"
                              name="price"
                              min="0"
                              step="0.01"
                              value={productData.price}
                              onChange={handleInputChange}
                              required
                            />
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="category">Category</Label>
                            <Select
                              id="category"
                              name="category"
                              value={productData.category}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Category</option>
                              {categories.map(category => (
                                <option key={category} value={category}>
                                  {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </option>
                              ))}
                            </Select>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                              id="gender"
                              name="gender"
                              value={productData.gender || 'Unisex'}
                              onChange={handleInputChange}
                            >
                              {genders.map(gender => (
                                <option key={gender} value={gender}>
                                  {gender}
                                </option>
                              ))}
                            </Select>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="material">Material</Label>
                            <Select
                              id="material"
                              name="material"
                              value={productData.material}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Material</option>
                              {materials.map(material => (
                                <option key={material} value={material}>
                                  {material.charAt(0).toUpperCase() + material.slice(1)}
                                </option>
                              ))}
                            </Select>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="shape">Shape</Label>
                            <Select
                              id="shape"
                              name="shape"
                              value={productData.shape}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Shape</option>
                              {shapes.map(shape => (
                                <option key={shape} value={shape}>
                                  {shape.charAt(0).toUpperCase() + shape.slice(1)}
                                </option>
                              ))}
                            </Select>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="style">Style</Label>
                            <Select
                              id="style"
                              name="style"
                              value={productData.style}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Style</option>
                              {styleOptions.map(style => (
                                <option key={style} value={style}>
                                  {style}
                                </option>
                              ))}
                            </Select>
                          </FormGroup>

                          <FormGroup>
                            <Label>Available Colors</Label>
                            <ColorRadioContainer>
                              {colorOptions.map(colorOption => (
                                <ColorRadioOption
                                  key={colorOption.name}
                                  selected={Array.isArray(productData.colors) && productData.colors.some(c => c.name === colorOption.name)}
                                >
                                  <RadioInput
                                    type="checkbox"
                                    checked={Array.isArray(productData.colors) && productData.colors.some(c => c.name === colorOption.name)}
                                    onChange={() => handleColorToggle(colorOption)}
                                  />
                                  <ColorSwatch color={colorOption.hex} />
                                  <ColorInfo>
                                    <ColorName>{colorOption.name}</ColorName>
                                    <ColorHex>{colorOption.hex}</ColorHex>
                                  </ColorInfo>
                                </ColorRadioOption>
                              ))}
                            </ColorRadioContainer>
                          </FormGroup>

                          {/* Color-Specific Images Section */}
                          {Array.isArray(productData.colors) && productData.colors.length > 0 && (
                            <ColorImageSection>
                              <ColorImageTitle>
                                🎨 Color-Specific Images
                              </ColorImageTitle>
                              <p style={{
                                margin: '0 0 1.5rem 0',
                                color: '#64748b',
                                fontSize: '0.875rem',
                                lineHeight: '1.5'
                              }}>
                                Upload specific images for each color variant. These images will be shown when customers select different colors.
                              </p>
                              <ColorImageGrid>
                                {productData.colors.map((color) => (
                                  <ColorImageItem key={color.name}>
                                    <ColorImageHeader>
                                      <ColorImageLabel>
                                        <ColorSwatch color={color.hex} />
                                        {color.name}
                                      </ColorImageLabel>
                                      <ColorImageUploadButton
                                        type="button"
                                        onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.accept = 'image/*';
                                          input.multiple = true;
                                          input.onchange = (e) => handleColorImageUpload(color.name, e.target.files);
                                          input.click();
                                        }}
                                      >
                                        <FiUpload />
                                        Add Images
                                      </ColorImageUploadButton>
                                    </ColorImageHeader>

                                    {productData.colorImages && productData.colorImages[color.name] && productData.colorImages[color.name].length > 0 ? (
                                      <ColorImageGallery>
                                        {productData.colorImages[color.name].map((image, index) => (
                                          <ColorImagePreview key={index}>
                                            <img src={image} alt={`${color.name} variant ${index + 1}`} />
                                            <ColorImageRemoveButton
                                              type="button"
                                              onClick={() => removeColorImage(color.name, index)}
                                              title="Remove image"
                                            >
                                              ×
                                            </ColorImageRemoveButton>
                                          </ColorImagePreview>
                                        ))}
                                      </ColorImageGallery>
                                    ) : (
                                      <ColorImagePlaceholder>
                                        <span>📷</span>
                                        <span>No images uploaded for {color.name} yet. Click "Add Images" to upload photos for this color variant.</span>
                                      </ColorImagePlaceholder>
                                    )}
                                  </ColorImageItem>
                                ))}
                              </ColorImageGrid>
                            </ColorImageSection>
                          )}

                          {/* Frame Color */}
                          <FormGroup>
                            <Label htmlFor="frameColor">Frame Color</Label>
                            <Input
                              type="text"
                              id="frameColor"
                              name="frameColor"
                              value={productData.frameColor}
                              onChange={handleInputChange}
                            />
                          </FormGroup>


                          {/* Lens Types */}
                          <FormGroup>
                            <Label>Available Lens Types</Label>
                            <CheckboxContainer>
                              {lensTypeOptions.map(lensType => (
                                <CheckboxLabel key={lensType}>
                                  <input
                                    type="checkbox"
                                    checked={productData.lensTypes?.includes(lensType) || false}
                                    onChange={() => handleLensTypeToggle(lensType)}
                                  />
                                  {lensType}
                                </CheckboxLabel>
                              ))}
                            </CheckboxContainer>
                          </FormGroup>

                          {/* Discount */}
                          <FormGroup>
                            <Label>Discount</Label>
                            <CheckboxLabel>
                              <input
                                type="checkbox"
                                checked={(productData && productData.discount) ? productData.discount.hasDiscount : false}
                                onChange={handleDiscountToggle}
                              />
                              Apply Discount
                            </CheckboxLabel>

                            {(productData && productData.discount && productData.discount.hasDiscount) && (
                              <div style={{ marginTop: '10px' }}>
                                <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                                <Input
                                  type="number"
                                  id="discountPercentage"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={(productData && productData.discount) ? productData.discount.discountPercentage : 0}
                                  onChange={handleDiscountPercentageChange}
                                />
                              </div>
                            )}
                          </FormGroup>

                          {/* Product Status */}
                          <FormGroup>
                            <Label htmlFor="status">Product Status</Label>
                            <Select
                              id="status"
                              name="status"
                              value={productData.status || 'In Stock'}
                              onChange={handleInputChange}
                            >
                              {statusOptions.map(status => (
                                <option key={status} value={status}>
                                  {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </option>
                              ))}
                            </Select>
                          </FormGroup>

                          {/* Product Special Status */}
                          <FormGroup>
                            <Label htmlFor="specialStatus">Status</Label>
                            <Select
                              id="specialStatus"
                              name="specialStatus"
                              value={
                                productData.featured && productData.bestSeller ? 'both' :
                                  productData.featured ? 'featured' :
                                    productData.bestSeller ? 'bestSeller' :
                                      'none'
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                setProductData({
                                  ...productData,
                                  featured: value === 'featured' || value === 'both',
                                  bestSeller: value === 'bestSeller' || value === 'both'
                                });
                              }}
                            >
                              <option value="none">Regular Product</option>
                              <option value="featured">Featured Product</option>
                              <option value="bestSeller">Best Seller</option>
                              <option value="both">Featured & Best Seller</option>
                            </Select>
                          </FormGroup>

                          {/* Product Description */}
                          <FormGroup>
                            <Label htmlFor="description">Product Description</Label>
                            <TextArea
                              id="description"
                              name="description"
                              value={productData.description}
                              onChange={handleInputChange}
                            />
                          </FormGroup>

                          <SubmitButton type="submit" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update Product'}
                          </SubmitButton>
                        </Form>
                      </ProductFormMain>

                      {/* Sidebar with Product Preview */}
                      <ProductFormSidebar>
                        <SidebarSection>
                          <SidebarTitle>Product Preview</SidebarTitle>
                          <ThumbnailContainer>
                            <ThumbnailImage onClick={() => document.getElementById('edit-main-image-input').click()}>
                              {productData.image ? (
                                <img src={productData.image} alt="Product thumbnail" />
                              ) : (
                                <ThumbnailPlaceholder>
                                  <span>📷</span>
                                  <span>Click to add main product image</span>
                                </ThumbnailPlaceholder>
                              )}
                            </ThumbnailImage>
                          </ThumbnailContainer>
                        </SidebarSection>

                        <SidebarSection>
                          <SidebarTitle>Product Status</SidebarTitle>
                          <StatusContainer>
                            <StatusIndicator status={productData.status?.toLowerCase()} />
                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                              {productData.status || 'Draft'}
                            </span>
                          </StatusContainer>
                        </SidebarSection>

                        <SidebarSection>
                          <SidebarTitle>Product Details</SidebarTitle>
                          <DetailsList>
                            <DetailsItem>
                              <Label>Price</Label>
                              <span style={{ fontWeight: '600', color: '#1a202c' }}>
                                PKR {productData.price || '0'}
                              </span>
                            </DetailsItem>
                            <DetailsItem>
                              <Label>Category</Label>
                              <span style={{ color: '#64748b' }}>
                                {productData.category || 'Not selected'}
                              </span>
                            </DetailsItem>
                            <DetailsItem>
                              <Label>Gallery Images</Label>
                              <span style={{ color: '#64748b' }}>
                                {(productData.gallery || []).length} images
                              </span>
                            </DetailsItem>
                          </DetailsList>
                        </SidebarSection>
                      </ProductFormSidebar>
                    </ProductFormLayout>
                  </ProductFormContainer>
                </>
              )}

              {activeTab === 'eyewear-products' && (
                <>
                  <ContentHeader>
                    <h2>Eyewear Products</h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <button
                        onClick={() => setActiveTab('add-product')}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#3ABEF9',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        + Add Product
                      </button>
                    </div>
                  </ContentHeader>

                  {successMessage && (
                    <SuccessMessage>{successMessage}</SuccessMessage>
                  )}

                  {/* Product Statistics */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    <StatCard>
                      <StatValue>
                        {products ? products.filter(isEyewearProduct).length : 0}
                      </StatValue>
                      <StatLabel>Total Eyewear</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>
                        {products ? products.filter(p =>
                          isEyewearProduct(p) && p.featured
                        ).length : 0}
                      </StatValue>
                      <StatLabel>Featured</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>
                        {products ? products.filter(p =>
                          isEyewearProduct(p) && p.bestSeller
                        ).length : 0}
                      </StatValue>
                      <StatLabel>Best Sellers</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>
                        {products ? products.filter(p =>
                          isEyewearProduct(p) && p.status === 'In Stock'
                        ).length : 0}
                      </StatValue>
                      <StatLabel>In Stock</StatLabel>
                    </StatCard>
                  </div>

                  <ProductList>
                    {isProductsLoading ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Loading eyewear products...</div>
                        <div style={{ color: '#64748b' }}>Please wait while we fetch your products</div>
                      </div>
                    ) : products && products.length > 0 ? (
                      (() => {
                        // Debug: Log all product categories to help identify missing ones
                        const allCategories = [...new Set(products.map(p => p.category))];
                        console.log('🔍 All product categories found:', allCategories);
                        console.log('🔍 Eyewear categories filter:', eyewearCategories);

                        // Debug: Show each product and whether it passes the filter
                        products.forEach(product => {
                          const isEyewear = isEyewearProduct(product);
                          console.log(`🔍 Product "${product.name}" (${product.category}) -> ${isEyewear ? '✅ INCLUDED' : '❌ EXCLUDED'}`);
                        });

                        const eyewearProducts = products.filter(isEyewearProduct);

                        console.log('🔍 Filtered eyewear products:', eyewearProducts.length, 'out of', products.length, 'total products');
                        console.log('🔍 Eyewear product names:', eyewearProducts.map(p => p.name));

                        return eyewearProducts.length > 0 ? (
                          eyewearProducts.map(product => (
                            <ProductCard key={product.id}>
                              <ProductImage>
                                {product.image ? (
                                  <img src={product.image} alt={product.name} />
                                ) : (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    background: '#f8fafc',
                                    color: '#64748b',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                  }}>
                                    <div style={{ fontSize: '2rem' }}>👓</div>
                                    <div style={{ fontSize: '0.75rem' }}>No Image</div>
                                  </div>
                                )}
                              </ProductImage>
                              <ProductInfo>
                                <ProductName>{product.name}</ProductName>
                                <ProductPrice>PKR {product.price}</ProductPrice>
                                <ProductCategory>{product.category}</ProductCategory>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                  {product.featured && (
                                    <span style={{
                                      background: '#3b82f6',
                                      color: 'white',
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem'
                                    }}>
                                      Featured
                                    </span>
                                  )}
                                  {product.bestSeller && (
                                    <span style={{
                                      background: '#10b981',
                                      color: 'white',
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem'
                                    }}>
                                      Best Seller
                                    </span>
                                  )}
                                  <span style={{
                                    background: product.status === 'In Stock' ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem'
                                  }}>
                                    {product.status || 'In Stock'}
                                  </span>
                                </div>
                              </ProductInfo>
                              <ProductActions>
                                <ActionButton
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <FiEdit style={{ marginRight: '0.5rem' }} />
                                  Edit
                                </ActionButton>
                                <ActionButton
                                  danger
                                  onClick={() => handleDeleteProduct(product.id || product._id)}
                                >
                                  <FiTrash2 style={{ marginRight: '0.5rem' }} />
                                  Delete
                                </ActionButton>
                              </ProductActions>
                            </ProductCard>
                          ))
                        ) : (
                          <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '2px dashed #e2e8f0'
                          }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👓</div>
                            <h3 style={{ margin: '0 0 1rem 0', color: '#1a202c' }}>No Eyewear Products Found</h3>
                            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                              You haven't added any eyewear products yet. Start by adding your first product!
                            </p>
                            <button
                              onClick={() => setActiveTab('add-product')}
                              style={{
                                padding: '0.75rem 1.5rem',
                                background: '#3ABEF9',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600'
                              }}
                            >
                              Add Your First Eyewear Product
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '2px dashed #e2e8f0'
                      }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#1a202c' }}>No Products Found</h3>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                          No products have been loaded. This could be due to a connection issue or empty database.
                        </p>
                        <button
                          onClick={() => window.location.reload()}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            marginRight: '1rem'
                          }}
                        >
                          Refresh Page
                        </button>
                        <button
                          onClick={() => setActiveTab('add-product')}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: '#3ABEF9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                          }}
                        >
                          Add Product
                        </button>
                      </div>
                    )}
                  </ProductList>
                </>
              )}

              {activeTab === 'lens-products' && (
                <>
                  <h2>Lens Products</h2>

                  {successMessage && (
                    <SuccessMessage>{successMessage}</SuccessMessage>
                  )}

                  <ProductList>
                    {isProductsLoading ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        Loading lens products...
                      </div>
                    ) : products && products.length > 0 ? (
                      products
                        .filter(product =>
                          product.category === 'Contact Lenses' ||
                          product.category === 'Transparent Lenses' ||
                          product.category === 'Colored Lenses' ||
                          product.category === 'contact-lenses' ||
                          product.category === 'transparent-lenses' ||
                          product.category === 'colored-lenses'
                        )
                        .map(product => (
                          <ProductCard key={product.id}>
                            <ProductImage>
                              {product.image ? (
                                <img src={product.image} alt={product.name} />
                              ) : (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: '100%',
                                  background: '#f8fafc',
                                  color: '#64748b'
                                }}>
                                  No Image
                                </div>
                              )}
                            </ProductImage>
                            <ProductInfo>
                              <ProductName>{product.name}</ProductName>
                              <ProductPrice>PKR {product.price}</ProductPrice>
                              <ProductCategory>{product.category}</ProductCategory>
                              <ProductStatus status={product.status}>
                                {product.featured && 'Featured '}
                                {product.bestSeller && 'Best Seller'}
                                {!product.featured && !product.bestSeller && 'Regular'}
                              </ProductStatus>
                            </ProductInfo>
                            <ProductActions>
                              <ActionButton
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setProductData(product);
                                  setActiveTab('edit-product');
                                }}
                              >
                                Edit
                              </ActionButton>
                              <ActionButton
                                danger
                                onClick={() => handleDeleteProduct(product.id || product._id)}
                              >
                                Delete
                              </ActionButton>
                            </ProductActions>
                          </ProductCard>
                        ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        No lens products found. <a href="#" onClick={() => setActiveTab('add-product')}>Add your first lens product</a>
                      </div>
                    )}
                  </ProductList>
                </>
              )}

              {activeTab === 'customers' && (
                <>
                  <h2>Customer Management</h2>

                  <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                    <h3 style={{ color: '#1a202c', marginBottom: '0.5rem' }}>Customer Management</h3>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                      Customer management functionality will be implemented here.
                    </p>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginTop: '2rem'
                    }}>
                      <div style={{
                        background: '#f8fafc',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h4 style={{ color: '#3b82f6', margin: '0 0 0.5rem 0' }}>Total Customers</h4>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>0</p>
                      </div>
                      <div style={{
                        background: '#f8fafc',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h4 style={{ color: '#10b981', margin: '0 0 0.5rem 0' }}>Active Customers</h4>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>0</p>
                      </div>
                      <div style={{
                        background: '#f8fafc',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h4 style={{ color: '#f59e0b', margin: '0 0 0.5rem 0' }}>New This Month</h4>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>0</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'reviews' && (
                <>
                  <h2>Product Reviews</h2>

                  {successMessage && (
                    <SuccessMessage>{successMessage}</SuccessMessage>
                  )}

                  <div style={{ marginBottom: '1.5rem' }}>
                    <select
                      value={reviewFilter}
                      onChange={(e) => setReviewFilter(e.target.value)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        background: 'white'
                      }}
                    >
                      <option value="all">All Reviews</option>
                      <option value="pending">Pending Approval</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {reviewsLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading reviews...
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {reviews
                        .filter(review => reviewFilter === 'all' || review.status === reviewFilter)
                        .map(review => (
                          <div key={review.id} style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a202c' }}>{review.customerName}</h4>
                                <p style={{ margin: '0', color: '#64748b', fontSize: '0.875rem' }}>
                                  Product: {review.productName} • {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                              </div>
                            </div>
                            <p style={{ margin: '0 0 1rem 0', color: '#374151' }}>{review.comment}</p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {review.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => approveReview(review.id)}
                                    style={{
                                      background: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      padding: '0.5rem 1rem',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => rejectReview(review.id)}
                                    style={{
                                      background: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      padding: '0.5rem 1rem',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                background: review.status === 'approved' ? '#dcfce7' : review.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                color: review.status === 'approved' ? '#166534' : review.status === 'rejected' ? '#991b1b' : '#92400e'
                              }}>
                                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                      <h3 style={{ color: '#1a202c', marginBottom: '0.5rem' }}>No Reviews Yet</h3>
                      <p style={{ color: '#64748b' }}>Customer reviews will appear here once they start reviewing your products.</p>
                    </div>
                  )}
                </>
              )}


              {activeTab === 'profile' && (
                <>
                  <h2>My Profile</h2>
                  <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'grid',
                    gap: '1rem',
                    maxWidth: '720px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3ABEF9 0%, #3572EF 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 22
                      }}>
                        {(user?.name || 'VC').split(' ').map(s => s[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a202c' }}>{user?.name || 'Vision Care Optometry Clinic'}</div>
                        <div style={{ color: '#64748b' }}>{user?.email || 'admin@example.com'}</div>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Display Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name || ''}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>New Password</label>
                        <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Confirm Password</label>
                        <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        style={{
                          background: '#3572EF',
                          color: 'white',
                          padding: '0.6rem 1.2rem',
                          borderRadius: 8,
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                        onClick={() => setSuccessMessage('Profile updated (demo)')}
                      >
                        Update Profile
                      </button>
                    </div>
                  </div>
                </>
              )}
            </ContentArea>
          </>
        )}

      </MainContent>

      <LogoutButton onClick={handleLogout}>
        <FiLogOut />
        Logout
      </LogoutButton>
    </DashboardContainer>
  );
};

export default AdminPage;
