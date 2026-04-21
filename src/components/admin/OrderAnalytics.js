import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { getAllOrders } from '../../services/orderService';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPackage, FiUsers, FiCalendar, FiBarChart2, FiPieChart } from 'react-icons/fi';

const AnalyticsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AnalyticsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const AnalyticsTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
`;

const TimeRangeSelector = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const MetricTitle = styled.h3`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const MetricIcon = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  background: ${props => props.color || '#f8fafc'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.iconColor || '#64748b'};
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => props.positive ? '#059669' : '#dc2626'};
  font-weight: 500;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
`;

const OrderChart = styled.div`
  height: 300px;
  position: relative;
  display: flex;
  align-items: end;
  justify-content: space-around;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
`;

const ChartBar = styled.div`
  width: 24px;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 2px 2px 0 0;
  height: ${props => props.height}%;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(to top, #2563eb, #3b82f6);
    transform: translateY(-2px);
  }
`;

const ChartLabel = styled.div`
  position: absolute;
  bottom: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
`;

const ChartTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  
  ${ChartBar}:hover & {
    opacity: 1;
  }
`;

const StatusChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StatusDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const StatusLabel = styled.div`
  font-weight: 500;
  color: #374151;
  text-transform: capitalize;
`;

const StatusCount = styled.div`
  font-weight: 600;
  color: #1e293b;
`;

const TopProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TopProductItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const ProductIcon = styled.div`
  width: 32px;
  height: 32px;
  background: #e0f2fe;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

const ProductName = styled.div`
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

const ProductStats = styled.div`
  text-align: right;
`;

const ProductCount = styled.div`
  font-weight: 600;
  color: #1e293b;
`;

const ProductRevenue = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

const OrderAnalytics = () => {
  const [orders, setOrders] = useState([]);
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orderData = await getAllOrders();
      setOrders(orderData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return orders.filter(order => new Date(order.orderDate) >= cutoffDate);
  }, [orders, timeRange]);

  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueCustomers = new Set(filteredOrders.map(order => order.customerInfo.email)).size;

    // Calculate previous period for comparison
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (parseInt(timeRange) * 2));
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - parseInt(timeRange));

    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= previousPeriodStart && orderDate < previousPeriodEnd;
    });

    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const ordersChange = previousOrders.length > 0 ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100 : 0;

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      uniqueCustomers,
      revenueChange,
      ordersChange
    };
  }, [filteredOrders, orders, timeRange]);

  const chartData = useMemo(() => {
    const days = parseInt(timeRange);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.toDateString() === date.toDateString();
      });
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      });
    }
    
    return data;
  }, [filteredOrders, timeRange]);

  const statusData = useMemo(() => {
    const statusCounts = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const statusColors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status] || '#64748b'
    }));
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const productCounts = {};
    
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        if (!productCounts[item.name]) {
          productCounts[item.name] = {
            name: item.name,
            count: 0,
            revenue: 0
          };
        }
        productCounts[item.name].count += item.quantity || 1;
        productCounts[item.name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    return Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredOrders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const maxOrders = Math.max(...chartData.map(d => d.orders), 1);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <AnalyticsContainer>
      <AnalyticsHeader>
        <AnalyticsTitle>Order Analytics</AnalyticsTitle>
        <TimeRangeSelector
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
          <option value="365">Last year</option>
        </TimeRangeSelector>
      </AnalyticsHeader>

      <MetricsGrid>
        <MetricCard>
          <MetricHeader>
            <MetricTitle>Total Orders</MetricTitle>
            <MetricIcon color="#dbeafe" iconColor="#3b82f6">
              <FiPackage />
            </MetricIcon>
          </MetricHeader>
          <MetricValue>{metrics.totalOrders}</MetricValue>
          <MetricChange positive={metrics.ordersChange >= 0}>
            {metrics.ordersChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {Math.abs(metrics.ordersChange).toFixed(1)}% from previous period
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricTitle>Total Revenue</MetricTitle>
            <MetricIcon color="#dcfce7" iconColor="#10b981">
              <FiDollarSign />
            </MetricIcon>
          </MetricHeader>
          <MetricValue>{formatCurrency(metrics.totalRevenue)}</MetricValue>
          <MetricChange positive={metrics.revenueChange >= 0}>
            {metrics.revenueChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {Math.abs(metrics.revenueChange).toFixed(1)}% from previous period
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricTitle>Average Order Value</MetricTitle>
            <MetricIcon color="#fef3c7" iconColor="#f59e0b">
              <FiBarChart2 />
            </MetricIcon>
          </MetricHeader>
          <MetricValue>{formatCurrency(metrics.averageOrderValue)}</MetricValue>
          <MetricChange positive={true}>
            Per order average
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricTitle>Unique Customers</MetricTitle>
            <MetricIcon color="#f3e8ff" iconColor="#8b5cf6">
              <FiUsers />
            </MetricIcon>
          </MetricHeader>
          <MetricValue>{metrics.uniqueCustomers}</MetricValue>
          <MetricChange positive={true}>
            Active customers
          </MetricChange>
        </MetricCard>
      </MetricsGrid>

      <ChartsGrid>
        <ChartContainer>
          <ChartTitle>Daily Orders</ChartTitle>
          <OrderChart>
            {chartData.map((day, index) => (
              <ChartBar
                key={index}
                height={(day.orders / maxOrders) * 100}
              >
                <ChartTooltip>
                  {day.orders} orders<br />
                  {formatCurrency(day.revenue)}
                </ChartTooltip>
                <ChartLabel>{day.date}</ChartLabel>
              </ChartBar>
            ))}
          </OrderChart>
        </ChartContainer>

        <div>
          <ChartContainer>
            <ChartTitle>Order Status</ChartTitle>
            <StatusChart>
              {statusData.map((status) => (
                <StatusItem key={status.status}>
                  <StatusInfo>
                    <StatusDot color={status.color} />
                    <StatusLabel>{status.status}</StatusLabel>
                  </StatusInfo>
                  <StatusCount>{status.count}</StatusCount>
                </StatusItem>
              ))}
            </StatusChart>
          </ChartContainer>

          <ChartContainer style={{ marginTop: '2rem' }}>
            <ChartTitle>Top Products</ChartTitle>
            <TopProductsList>
              {topProducts.map((product, index) => (
                <TopProductItem key={index}>
                  <ProductInfo>
                    <ProductIcon>👓</ProductIcon>
                    <ProductName>{product.name}</ProductName>
                  </ProductInfo>
                  <ProductStats>
                    <ProductCount>{product.count} sold</ProductCount>
                    <ProductRevenue>{formatCurrency(product.revenue)}</ProductRevenue>
                  </ProductStats>
                </TopProductItem>
              ))}
            </TopProductsList>
          </ChartContainer>
        </div>
      </ChartsGrid>
    </AnalyticsContainer>
  );
};

export default OrderAnalytics;