import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FiTrendingUp, FiDollarSign, FiShoppingCart, FiUsers, FiPackage } from 'react-icons/fi';
import { updateAnalytics } from '../../redux/slices/storeSlice';

const AnalyticsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MetricIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: ${props => props.color || '#007bff'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.25rem;
`;

const MetricContent = styled.div`
  flex: 1;
`;

const MetricValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
`;

const MetricChange = styled.div`
  font-size: 0.8rem;
  color: ${props => props.positive ? '#28a745' : '#dc3545'};
  margin-top: 0.25rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ChartTitle = styled.h3`
  margin: 0 0 1rem;
  color: #2c3e50;
  font-size: 1.1rem;
`;

const SalesChart = styled.div`
  height: 300px;
  background: #f8f9fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  position: relative;
  overflow: hidden;
`;

const ChartBar = styled.div`
  position: absolute;
  bottom: 0;
  width: ${props => props.width}px;
  height: ${props => props.height}%;
  background: ${props => props.color || '#007bff'};
  left: ${props => props.left}px;
  border-radius: 2px 2px 0 0;
  transition: all 0.3s ease;
`;

const TopProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const ProductSales = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
`;

const ProductRevenue = styled.div`
  font-weight: 600;
  color: #007bff;
`;

const TimeFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  background: ${props => props.active ? '#007bff' : '#fff'};
  color: ${props => props.active ? '#fff' : '#495057'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#007bff' : '#f8f9fa'};
  }
`;

const ReportsSection = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ReportsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ReportCard = styled.div`
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #007bff;
    background: #f8f9fa;
  }
`;

const ReportIcon = styled.div`
  font-size: 1.5rem;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const ReportTitle = styled.div`
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const ReportDescription = styled.div`
  color: #6c757d;
  font-size: 0.8rem;
`;

const AnalyticsDashboard = () => {
  const dispatch = useDispatch();
  const { analytics } = useSelector(state => state.store);
  const { orderStats } = useSelector(state => state.order);
  const [timeFilter, setTimeFilter] = useState('7d');

  // Sample data for demonstration
  const sampleSalesData = [
    { day: 'Mon', sales: 1200 },
    { day: 'Tue', sales: 1900 },
    { day: 'Wed', sales: 800 },
    { day: 'Thu', sales: 1600 },
    { day: 'Fri', sales: 2200 },
    { day: 'Sat', sales: 2800 },
    { day: 'Sun', sales: 1400 }
  ];

  const topProducts = [
    { name: 'Premium Sunglasses', sales: 156, revenue: 31200 },
    { name: 'Blue Light Glasses', sales: 134, revenue: 17290 },
    { name: 'Reading Glasses', sales: 98, revenue: 8722 },
    { name: 'Designer Frames', sales: 76, revenue: 22724 },
    { name: 'Sports Glasses', sales: 45, revenue: 6750 }
  ];

  const maxSales = Math.max(...sampleSalesData.map(d => d.sales));

  useEffect(() => {
    // Simulate analytics data update
    const mockAnalytics = {
      totalSales: 125000,
      totalOrders: orderStats.totalOrders || 0,
      totalCustomers: 1250,
      conversionRate: 3.2,
      averageOrderValue: orderStats.averageOrderValue || 0,
      topProducts: topProducts,
      salesData: sampleSalesData
    };
    
    dispatch(updateAnalytics(mockAnalytics));
  }, [dispatch, orderStats]);

  const reports = [
    {
      icon: <FiTrendingUp />,
      title: 'Sales Report',
      description: 'Detailed sales analysis'
    },
    {
      icon: <FiUsers />,
      title: 'Customer Report',
      description: 'Customer behavior insights'
    },
    {
      icon: <FiPackage />,
      title: 'Inventory Report',
      description: 'Stock levels and trends'
    },
    {
      icon: <FiDollarSign />,
      title: 'Revenue Report',
      description: 'Revenue breakdown'
    }
  ];

  return (
    <AnalyticsContainer>
      <MetricsGrid>
        <MetricCard>
          <MetricIcon color="#007bff">
            <FiDollarSign />
          </MetricIcon>
          <MetricContent>
            <MetricValue>${analytics.totalSales?.toLocaleString() || '0'}</MetricValue>
            <MetricLabel>Total Revenue</MetricLabel>
            <MetricChange positive>+12.5% from last month</MetricChange>
          </MetricContent>
        </MetricCard>

        <MetricCard>
          <MetricIcon color="#28a745">
            <FiShoppingCart />
          </MetricIcon>
          <MetricContent>
            <MetricValue>{analytics.totalOrders || 0}</MetricValue>
            <MetricLabel>Total Orders</MetricLabel>
            <MetricChange positive>+8.3% from last month</MetricChange>
          </MetricContent>
        </MetricCard>

        <MetricCard>
          <MetricIcon color="#17a2b8">
            <FiUsers />
          </MetricIcon>
          <MetricContent>
            <MetricValue>{analytics.totalCustomers || 0}</MetricValue>
            <MetricLabel>Total Customers</MetricLabel>
            <MetricChange positive>+15.2% from last month</MetricChange>
          </MetricContent>
        </MetricCard>

        <MetricCard>
          <MetricIcon color="#ffc107">
            <FiTrendingUp />
          </MetricIcon>
          <MetricContent>
            <MetricValue>{analytics.conversionRate || 0}%</MetricValue>
            <MetricLabel>Conversion Rate</MetricLabel>
            <MetricChange positive>+0.8% from last month</MetricChange>
          </MetricContent>
        </MetricCard>
      </MetricsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Sales Overview</ChartTitle>
          <TimeFilter>
            <FilterButton active={timeFilter === '7d'} onClick={() => setTimeFilter('7d')}>
              7 Days
            </FilterButton>
            <FilterButton active={timeFilter === '30d'} onClick={() => setTimeFilter('30d')}>
              30 Days
            </FilterButton>
            <FilterButton active={timeFilter === '90d'} onClick={() => setTimeFilter('90d')}>
              90 Days
            </FilterButton>
          </TimeFilter>
          <SalesChart>
            {sampleSalesData.map((data, index) => (
              <ChartBar
                key={data.day}
                width={30}
                height={(data.sales / maxSales) * 100}
                left={index * 40 + 20}
                color="#007bff"
              />
            ))}
            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)' }}>
              Sales Trend
            </div>
          </SalesChart>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Top Products</ChartTitle>
          <TopProductsList>
            {topProducts.map((product, index) => (
              <ProductItem key={index}>
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductSales>{product.sales} sales</ProductSales>
                </ProductInfo>
                <ProductRevenue>${product.revenue.toLocaleString()}</ProductRevenue>
              </ProductItem>
            ))}
          </TopProductsList>
        </ChartCard>
      </ChartsGrid>

      <ReportsSection>
        <ChartTitle>Reports & Analytics</ChartTitle>
        <ReportsList>
          {reports.map((report, index) => (
            <ReportCard key={index}>
              <ReportIcon>{report.icon}</ReportIcon>
              <ReportTitle>{report.title}</ReportTitle>
              <ReportDescription>{report.description}</ReportDescription>
            </ReportCard>
          ))}
        </ReportsList>
      </ReportsSection>
    </AnalyticsContainer>
  );
};

export default AnalyticsDashboard;
