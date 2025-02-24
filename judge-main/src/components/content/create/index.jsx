import React, { cloneElement, useState } from 'react'
import { Box, Stepper, Step, StepLabel, StepContent, Button, Paper, Typography } from '@mui/material'
import { Title, Statement, InSpec, OutSpec, SampleCode } from './steps'
import { getSupportLanguage } from '../../../apis/problem'
import { useQuery } from '@tanstack/react-query'

const steps = [
  {
    label: '題目標題',
    content: <Title />,
  },
  {
    label: '題目說明',
    content: <Statement />
  },
  {
    label: '輸入說明',
    content: <InSpec />
  },
  {
    label: '輸出說明',
    content: <OutSpec />
  },
  {
    label: '範例程式',
    content: <SampleCode />
  },
  {
    label: '測資',
    description: `Try out differenoval issues.`,
  },
  {
    label: '範例測資',
    description: `Try out different.`,
  },
  {
    label: 'Hints',
    description: `Try out different.`,
  },
];

export default function VerticalLinearStepper() {
  const getSupportLanguageApi = useQuery({ queryKey: ['getSupportLanguage'], queryFn: () => getSupportLanguage() })

  const [activeStep, setActiveStep] = React.useState(4);
  const [data, setData] = useState({})

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleChange = (d) => {
    setData((prevData) => ({ ...prevData, ...d }))
  }

  return (
    <Box sx={{ p: 2, width: "100%" }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index + 1 === steps.length ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
              onClick={() => activeStep > index && setActiveStep(index)}
            >
              {step.label}
            </StepLabel>
            {step?.content ?
              cloneElement(step?.content, { handleNext, handleBack, onChange: handleChange, data, languages: getSupportLanguageApi?.data }) :
              <StepContent>
                <Typography>{step.description}</Typography>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {index === steps.length - 1 ? '完成' : '下一步'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      上一步
                    </Button>
                  </div>
                </Box>
              </StepContent>
            }
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Reset
          </Button>
        </Paper>
      )}
    </Box>
  );
}