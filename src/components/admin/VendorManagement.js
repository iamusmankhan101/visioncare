import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FiUsers, FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiEye, FiMail, FiPhone } from 'react-icons/fi';
import { fetchVendors, updateVendorStatus, createVendor } from '../../redux/slices/vendorSlice';

const VendorContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const VendorHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AddVendorButton = styled.button`
  background: #28a745;
  color: #fff;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: #218838;
  }
`;

const VendorStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
`;

const VendorFilters = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const VendorTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e9ecef;

  &:hover {
    background: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  text-align: left;
  vertical-align: middle;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
`;

const VendorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const VendorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
`;

const VendorDetails = styled.div``;

const VendorName = styled.div`
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const VendorEmail = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#d4edda';
      case 'pending': return '#fff3cd';
      case 'suspended': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#155724';
      case 'pending': return '#856404';
      case 'suspended': return '#721c24';
      default: return '#495057';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  background: ${props => {
    switch (props.variant) {
      case 'approve': return '#28a745';
      case 'reject': return '#dc3545';
      case 'view': return '#17a2b8';
      case 'edit': return '#ffc107';
      default: return '#6c757d';
    }
  }};
  color: ${props => props.variant === 'edit' ? '#212529' : '#fff'};

  &:hover {
    opacity: 0.8;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: #fff;

  &:hover {
    opacity: 0.8;
  }
`;

const VendorManagement = () => {
  const dispatch = useDispatch();
  const { vendors, vendorStats, loading } = useSelector(state => state.vendor);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    description: '',
    website: ''
  });

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const handleStatusUpdate = (vendorId, status) => {
    dispatch(updateVendorStatus({ vendorId, status }));
  };

  const handleAddVendor = () => {
    dispatch(createVendor(newVendor));
    setShowModal(false);
    setNewVendor({
      name: '',
      email: '',
      phone: '',
      company: '',
      description: '',
      website: ''
    });
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <VendorContainer>
      <VendorHeader>
        <HeaderTitle>
          <FiUsers />
          Vendor Management
        </HeaderTitle>
        <AddVendorButton onClick={() => setShowModal(true)}>
          <FiPlus />
          Add Vendor
        </AddVendorButton>
      </VendorHeader>

      <VendorStats>
        <StatCard>
          <StatValue>{vendorStats.totalVendors}</StatValue>
          <StatLabel>Total Vendors</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{vendorStats.activeVendors}</StatValue>
          <StatLabel>Active Vendors</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{vendorStats.pendingApplications}</StatValue>
          <StatLabel>Pending Applications</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>${vendorStats.totalCommission?.toLocaleString() || '0'}</StatValue>
          <StatLabel>Total Commission</StatLabel>
        </StatCard>
      </VendorStats>

      <VendorFilters>
        <FilterSelect
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </FilterSelect>
        
        <SearchInput
          type="text"
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </VendorFilters>

      <VendorTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Vendor</TableHeaderCell>
              <TableHeaderCell>Company</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Products</TableHeaderCell>
              <TableHeaderCell>Revenue</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {filteredVendors.map(vendor => (
              <TableRow key={vendor.id}>
                <TableCell>
                  <VendorInfo>
                    <VendorAvatar>
                      {vendor.name.charAt(0).toUpperCase()}
                    </VendorAvatar>
                    <VendorDetails>
                      <VendorName>{vendor.name}</VendorName>
                      <VendorEmail>{vendor.email}</VendorEmail>
                    </VendorDetails>
                  </VendorInfo>
                </TableCell>
                <TableCell>{vendor.company}</TableCell>
                <TableCell>
                  <StatusBadge status={vendor.status}>
                    {vendor.status}
                  </StatusBadge>
                </TableCell>
                <TableCell>{vendor.productCount || 0}</TableCell>
                <TableCell>${vendor.revenue?.toLocaleString() || '0'}</TableCell>
                <TableCell>
                  <ActionButtons>
                    <ActionButton variant="view">
                      <FiEye />
                    </ActionButton>
                    {vendor.status === 'pending' && (
                      <>
                        <ActionButton 
                          variant="approve"
                          onClick={() => handleStatusUpdate(vendor.id, 'active')}
                        >
                          <FiCheck />
                        </ActionButton>
                        <ActionButton 
                          variant="reject"
                          onClick={() => handleStatusUpdate(vendor.id, 'suspended')}
                        >
                          <FiX />
                        </ActionButton>
                      </>
                    )}
                    <ActionButton variant="edit">
                      <FiEdit />
                    </ActionButton>
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </VendorTable>

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Add New Vendor</ModalTitle>
            </ModalHeader>
            
            <FormGroup>
              <Label>Vendor Name</Label>
              <Input
                type="text"
                value={newVendor.name}
                onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                placeholder="Enter vendor name"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={newVendor.email}
                onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                placeholder="Enter email address"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={newVendor.phone}
                onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Company</Label>
              <Input
                type="text"
                value={newVendor.company}
                onChange={(e) => setNewVendor({...newVendor, company: e.target.value})}
                placeholder="Enter company name"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Website</Label>
              <Input
                type="url"
                value={newVendor.website}
                onChange={(e) => setNewVendor({...newVendor, website: e.target.value})}
                placeholder="Enter website URL"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Description</Label>
              <Textarea
                value={newVendor.description}
                onChange={(e) => setNewVendor({...newVendor, description: e.target.value})}
                placeholder="Enter vendor description"
              />
            </FormGroup>
            
            <ModalActions>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button primary onClick={handleAddVendor}>Add Vendor</Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </VendorContainer>
  );
};

export default VendorManagement;
