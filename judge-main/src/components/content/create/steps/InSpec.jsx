import React from 'react'
import { Box, Stepper, Step, StepLabel, StepContent, Button, Paper, Typography, TextField } from '@mui/material'
import MarkdownEditor from '../../../elements/markdown/MarkdownEditor'

export default function InSpec({
  onChange = () => { },
  handleBack = () => { },
  handleNext = () => { },
  data,
  ...props
}) {

  const step = {
    label: "輸入說明",
    description: "請輸入題目說明",
  }

  return (
    <StepContent>
      <Typography>{step.label}</Typography>
      <MarkdownEditor
        value={data?.in_spec}
        onChange={(in_spec) => onChange({ in_spec })}
      />
      <Box sx={{ mb: 2 }}>
        <div>
          <Button
            disabled={(data?.in_spec || "")?.trim()?.length === 0}
            variant="contained"
            onClick={handleNext}
            sx={{ mt: 1, mr: 1 }}
          >
            {'下一步'}
          </Button>
          <Button
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
