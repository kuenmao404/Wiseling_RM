import React, { } from 'react'
import { Box, Stepper, Step, StepLabel, StepContent, Button, Paper, Typography, TextField } from '@mui/material'

export default function Title({
  onChange = () => { },
  handleBack = () => { },
  handleNext = () => { },
  data,
  ...props
}) {

  const step = {
    label: "標題",
    description: "請輸入標題",
  }

  return (
    <StepContent>
      <Typography>{step.description}</Typography>
      <TextField required={true} autoFocus value={data?.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
      <Box sx={{ mb: 2 }}>
        <div>
          <Button
            disabled={(data?.title || "")?.trim()?.length === 0}
            variant="contained"
            onClick={handleNext}
            sx={{ mt: 1, mr: 1 }}
          >
            {'下一步'}
          </Button>
          <Button
            disabled={true}
            onClick={handleBack}
            sx={{ mt: 1, mr: 1 }}
          >
            上一步
          </Button>
        </div>
      </Box>
    </StepContent>
  )
}
