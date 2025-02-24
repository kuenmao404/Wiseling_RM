import React from 'react'
import { Box, Stepper, Step, StepLabel, StepContent, Button, Paper, Typography, TextField } from '@mui/material'
import MarkdownEditor from '../../../elements/markdown/MarkdownEditor'

export default function OutSpec({
  onChange = () => { },
  handleBack = () => { },
  handleNext = () => { },
  data,
  ...props
}) {

  const step = {
    label: "輸出說明",
    description: "請輸入題目說明",
  }

  return (
    <StepContent>
      <Typography>{step.description}</Typography>
      <MarkdownEditor
        value={data?.out_spec}
        onChange={(out_spec) => onChange({ out_spec })}
      />
      <Box sx={{ mb: 2 }}>
        <div>
          <Button
            disabled={(data?.out_spec || "")?.trim()?.length === 0}
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
