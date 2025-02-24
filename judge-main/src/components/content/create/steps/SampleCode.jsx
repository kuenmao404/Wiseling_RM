import React from 'react'
import { Box, Stepper, Step, StepLabel, StepContent, Button, Paper, Typography, TextField } from '@mui/material'
import { Editor } from './create_editor'

export default function SampleCode({
  onChange = () => { },
  handleBack = () => { },
  handleNext = () => { },
  data,
  languages,
  ...props
}) {

  const step = {
    label: "範例程式",
    description: "請輸入範例程式",
  }

  return (
    <StepContent>
      <Typography>{step.description}</Typography>
      <div className='h-96'>
        <Editor
          // pid={pid}
          onChange={onChange}
          lang={languages}
          // onSubmitClick={(d) => updateProblemSolutionApi.mutate({ cid, ...d })}
        />
      </div>
      <Box sx={{ mb: 2 }}>
        <div>
          <Button
            disabled={(data?.code || "")?.trim()?.length === 0}
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
