import React from 'react'; 
import { Card, CardContent, Typography, Box } from '@mui/material';
import PropTypes from 'prop-types';

// - FeatureCard應用在LandingPage

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      border: '1px solid #e0e0e0',
      boxShadow: 'none',
      borderRadius: 2
    }}>
      <CardContent>
        <Box sx={{ 
          width: 48, 
          height: 48, 
          borderRadius: '50%', 
          bgcolor: '#E8F5F3', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 2
        }}>
          <Icon size={24} color="#3E8E7E" />
        </Box>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

FeatureCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

export default FeatureCard;