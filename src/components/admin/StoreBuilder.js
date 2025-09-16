import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FiSave, FiEye, FiSettings, FiDroplet, FiImage, FiType, FiLayout } from 'react-icons/fi';
import { updateStoreSettings, createStore } from '../../redux/slices/storeSlice';

const BuilderContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  height: calc(100vh - 200px);
`;

const PreviewSection = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  position: relative;
`;

const PreviewHeader = styled.div`
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: between;
  align-items: center;
`;

const PreviewTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
`;

const PreviewFrame = styled.div`
  height: calc(100% - 60px);
  background: #fff;
  padding: 2rem;
  overflow-y: auto;
`;

const StorePreview = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const StoreHeader = styled.header`
  background: ${props => props.primaryColor || '#007bff'};
  color: #fff;
  padding: 1rem 0;
  text-align: center;
  margin-bottom: 2rem;
`;

const StoreLogo = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StoreTagline = styled.p`
  margin: 0;
  opacity: 0.9;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ProductCard = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const ProductImage = styled.div`
  height: 150px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h4`
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #2c3e50;
`;

const ProductPrice = styled.div`
  color: ${props => props.primaryColor || '#007bff'};
  font-weight: 600;
`;

const SettingsPanel = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: fit-content;
`;

const SettingsHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
`;

const SettingsTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
`;

const SettingsContent = styled.div`
  padding: 1.5rem;
`;

const SettingsSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  margin: 0 0 1rem;
  color: #495057;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;

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
  min-height: 80px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const ColorPicker = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  background: #fff;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const SaveButton = styled.button`
  width: 100%;
  background: #28a745;
  color: #fff;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const StoreBuilder = () => {
  const dispatch = useDispatch();
  const { storeSettings, loading } = useSelector(state => state.store);
  
  const [settings, setSettings] = useState(storeSettings);

  useEffect(() => {
    setSettings(storeSettings);
  }, [storeSettings]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    dispatch(updateStoreSettings(settings));
  };

  const sampleProducts = [
    { id: 1, name: 'Premium Sunglasses', price: '$199' },
    { id: 2, name: 'Reading Glasses', price: '$89' },
    { id: 3, name: 'Blue Light Glasses', price: '$129' },
    { id: 4, name: 'Designer Frames', price: '$299' }
  ];

  return (
    <BuilderContainer>
      <PreviewSection>
        <PreviewHeader>
          <PreviewTitle>Store Preview</PreviewTitle>
          <FiEye />
        </PreviewHeader>
        <PreviewFrame>
          <StorePreview>
            <StoreHeader primaryColor={settings.primaryColor}>
              <StoreLogo>{settings.storeName || 'Your Store Name'}</StoreLogo>
              <StoreTagline>{settings.storeDescription || 'Your store description goes here'}</StoreTagline>
            </StoreHeader>
            
            <ProductGrid>
              {sampleProducts.map(product => (
                <ProductCard key={product.id}>
                  <ProductImage>
                    <FiImage size={24} />
                  </ProductImage>
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductPrice primaryColor={settings.primaryColor}>
                      {product.price}
                    </ProductPrice>
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductGrid>
          </StorePreview>
        </PreviewFrame>
      </PreviewSection>

      <SettingsPanel>
        <SettingsHeader>
          <SettingsTitle>Store Settings</SettingsTitle>
        </SettingsHeader>
        
        <SettingsContent>
          <SettingsSection>
            <SectionTitle>
              <FiSettings />
              Basic Information
            </SectionTitle>
            
            <FormGroup>
              <Label>Store Name</Label>
              <Input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleSettingChange('storeName', e.target.value)}
                placeholder="Enter your store name"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Store Description</Label>
              <Textarea
                value={settings.storeDescription}
                onChange={(e) => handleSettingChange('storeDescription', e.target.value)}
                placeholder="Describe your store"
              />
            </FormGroup>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              <FiDroplet />
              Theme & Colors
            </SectionTitle>
            
            <FormGroup>
              <Label>Theme</Label>
              <Select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
                <option value="bold">Bold</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Primary Color</Label>
              <ColorPicker
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Secondary Color</Label>
              <ColorPicker
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
              />
            </FormGroup>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              <FiSettings />
              Store Configuration
            </SectionTitle>
            
            <FormGroup>
              <Label>Currency</Label>
              <Select
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Timezone</Label>
              <Select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </Select>
            </FormGroup>
          </SettingsSection>

          <SaveButton onClick={handleSave} disabled={loading}>
            <FiSave />
            {loading ? 'Saving...' : 'Save Changes'}
          </SaveButton>
        </SettingsContent>
      </SettingsPanel>
    </BuilderContainer>
  );
};

export default StoreBuilder;
