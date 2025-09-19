import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiHome, FiPackage, FiUsers, FiSettings, FiLogOut, FiSearch, FiBell, FiUser, FiShoppingBag, FiTrendingUp, FiDollarSign, FiMenu, FiX, FiChevronLeft, FiChevronRight, FiBarChart2 } from 'react-icons/fi';
import { resetFilters, createProductAsync, updateProductAsync, deleteProductAsync, fetchProducts } from '../redux/slices/productSlice';
import OrderManagement from '../components/admin/OrderManagement';
import OrderDashboard from '../components/admin/OrderDashboard';
import AdminHeader from '../components/admin/AdminHeader';
import { getAllOrders, getOrderStats } from '../services/orderService';

// Modern Dashboard Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  scroll-behavior: smooth;
  overflow-x: hidden;
`;

const Sidebar = styled.div`
  width: 280px;
  background: linear-gradient(135deg, #3ABEF9 0%, #3572EF 100%);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    box-shadow: ${props => props.isOpen ? '0 0 20px rgba(0, 0, 0, 0.3)' : 'none'};
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  filter:invert(1);
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
  padding: 0.75rem 1.5rem;
  color: ${props => props.active ? '#ffffff' : '#ffffff'};
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border-right: ${props => props.active ? '3px solid #ffffff' : 'none'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${props => props.active ? '600' : '500'};
  border-radius: 8px;
  margin: 0 0.5rem;
  
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
  margin-left: 280px;
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
    padding: 0.5rem 0.5rem;
    height: 60px;
    margin: 0 1rem 2rem 0;
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
    text-align: center;
    padding: 0 0.5rem;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0;
  font-weight: 400;
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
  color: #64748b;
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

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
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
    z-index:2;
  
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
  color: #94a3b8;
  font-weight: 400;
  text-align: center;
`;

const LineChart = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
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
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
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
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
`;

const ColorRadioContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
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
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

// Add the product list styled components here
const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

// Delete all of these duplicate styled component definitions
const ProductItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
  background-color: #f8f8f8;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

// Add all other styled components here
const ProductInfo = styled.div`
  flex-grow: 1;
`;

const ProductName = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
`;

const ProductMeta = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  
  &.edit {
    background-color: #3498db;
    color: white;
    
    &:hover {
      background-color: #2980b9;
    }
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

// Start of the AdminPage component
const AdminPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, status, error } = useSelector(state => state.products);
  const isProductsLoading = status === 'loading';
  const [activeTab, setActiveTab] = useState('dashboard');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',
    gallery: [],
    featured: false,
    bestSeller: false,
    colors: [],
    sizes: [],
    discount: {
      hasDiscount: false,
      discountPercentage: 0
    }
  });
  const fileInputRef = useRef(null);


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
    dispatch(fetchProducts());
    loadOrderStats();
    loadRealOrders();

    // Ensure page starts at the top
    window.scrollTo(0, 0);
  }, [dispatch]);

  // Auto-refresh chart data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadRealOrders();
      loadOrderStats();
    }, 30000);

    return () => clearInterval(interval);
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

  // Load real orders for chart
  const loadRealOrders = async () => {
    try {
      const orders = await getAllOrders();
      setRealOrders(orders);

    } catch (error) {
      console.error('Error loading real orders:', error);
      setRealOrders([]);
    }
  };

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
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Force scroll to top immediately
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    return () => {
      // Restore default scroll restoration when component unmounts
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
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

  // Generate chart data based on date range
  const chartData = useMemo(() => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (chartDateOffset * 7));

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Generate consistent data based on date to prevent flickering
      const seed = date.getTime();
      const baseOrders = Math.floor((Math.sin(seed / 86400000) * 5) + 10);
      const baseRevenue = baseOrders * (1500 + (Math.cos(seed / 86400000) * 1000));

      data.push({
        date: date.toISOString().split('T')[0],
        orders: Math.max(1, baseOrders),
        revenue: Math.round(Math.max(500, baseRevenue)),
        shortLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    const maxOrders = Math.max(...data.map(d => d.orders), 1);

    return { orderData: data, maxRevenue, maxOrders };
  }, [chartDateOffset]);

  // Available options for form selects
  const categories = ['Sunglasses', 'Eyeglasses', 'Reading Glasses', 'Computer Glasses', 'Sports Glasses', 'Contact Lenses', 'Transparent Lenses', 'Colored Lenses'];
  const materials = ['Metal', 'Plastic', 'Titanium', 'Acetate', 'Wood', 'Other'];
  const shapes = ['Round', 'Square', 'Rectangle', 'Cat Eye', 'Aviator', 'Oval', 'Geometric', 'Other'];
  const rimOptions = ['Full Rim', 'Semi-Rimless', 'Rimless', 'Half Rim'];
  const colorOptions = [
    { name: 'Black', hex: '#000000' },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Tortoise', hex: '#D2691E' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Gunmetal', hex: '#708090' },
    { name: 'Navy', hex: '#1B2951' },
    { name: 'Clear', hex: '#F8F8FF' },
    { name: 'Burgundy', hex: '#722F37' },
    { name: 'Rose Gold', hex: '#E8B4A0' },
    { name: 'Copper', hex: '#B87333' },
    { name: 'Charcoal', hex: '#36454F' }
  ];
  const featureOptions = [
    'lightweight', 'prescription-ready', 'polarized', 'uv-protection',
    'blue-light-filtering', 'anti-glare', 'scratch-resistant', 'water-resistant',
    'adjustable-nose-pads', 'spring-hinges', 'durable', 'impact-resistant',
    'hypoallergenic', 'flexible', 'foldable'
  ];

  // Add these new options arrays
  const genders = ['Men', 'Women', 'Unisex'];
  const lensTypeOptions = ['Non-Prescription', 'Prescription', 'Progressive', 'Bifocal', 'Reading', 'Blue-Light'];
  const sizeOptions = ['Small', 'Medium', 'Large', '138mm', '140mm', '142mm'];
  const statusOptions = ['In Stock', 'Out of Stock', 'Coming Soon'];
  const styleOptions = ['Classic', 'Eco Friendly', 'Artsy', 'Retro', 'Street Style', 'Bold'];

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
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: name === 'price' ? parseFloat(value) : value
    });
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
    const isSelected = productData.colors.some(c => c.name === colorOption.name);

    if (isSelected) {
      // Remove color
      setProductData({
        ...productData,
        colors: productData.colors.filter(c => c.name !== colorOption.name)
      });
    } else {
      // Add color
      setProductData({
        ...productData,
        colors: [...productData.colors, colorOption]
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format the product data
      const formattedProduct = {
        ...productData,
        price: parseFloat(productData.price)
      };

      // Dispatch async action to add product
      await dispatch(createProductAsync(formattedProduct)).unwrap();
      dispatch(resetFilters());

      // Show success message
      setSuccessMessage('Product added successfully!');

      // Reset file upload state
      setSelectedFile(null);
      setPreviewUrl('');

      // Reset form
      setTimeout(() => {
        setSuccessMessage('');
        setProductData({
          name: '',
          price: '',
          category: 'Eyeglasses', // Capitalized to match enum in model
          material: '',
          shape: '',
          rim: '',
          color: '',
          features: [],
          image: '/images/eyeglasses.webp', // Reset to default image
          featured: false,
          bestSeller: false,
          // Reset new fields
          colors: [],
          brand: '',
          gender: 'Unisex', // Capitalized to match enum in model
          frameColor: '',
          sizes: [],
          lensTypes: [],
          discount: {
            hasDiscount: false,
            discountPercentage: 0
          },
          status: 'In Stock',
          description: '',
          style: ''
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to add product:', error);
      setSuccessMessage('Error adding product: ' + error.message);
    }
  };

  // Handle edit product - MOVED INSIDE COMPONENT
  const handleEditProduct = (product) => {
    setProductData({
      ...product,
      price: product.price.toString() // Convert price to string for form input
    });
    setActiveTab('edit-product');
  };

  // Handle delete product - MOVED INSIDE COMPONENT
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProductAsync(productId)).unwrap();
        setSuccessMessage('Product deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Failed to delete product:', error);
        setSuccessMessage('Error deleting product: ' + error.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  // Handle update product submission - MOVED INSIDE COMPONENT
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      // Ensure price is a number
      const updatedProduct = {
        ...productData,
        price: parseFloat(productData.price)
      };

      // Dispatch async action to update product
      await dispatch(updateProductAsync({
        id: updatedProduct.id,
        productData: updatedProduct
      })).unwrap();

      // Show success message
      setSuccessMessage('Product updated successfully!');

      // Reset file upload state
      setSelectedFile(null);
      setPreviewUrl('');

      // Reset form and go back to manage products
      setTimeout(() => {
        setSuccessMessage('');
        setActiveTab('manage-products');
      }, 2000);
    } catch (error) {
      console.error('Failed to update product:', error);
      const errorMessage = error?.message || error?.error || error || 'Unknown error occurred';
      setSuccessMessage('Error updating product: ' + errorMessage);
    }
  };


  // Update existing products with random style values
  const handleUpdateExistingProductsWithStyles = async () => {
    if (window.confirm('This will update all existing products without style data with random styles. Continue?')) {
      try {
        setIsLoading(true);
        const styleOptions = ['Classic', 'Eco Friendly', 'Artsy', 'Retro', 'Street Style', 'Bold'];

        for (const product of products) {
          if (!product.style) {
            const randomStyle = styleOptions[Math.floor(Math.random() * styleOptions.length)];
            const updatedProduct = { ...product, style: randomStyle };
            await dispatch(updateProductAsync({
              id: product.id,
              productData: updatedProduct
            })).unwrap();
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
      <Sidebar isOpen={isMobileMenuOpen}>
        <SidebarHeader>
          <Logo>
            <LogoImage src="/images/logo2.png" alt="Vision Care Logo" />

          </Logo>
        </SidebarHeader>

        <NavSection>
          <NavItem
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          >
            <FiHome />
            Dashboard
          </NavItem>
          <NavItem
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
          >
            <FiShoppingBag />
            Orders
          </NavItem>
          <NavItem
            active={activeTab === 'add-product'}
            onClick={() => setActiveTab('add-product')}
          >
            <FiPackage />
            Add Product
          </NavItem>
          <NavItem
            active={activeTab === 'manage-products'}
            onClick={() => setActiveTab('manage-products')}
          >
            <FiBarChart2 />
            Manage Products
          </NavItem>
          <NavItem
            active={activeTab === 'eyewear-products'}
            onClick={() => setActiveTab('eyewear-products')}
          >
            <FiTrendingUp />
            Eyewear Products
          </NavItem>
          <NavItem
            active={activeTab === 'lens-products'}
            onClick={() => setActiveTab('lens-products')}
          >
            <FiSettings />
            Lens Products
          </NavItem>
          <NavItem
            active={activeTab === 'customers'}
            onClick={() => setActiveTab('customers')}
          >
            <FiUsers />
            Customers
          </NavItem>
          <NavItem
            active={activeTab === 'reviews'}
            onClick={() => setActiveTab('reviews')}
          >
            <FiDollarSign />
            Reviews
          </NavItem>
        </NavSection>
      </Sidebar>

      <MainContent>

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
              <WelcomeTitle>Welcome Back, Usman Khan!</WelcomeTitle>
              <WelcomeSubtitle>Here's what happening with your store today</WelcomeSubtitle>
            </WelcomeSection>

            <StatsGrid>
              <StatCard style={{ background: 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%)' }}>
                <StatHeader>
                  <StatTitle>Total Revenue</StatTitle>
                </StatHeader>
                <StatValue style={{ color: '#1f2937', fontSize: '2rem', fontWeight: '700' }}>
                  {formatPKR(orderStats.totalRevenue)}
                </StatValue>
                <StatChange positive>
                  ↗ {orderStats.totalRevenue > 0 ? ((orderStats.deliveredOrders / Math.max(orderStats.totalOrders, 1)) * 100).toFixed(1) : '0'}% <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>({orderStats.deliveredOrders} delivered)</span>
                </StatChange>
              </StatCard>

              <StatCard style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)' }}>
                <StatHeader>
                  <StatTitle>New Customers</StatTitle>
                </StatHeader>
                <StatValue style={{ color: '#1f2937', fontSize: '2rem', fontWeight: '700' }}>
                  {orderStats.totalOrders - orderStats.pendingOrders}
                </StatValue>
                <StatChange positive>
                  ↗ {orderStats.totalOrders > 0 ? (((orderStats.totalOrders - orderStats.pendingOrders) / Math.max(orderStats.totalOrders, 1)) * 100).toFixed(1) : '0'}% <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>({orderStats.totalOrders - orderStats.pendingOrders} completed)</span>
                </StatChange>
              </StatCard>

              <StatCard style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #bae6fd 100%)' }}>
                <StatHeader>
                  <StatTitle>Total Orders</StatTitle>
                </StatHeader>
                <StatValue style={{ color: '#1f2937', fontSize: '2rem', fontWeight: '700' }}>
                  {orderStats.totalOrders.toLocaleString()}
                </StatValue>
                <StatChange positive>
                  ↗ {orderStats.pendingOrders} <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>pending orders</span>
                </StatChange>
              </StatCard>

              <StatCard style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)' }}>
                <StatHeader>
                  <StatTitle>Average Order Value</StatTitle>
                </StatHeader>
                <StatValue style={{ color: '#1f2937', fontSize: '2rem', fontWeight: '700' }}>
                  {formatPKR(Math.round(orderStats.totalRevenue / Math.max(orderStats.totalOrders, 1)))}
                </StatValue>
                <StatChange positive>
                  ↗ {orderStats.totalOrders > 0 ? ((orderStats.deliveredOrders / Math.max(orderStats.totalOrders, 1)) * 100).toFixed(1) : '0'}% <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>delivery rate</span>
                </StatChange>
              </StatCard>

            </StatsGrid>

            <ContentGrid>
              <ChartContainer>
                <ChartHeader>
                  <ChartTitle>Sales Chart</ChartTitle>
                  <ChartControls>
                    <ChartLegend>
                      <LegendItem>
                        <LegendDot color="#1f2937" />
                        Sales
                      </LegendItem>
                      <LegendItem>
                        <LegendDot color="#a855f7" />
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
                      const { orderData, maxRevenue, maxOrders } = chartData;

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
                            <LineChart viewBox="0 0 100 100" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="orderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                </linearGradient>
                              </defs>

                              {/* Revenue Line (teal) */}
                              <path
                                d={(() => {
                                  let path = '';
                                  revenuePoints.forEach((point, index) => {
                                    const x = 15 + (index / (revenuePoints.length - 1)) * 70;
                                    const y = 5 + (1 - point.normalized) * 80;
                                    if (index === 0) {
                                      path += `M ${x} ${y}`;
                                    } else {
                                      const prevX = 15 + ((index - 1) / (revenuePoints.length - 1)) * 70;
                                      const prevY = 5 + (1 - revenuePoints[index - 1].normalized) * 80;
                                      const cpX1 = prevX + (x - prevX) * 0.5;
                                      path += ` C ${cpX1} ${prevY}, ${cpX1} ${y}, ${x} ${y}`;
                                    }
                                  });
                                  return path;
                                })()}
                                stroke="#0891b2"
                                strokeWidth="0.3"
                                fill="none"
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(8, 145, 178, 0.2))' }}
                              />

                              {/* Order Line (green) */}
                              <path
                                d={(() => {
                                  let path = '';
                                  orderPoints.forEach((point, index) => {
                                    const x = 15 + (index / (orderPoints.length - 1)) * 70;
                                    const y = 5 + (1 - point.normalized) * 80;
                                    if (index === 0) {
                                      path += `M ${x} ${y}`;
                                    } else {
                                      const prevX = 15 + ((index - 1) / (orderPoints.length - 1)) * 70;
                                      const prevY = 5 + (1 - orderPoints[index - 1].normalized) * 80;
                                      const cpX1 = prevX + (x - prevX) * 0.5;
                                      path += ` C ${cpX1} ${prevY}, ${cpX1} ${y}, ${x} ${y}`;
                                    }
                                  });
                                  return path;
                                })()}
                                stroke="#22c55e"
                                strokeWidth="0.3"
                                fill="none"
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(34, 197, 94, 0.2))' }}
                              />

                              {/* Data points */}
                              {revenuePoints.map((point, index) => {
                                const x = 15 + (index / (revenuePoints.length - 1)) * 70;
                                const y = 5 + (1 - point.normalized) * 80;
                                return (
                                  <circle
                                    key={`revenue-${index}`}
                                    cx={x}
                                    cy={y}
                                    r="1.2"
                                    fill="#0891b2"
                                    stroke="white"
                                    strokeWidth="0.3"
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={(e) => handlePointHover(e, point, 'revenue')}
                                    onMouseLeave={handlePointLeave}
                                  />
                                );
                              })}

                              {orderPoints.map((point, index) => {
                                const x = 15 + (index / (orderPoints.length - 1)) * 70;
                                const y = 5 + (1 - point.normalized) * 80;
                                return (
                                  <circle
                                    key={`order-${index}`}
                                    cx={x}
                                    cy={y}
                                    r="1.2"
                                    fill="#22c55e"
                                    stroke="white"
                                    strokeWidth="0.3"
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={(e) => handlePointHover(e, point, 'orders')}
                                    onMouseLeave={handlePointLeave}
                                  />
                                );
                              })}
                            </LineChart>
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
              {activeTab === 'add-product' && (
                <>
                  <h2>Add New Product</h2>

                  {successMessage && (
                    <SuccessMessage>{successMessage}</SuccessMessage>
                  )}

                  <Form onSubmit={handleSubmit}>
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
                      <Label htmlFor="category">Category</Label>
                      <Select
                        id="category"
                        name="category"
                        value={productData.category}
                        onChange={handleInputChange}
                        required
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                            selected={productData.colors.some(c => c.name === colorOption.name)}
                          >
                            <RadioInput
                              type="checkbox"
                              checked={productData.colors.some(c => c.name === colorOption.name)}
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

                    <FormGroup>
                      <Label>Product Image</Label>
                      <ImageUploadContainer>
                        <UploadActions>
                          <UploadButton type="button" onClick={handleUploadClick}>
                            Choose Image
                          </UploadButton>
                          <span>{selectedFile ? selectedFile.name : 'No file selected'}</span>
                        </UploadActions>
                        <FileInput
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                        <ImagePreviewContainer>
                          {previewUrl ? (
                            <ImagePreview src={previewUrl} alt="Preview" />
                          ) : productData.image ? (
                            <ImagePreview src={productData.image} alt="Current" />
                          ) : (
                            <span>Image Preview</span>
                          )}
                        </ImagePreviewContainer>
                      </ImageUploadContainer>
                    </FormGroup>

                    <FormGroup>
                      <Label>Features</Label>
                      <CheckboxContainer>
                        {featureOptions.map(feature => (
                          <CheckboxLabel key={feature}>
                            <input
                              type="checkbox"
                              checked={productData.features?.includes(feature) || false}
                              onChange={() => handleFeatureToggle(feature)}
                            />
                            {feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </CheckboxLabel>
                        ))}
                      </CheckboxContainer>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="productStatus">Product Status</Label>
                      <Select
                        id="productStatus"
                        name="productStatus"
                        onChange={(e) => {
                          const value = e.target.value;
                          setProductData({
                            ...productData,
                            featured: value === 'featured' || value === 'both',
                            bestSeller: value === 'bestSeller' || value === 'both'
                          });
                        }}
                        value={
                          productData.featured && productData.bestSeller
                            ? 'both'
                            : productData.featured
                              ? 'featured'
                              : productData.bestSeller
                                ? 'bestSeller'
                                : 'none'
                        }
                      >
                        <option value="none">Regular Product</option>
                        <option value="featured">Featured Product</option>
                        <option value="bestSeller">Best Seller</option>
                        <option value="both">Featured & Best Seller</option>
                      </Select>
                    </FormGroup>

                    {/* Gallery Images */}
                    <FormGroup>
                      <Label>Product Gallery Images</Label>
                      <ImageUploadContainer>
                        <UploadActions>
                          <UploadButton type="button" onClick={() => document.getElementById('galleryUpload').click()}>
                            Add Gallery Images
                          </UploadButton>
                          <span>{(productData && productData.gallery) ? productData.gallery.length : 0} images selected</span>
                        </UploadActions>
                        <FileInput
                          type="file"
                          id="galleryUpload"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryUpload}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                          {(productData && productData.gallery && Array.isArray(productData.gallery)) &&
                            productData.gallery.map((img, index) => (
                              <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                <ImagePreview src={img} alt={`Gallery ${index}`} style={{ width: '100%', height: '100%' }} />
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(index)}
                                  style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    background: '#e74c3c',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          }
                        </div>
                      </ImageUploadContainer>
                    </FormGroup>

                    {/* Brand */}
                    <FormGroup>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        type="text"
                        id="brand"
                        name="brand"
                        value={productData.brand}
                        onChange={handleInputChange}
                      />
                    </FormGroup>

                    {/* Gender */}
                    <FormGroup>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        id="gender"
                        name="gender"
                        value={productData.gender}
                        onChange={handleInputChange}
                      >
                        {genders.map(gender => (
                          <option key={gender} value={gender}>
                            {gender.charAt(0).toUpperCase() + gender.slice(1)}
                          </option>
                        ))}
                      </Select>
                    </FormGroup>

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

                    {/* Sizes */}
                    <FormGroup>
                      <Label>Available Sizes</Label>
                      <CheckboxContainer>
                        {sizeOptions.map(size => (
                          <CheckboxLabel key={size}>
                            <input
                              type="checkbox"
                              checked={productData.sizes?.includes(size) || false}
                              onChange={() => handleSizeToggle(size)}
                            />
                            {size}
                          </CheckboxLabel>
                        ))}
                      </CheckboxContainer>
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

                    <SubmitButton type="submit" disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Product'}
                    </SubmitButton>
                  </Form>
                </>
              )}

              {/* Manage Products section */}
              {activeTab === 'manage-products' && (
                <>
                  <h2>Manage Products</h2>

                  {successMessage && (
                    <SuccessMessage>{successMessage}</SuccessMessage>
                  )}



                  <ProductList>
                    {isProductsLoading ? (
                      <p>Loading products...</p>
                    ) : error ? (
                      <p>Error loading products: {error}</p>
                    ) : !products || products.length === 0 ? (
                      <p>No products available. Add your first product to get started with real data analytics.</p>
                    ) : (
                      products.map(product => (
                        <ProductItem key={product.id}>
                          <ProductImage>
                            <img src={product.image} alt="Product image" />
                          </ProductImage>
                          <ProductInfo>
                            <ProductName>{product.name}</ProductName>
                            <ProductMeta>
                              {formatPKR(product.price)} | {product.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              {product.featured && ' | Featured'}
                              {product.bestSeller && ' | Best Seller'}
                              {product.discount?.hasDiscount && ` | ${product.discount.discountPercentage}% OFF`}
                            </ProductMeta>
                          </ProductInfo>
                          <ActionButtons>
                            <ActionButton
                              className="edit"
                              onClick={() => handleEditProduct(product)}
                            >
                              Edit
                            </ActionButton>
                            <ActionButton
                              className="delete"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              Delete
                            </ActionButton>
                          </ActionButtons>
                        </ProductItem>
                      ))
                    )}
                  </ProductList>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>

                    <SubmitButton
                      onClick={handleUpdateExistingProductsWithStyles}
                      style={{ backgroundColor: '#f39c12' }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Add Styles to Existing Products'}
                    </SubmitButton>


                    <SubmitButton
                      onClick={() => {
                        // dispatch(removeLensProducts());
                        alert('Lens products removed from general listings!');
                      }}
                      style={{ backgroundColor: '#f39c12' }}
                      disabled={isLoading}
                    >
                      Remove Lens Products from General Listings
                    </SubmitButton>

                    <SubmitButton
                      onClick={async () => {
                        if (window.confirm('This will refresh all products and apply the lens filter. Continue?')) {
                          try {
                            setIsLoading(true);
                            await dispatch(fetchProducts()).unwrap();
                            setIsLoading(false);
                            alert('Products refreshed successfully! Lens products are now excluded from general listings.');
                          } catch (error) {
                            setIsLoading(false);
                            console.error('Failed to refresh products:', error);
                            alert('Error removing products: ' + error.message);
                          }
                        }
                      }}
                      style={{ backgroundColor: '#e74c3c' }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Refresh Products & Apply Lens Filter'}
                    </SubmitButton>
                  </div>
                </>
              )}

              {activeTab === 'orders' && (
                <OrderDashboard />
              )}

              {activeTab === 'eyewear-products' && (
                <>
                  <h2>Eyewear Products Management</h2>

                  {successMessage && (
                    <SuccessMessage>{successMessage}</SuccessMessage>
                  )}

                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>

                    <SubmitButton
                      onClick={handleUpdateExistingProductsWithStyles}
                      style={{ backgroundColor: '#f39c12' }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Add Styles to Existing Products'}
                    </SubmitButton>

                    <SubmitButton
                      onClick={() => {
                        alert('Lens products removed from eyewear listings!');
                      }}
                      style={{ backgroundColor: '#e74c3c' }}
                      disabled={isLoading}
                    >
                      Remove Lens Products from Eyewear Listings
                    </SubmitButton>

                    <SubmitButton
                      onClick={async () => {
                        if (window.confirm('This will refresh all products and apply the lens filter. Continue?')) {
                          try {
                            setIsLoading(true);
                            await dispatch(fetchProducts()).unwrap();
                            setIsLoading(false);
                            alert('Products refreshed successfully! Lens products are now excluded from general listings.');
                          } catch (error) {
                            setIsLoading(false);
                            console.error('Failed to refresh products:', error);
                            alert('Error removing products: ' + error.message);
                          }
                        }
                      }}
                      style={{ backgroundColor: '#e74c3c' }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Refresh Products & Apply Lens Filter'}
                    </SubmitButton>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <h3>Eyewear Product Categories</h3>
                    <p>• Sunglasses</p>
                    <p>• Eyeglasses</p>
                    <p>• Reading Glasses</p>
                    <p>• Safety Glasses</p>
                  </div>

                  <div style={{ marginTop: '30px' }}>
                    <h3>Manage Eyewear Products</h3>
                    <ProductList>
                      {(products || []).filter(product => {
                        const lensCategories = ['Contact Lenses', 'Transparent Lenses', 'Colored Lenses'];
                        const lensNames = ['FreshKon Mosaic', 'Acuvue Oasys', 'Bella Elite', 'Dailies AquaComfort', 'Solotica Natural', 'Air Optix Colors'];
                        const lensBrands = ['FreshKon', 'Acuvue', 'Bella', 'Alcon', 'Solotica'];

                        // Exclude lens products
                        if (lensCategories.includes(product.category)) return false;
                        if (lensNames.some(name => product.name && product.name.includes(name))) return false;
                        if (lensBrands.includes(product.brand)) return false;

                        return true;
                      }).length === 0 ? (
                        <p>No eyewear products found. Add some eyewear products to get started.</p>
                      ) : (
                        (products || []).filter(product => {
                          const lensCategories = ['Contact Lenses', 'Transparent Lenses', 'Colored Lenses'];
                          const lensNames = ['FreshKon Mosaic', 'Acuvue Oasys', 'Bella Elite', 'Dailies AquaComfort', 'Solotica Natural', 'Air Optix Colors'];
                          const lensBrands = ['FreshKon', 'Acuvue', 'Bella', 'Alcon', 'Solotica'];

                          // Exclude lens products
                          if (lensCategories.includes(product.category)) return false;
                          if (lensNames.some(name => product.name && product.name.includes(name))) return false;
                          if (lensBrands.includes(product.brand)) return false;

                          return true;
                        }).map(product => (
                          <ProductItem key={product.id}>
                            <ProductInfo>
                              <h4>{product.name}</h4>
                              <p>Price: PKR {product.price}</p>
                              <p>Category: {product.category}</p>
                              <p>Brand: {product.brand || 'N/A'}</p>
                              <p>Status: {product.status}</p>
                            </ProductInfo>
                            <ActionButtons>
                              <ActionButton
                                className="edit"
                                onClick={() => handleEditProduct(product)}
                              >
                                Edit
                              </ActionButton>
                              <ActionButton
                                className="delete"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                Delete
                              </ActionButton>
                            </ActionButtons>
                          </ProductItem>
                        ))
                      )}
                    </ProductList>
                  </div>
                </>
              )}

              {activeTab === 'lens-products' && (
                <>
                  <h2>Lens Products Management</h2>

                  {successMessage && (
                    <SuccessMessage>{successMessage}</SuccessMessage>
                  )}

                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>

                    <SubmitButton
                      onClick={async () => {
                        if (window.confirm('This will remove all lens products from the store. Continue?')) {
                          try {
                            setIsLoading(true);
                            // dispatch(removeLensProducts());
                            setIsLoading(false);
                            alert('All lens products removed successfully!');
                          } catch (error) {
                            setIsLoading(false);
                            console.error('Failed to remove lens products:', error);
                            alert('Error removing lens products: ' + error.message);
                          }
                        }
                      }}
                      style={{ backgroundColor: '#e74c3c' }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Removing...' : 'Remove All Lens Products'}
                    </SubmitButton>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <h3>Lens Product Categories</h3>
                    <p>• Contact Lenses</p>
                    <p>• Transparent Lenses</p>
                    <p>• Colored Lenses</p>
                    <p>• Daily Disposable Lenses</p>
                    <p>• Monthly Lenses</p>
                    <p>• Annual Lenses</p>
                  </div>

                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <h4>Lens Product Features</h4>
                    <p>• Power/BC/DIA specifications</p>
                    <p>• Color variations</p>
                    <p>• Prescription upload functionality</p>
                    <p>• Eye-specific power selection (OD/OS)</p>
                    <p>• Separate routing (/lenses/:id)</p>
                  </div>

                  <div style={{ marginTop: '30px' }}>
                    <h3>Manage Lens Products</h3>
                    <ProductList>
                      {(products || []).filter(product => {
                        const lensCategories = ['Contact Lenses', 'Transparent Lenses', 'Colored Lenses'];
                        const lensNames = ['FreshKon Mosaic', 'Acuvue Oasys', 'Bella Elite', 'Dailies AquaComfort', 'Solotica Natural', 'Air Optix Colors'];
                        const lensBrands = ['FreshKon', 'Acuvue', 'Bella', 'Alcon', 'Solotica'];

                        // Include only lens products
                        if (lensCategories.includes(product.category)) return true;
                        if (lensNames.some(name => product.name.includes(name))) return true;
                        if (lensBrands.includes(product.brand)) return true;

                        return false;
                      }).length === 0 ? (
                        <p>No lens products found. Add some lens products to get started.</p>
                      ) : (
                        (products || []).filter(product => {
                          const lensCategories = ['Contact Lenses', 'Transparent Lenses', 'Colored Lenses'];
                          const lensNames = ['FreshKon Mosaic', 'Acuvue Oasys', 'Bella Elite', 'Dailies AquaComfort', 'Solotica Natural', 'Air Optix Colors'];
                          const lensBrands = ['FreshKon', 'Acuvue', 'Bella', 'Alcon', 'Solotica'];

                          // Include only lens products
                          if (lensCategories.includes(product.category)) return true;
                          if (lensNames.some(name => product.name.includes(name))) return true;
                          if (lensBrands.includes(product.brand)) return true;

                          return false;
                        }).map(product => (
                          <ProductItem key={product.id}>
                            <ProductInfo>
                              <h4>{product.name}</h4>
                              <p>Price: PKR {product.price}</p>
                              <p>Category: {product.category}</p>
                              <p>Brand: {product.brand || 'N/A'}</p>
                              <p>Status: {product.status}</p>
                              {product.power && <p>Power: {product.power}</p>}
                              {product.bc && <p>BC: {product.bc}</p>}
                              {product.dia && <p>DIA: {product.dia}</p>}
                            </ProductInfo>
                            <ActionButtons>
                              <ActionButton
                                className="edit"
                                onClick={() => handleEditProduct(product)}
                              >
                                Edit
                              </ActionButton>
                              <ActionButton
                                className="delete"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                Delete
                              </ActionButton>
                            </ActionButtons>
                          </ProductItem>
                        ))
                      )}
                    </ProductList>
                  </div>
                </>
              )}

              {activeTab === 'customers' && (
                <div>
                  <h2>Customer Management</h2>
                  <p>Customer management features coming soon...</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h2>Review Management</h2>

                  {successMessage && (
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#d4edda',
                      border: '1px solid #c3e6cb',
                      borderRadius: '4px',
                      color: '#155724',
                      marginBottom: '1rem'
                    }}>
                      {successMessage}
                    </div>
                  )}

                  <div style={{ marginBottom: '2rem' }}>
                    <h3>Filter Reviews</h3>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      marginBottom: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => setReviewFilter('all')}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #007bff',
                          backgroundColor: reviewFilter === 'all' ? '#007bff' : 'transparent',
                          color: reviewFilter === 'all' ? 'white' : '#007bff',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                        All Reviews ({reviews.length})
                      </button>
                      <button
                        onClick={() => setReviewFilter('pending')}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #ffc107',
                          backgroundColor: reviewFilter === 'pending' ? '#ffc107' : 'transparent',
                          color: reviewFilter === 'pending' ? 'white' : '#ffc107',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                        Pending ({reviews.filter(r => !r.verified && r.status !== 'rejected').length})
                      </button>
                      <button
                        onClick={() => setReviewFilter('approved')}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #28a745',
                          backgroundColor: reviewFilter === 'approved' ? '#28a745' : 'transparent',
                          color: reviewFilter === 'approved' ? 'white' : '#28a745',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                        Approved ({reviews.filter(r => r.verified).length})
                      </button>
                      <button
                        onClick={() => setReviewFilter('rejected')}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #dc3545',
                          backgroundColor: reviewFilter === 'rejected' ? '#dc3545' : 'transparent',
                          color: reviewFilter === 'rejected' ? 'white' : '#dc3545',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                        Rejected ({reviews.filter(r => r.status === 'rejected').length})
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3>Reviews</h3>
                    {reviewsLoading ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        Loading reviews...
                      </div>
                    ) : (
                      <div>
                        {reviews
                          .filter(review => {
                            if (reviewFilter === 'all') return true;
                            if (reviewFilter === 'pending') return !review.verified && review.status !== 'rejected';
                            if (reviewFilter === 'approved') return review.verified;
                            if (reviewFilter === 'rejected') return review.status === 'rejected';
                            return true;
                          })
                          .map(review => (
                            <div key={review.id} style={{
                              border: '1px solid #ddd',
                              borderRadius: '8px',
                              padding: '1rem',
                              marginBottom: '1rem',
                              backgroundColor: 'white'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <div>
                                  <h4 style={{ margin: '0 0 0.25rem 0' }}>{review.title}</h4>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <div style={{ color: '#ffa500' }}>
                                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>by {review.name}</span>
                                  </div>
                                  <p style={{ margin: '0.5rem 0', color: '#333' }}>{review.text}</p>
                                  <small style={{ color: '#666' }}>Product ID: {review.productId} | {new Date(review.createdAt).toLocaleDateString()}</small>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                  <div style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    backgroundColor: review.verified ? '#d4edda' : (review.status === 'rejected' ? '#f8d7da' : '#fff3cd'),
                                    color: review.verified ? '#155724' : (review.status === 'rejected' ? '#721c24' : '#856404')
                                  }}>
                                    {review.verified ? 'Approved' : (review.status === 'rejected' ? 'Rejected' : 'Pending')}
                                  </div>
                                  {!review.verified && review.status !== 'rejected' && (
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                      <button
                                        onClick={() => approveReview(review.id)}
                                        style={{
                                          padding: '0.25rem 0.5rem',
                                          backgroundColor: '#28a745',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '0.8rem'
                                        }}
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => rejectReview(review.id)}
                                        style={{
                                          padding: '0.25rem 0.5rem',
                                          backgroundColor: '#dc3545',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '0.8rem'
                                        }}
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        }
                        {reviews.filter(review => {
                          if (reviewFilter === 'all') return true;
                          if (reviewFilter === 'pending') return !review.verified && review.status !== 'rejected';
                          if (reviewFilter === 'approved') return review.verified;
                          if (reviewFilter === 'rejected') return review.status === 'rejected';
                          return true;
                        }).length === 0 && (
                            <div style={{
                              border: '1px solid #ddd',
                              borderRadius: '8px',
                              padding: '2rem',
                              backgroundColor: '#f9f9f9',
                              textAlign: 'center'
                            }}>
                              <p style={{ color: '#666', margin: 0 }}>
                                {reviewFilter === 'all' ? 'No reviews found.' : `No ${reviewFilter} reviews found.`}
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'edit-product' && (
                <>
                  <h2>Edit Product</h2>

                  {successMessage && (
                    <SuccessMessage>{successMessage}</SuccessMessage>
                  )}

                  <Form onSubmit={handleUpdateSubmit}>
                    {/* Same form fields as Add Product, but with a different submit button */}
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
                      <Label htmlFor="category">Category</Label>
                      <Select
                        id="category"
                        name="category"
                        value={productData.category}
                        onChange={handleInputChange}
                        required
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                            selected={productData.colors.some(c => c.name === colorOption.name)}
                          >
                            <RadioInput
                              type="checkbox"
                              checked={productData.colors.some(c => c.name === colorOption.name)}
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

                    <FormGroup>
                      <Label>Product Image</Label>
                      <ImageUploadContainer>
                        <UploadActions>
                          <UploadButton type="button" onClick={handleUploadClick}>
                            Choose Image
                          </UploadButton>
                          <span>{selectedFile ? selectedFile.name : 'No file selected'}</span>
                        </UploadActions>
                        <FileInput
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                        <ImagePreviewContainer>
                          {previewUrl ? (
                            <ImagePreview src={previewUrl} alt="Preview" />
                          ) : productData.image ? (
                            <ImagePreview src={productData.image} alt="Current" />
                          ) : (
                            <span>Image Preview</span>
                          )}
                        </ImagePreviewContainer>
                      </ImageUploadContainer>
                    </FormGroup>

                    <FormGroup>
                      <Label>Features</Label>
                      <CheckboxContainer>
                        {featureOptions.map(feature => (
                          <CheckboxLabel key={feature}>
                            <input
                              type="checkbox"
                              checked={productData.features?.includes(feature) || false}
                              onChange={() => handleFeatureToggle(feature)}
                            />
                            {feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </CheckboxLabel>
                        ))}
                      </CheckboxContainer>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="productStatus">Product Status</Label>
                      <Select
                        id="productStatus"
                        name="productStatus"
                        onChange={(e) => {
                          const value = e.target.value;
                          setProductData({
                            ...productData,
                            featured: value === 'featured' || value === 'both',
                            bestSeller: value === 'bestSeller' || value === 'both'
                          });
                        }}
                        value={
                          productData.featured && productData.bestSeller
                            ? 'both'
                            : productData.featured
                              ? 'featured'
                              : productData.bestSeller
                                ? 'bestSeller'
                                : 'none'
                        }
                      >
                        <option value="none">Regular Product</option>
                        <option value="featured">Featured Product</option>
                        <option value="bestSeller">Best Seller</option>
                        <option value="both">Featured & Best Seller</option>
                      </Select>
                    </FormGroup>

                    {/* Gallery Images */}
                    <FormGroup>
                      <Label>Product Gallery Images</Label>
                      <ImageUploadContainer>
                        <UploadActions>
                          <UploadButton type="button" onClick={() => document.getElementById('galleryUpload').click()}>
                            Add Gallery Images
                          </UploadButton>
                          <span>{productData.gallery?.length || 0} images selected</span>
                        </UploadActions>
                        <FileInput
                          type="file"
                          id="galleryUpload"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryUpload}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                          {productData.gallery?.map((img, index) => (
                            <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                              <ImagePreview src={img} alt={`Gallery ${index}`} style={{ width: '100%', height: '100%' }} />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                style={{
                                  position: 'absolute',
                                  top: '-8px',
                                  right: '-8px',
                                  background: '#e74c3c',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
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
                      </ImageUploadContainer>
                    </FormGroup>

                    {/* Brand */}
                    <FormGroup>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        type="text"
                        id="brand"
                        name="brand"
                        value={productData.brand}
                        onChange={handleInputChange}
                      />
                    </FormGroup>

                    {/* Gender */}
                    <FormGroup>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        id="gender"
                        name="gender"
                        value={productData.gender}
                        onChange={handleInputChange}
                      >
                        {genders.map(gender => (
                          <option key={gender} value={gender}>
                            {gender.charAt(0).toUpperCase() + gender.slice(1)}
                          </option>
                        ))}
                      </Select>
                    </FormGroup>

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

                    {/* Sizes */}
                    <FormGroup>
                      <Label>Available Sizes</Label>
                      <CheckboxContainer>
                        {sizeOptions.map(size => (
                          <CheckboxLabel key={size}>
                            <input
                              type="checkbox"
                              checked={productData.sizes?.includes(size) || false}
                              onChange={() => handleSizeToggle(size)}
                            />
                            {size}
                          </CheckboxLabel>
                        ))}
                      </CheckboxContainer>
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

                    <SubmitButton type="submit" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Product'}
                    </SubmitButton>
                  </Form>
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
