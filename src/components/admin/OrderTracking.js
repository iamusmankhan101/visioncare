import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPackage, FiTruck, FiCheck, FiClock, FiX, FiMapPin, FiCalendar } from 'react-icons/fi';

const TrackingContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
`;

const TrackingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TrackingTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
`;

const TrackingNumber = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  background: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-family: monospace;
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 2rem;
`;

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 2rem;
  
  &:last-child {
    padding-bottom: 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: -2rem;
    top: 0;
    width: 2px;
    height: 100%;
    background: ${props => props.completed ? '#10b981' : '#e2e8f0'};
  }
  
  &:last-child::before {
    display: none;
  }
`;

const TimelineIcon = styled.div`
  position: absolute;
  left: -2.75rem;
  top: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: ${props => {
    if (props.completed) return '#10b981';
    if (props.current) return '#3b82f6';
    return '#e2e8f0';
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  box-shadow: 0 0 0 2px ${props => {
    if (props.completed) return '#10b981';
    if (props.current) return '#3b82f6';
    return '#e2e8f0';
  }};
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const TimelineContent = styled.div`
  margin-left: 0.5rem;
`;

const TimelineStatus = styled.div`
  font-weight: 600;
  color: ${props => {
    if (props.completed) return '#059669';
    if (props.current) return '#2563eb';
    return '#64748b';
  }};
  margin-bottom: 0.25rem;
`;

const TimelineDescription = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
`;

const TimelineDate = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const EstimatedDelivery = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DeliveryIcon = styled.div`
  width: 2rem;
  height: 2rem;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DeliveryInfo = styled.div`
  flex: 1;
`;

const DeliveryTitle = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const DeliveryDate = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

const OrderTracking = ({ order }) => {
  const [trackingSteps, setTrackingSteps] = useState([]);

  useEffect(() => {
    if (order) {
      generateTrackingSteps(order);
    } else {
      // Show default tracking steps when no order is provided
      setTrackingSteps([
        {
          id: 'placed',
          status: 'Order Placed',
          description: 'Order has been received and is being processed',
          icon: <FiPackage />,
          completed: true,
          date: new Date().toISOString()
        },
        {
          id: 'processing',
          status: 'Processing',
          description: 'Order is being prepared for shipment',
          icon: <FiClock />,
          completed: false,
          current: false,
          date: null
        },
        {
          id: 'shipped',
          status: 'Shipped',
          description: 'Order is on its way to customer',
          icon: <FiTruck />,
          completed: false,
          current: false,
          date: null
        },
        {
          id: 'delivered',
          status: 'Delivered',
          description: 'Order has been delivered successfully',
          icon: <FiCheck />,
          completed: false,
          current: false,
          date: null
        }
      ]);
    }
  }, [order]);

  const generateTrackingSteps = (order) => {
    const steps = [
      {
        id: 'placed',
        status: 'Order Placed',
        description: 'Your order has been received and is being processed',
        icon: <FiPackage />,
        completed: true,
        date: order.orderDate
      },
      {
        id: 'processing',
        status: 'Processing',
        description: 'Your order is being prepared for shipment',
        icon: <FiClock />,
        completed: ['processing', 'shipped', 'delivered'].includes(order.status),
        current: order.status === 'processing',
        date: order.status === 'processing' ? new Date().toISOString() : null
      },
      {
        id: 'shipped',
        status: 'Shipped',
        description: 'Your order is on its way to you',
        icon: <FiTruck />,
        completed: ['shipped', 'delivered'].includes(order.status),
        current: order.status === 'shipped',
        date: order.status === 'shipped' ? new Date().toISOString() : null
      },
      {
        id: 'delivered',
        status: 'Delivered',
        description: 'Your order has been delivered successfully',
        icon: <FiCheck />,
        completed: order.status === 'delivered',
        current: order.status === 'delivered',
        date: order.status === 'delivered' ? new Date().toISOString() : null
      }
    ];

    // Handle cancelled orders
    if (order.status === 'cancelled') {
      steps.push({
        id: 'cancelled',
        status: 'Cancelled',
        description: 'This order has been cancelled',
        icon: <FiX />,
        completed: true,
        current: true,
        date: new Date().toISOString()
      });
    }

    setTrackingSteps(steps);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = () => {
    if (order.status === 'delivered') return null;
    if (order.status === 'cancelled') return null;

    const orderDate = new Date(order.orderDate);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + 7); // 7 days from order

    return estimatedDate;
  };

  const estimatedDelivery = getEstimatedDelivery();

  if (!order && trackingSteps.length === 0) return null;

  return (
    <TrackingContainer>
      <TrackingHeader>
        <TrackingTitle>Order Tracking</TrackingTitle>
        {order && <TrackingNumber>#{order.orderNumber}</TrackingNumber>}
        {!order && <TrackingNumber>Sample Order Flow</TrackingNumber>}
      </TrackingHeader>

      <Timeline>
        {trackingSteps.map((step) => (
          <TimelineItem key={step.id} completed={step.completed}>
            <TimelineIcon completed={step.completed} current={step.current}>
              {step.icon}
            </TimelineIcon>
            <TimelineContent>
              <TimelineStatus completed={step.completed} current={step.current}>
                {step.status}
              </TimelineStatus>
              <TimelineDescription>
                {step.description}
              </TimelineDescription>
              {step.date && (
                <TimelineDate>
                  <FiCalendar />
                  {formatDate(step.date)}
                </TimelineDate>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      {estimatedDelivery && (
        <EstimatedDelivery>
          <DeliveryIcon>
            <FiMapPin />
          </DeliveryIcon>
          <DeliveryInfo>
            <DeliveryTitle>Estimated Delivery</DeliveryTitle>
            <DeliveryDate>
              {estimatedDelivery.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </DeliveryDate>
          </DeliveryInfo>
        </EstimatedDelivery>
      )}
    </TrackingContainer>
  );
};

export default OrderTracking;