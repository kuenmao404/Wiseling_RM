import React from 'react';
import { 
  Box,
  Container, 
  Typography, 
  Button, 
  Grid, 
  ThemeProvider,
  createTheme 
} from '@mui/material';
import { ClipboardList, Brain, Calendar, Users } from 'lucide-react';
import FeatureCard from './FeatureCard.jsx'

const theme = createTheme({
  typography: {
    fontFamily: [
      '-apple-system',
      'sans-serif'
    ].join(','),
  },
  palette: {
    primary: {
      main: '#3E8E7E',
    },
  },
});

export default function index() {
  const features = [
    {
      icon: ClipboardList,
      title: '任務管理',
      description: '輕鬆管理會議任務，簡單、快速、方便'
    },
    {
      icon: Brain,
      title: 'AI驅動',
      description: '為每場會議記錄製作摘要，省時、省力、省心'
    },
    {
      icon: Calendar,
      title: '行事曆整合',
      description: '與行事曆同步，不錯過每件大小事'
    },
    {
      icon: Users,
      title: '團隊協作',
      description: '讓您方便管理每個成員的進度'
    }
  ];
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: '100%' }}>
        <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              高效率的會議記錄工具：
            </Typography>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
              RecordMinute
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              簡單、直覺的介面，讓你的會議記錄更有效率
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                bgcolor: '#3E8E7E',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: '#2D7A6B'
                }
              }}
            >
              立即開始
            </Button>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <FeatureCard {...feature} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

