import React, { Fragment } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../elements/ui/Tabs";
import Loading from "../../../elements/Loading"
import { Box, Divider, Button } from "@mui/material";
import { accountAtom } from "../../../App";
import { useAtom } from "jotai";

export function Console({
  data,
  isLoading,
  history,
  ...divProps
}) {
  const [{ bOP }] = useAtom(accountAtom)

  return (
    <div {...divProps}>
      <Tabs defaultValue="submit-result" className="flex flex-col h-full">
        <TabsList className="flex items-center justify-center">
          {/* <TabsTrigger className="text-center w-full" value="custom-testcase">
            自訂測試
          </TabsTrigger> */}
          <TabsTrigger className="text-center w-full" value="submit-result">
            測試結果
          </TabsTrigger>
        </TabsList>
        {/* <TabsContent className="h-full m-1 mt-2" value="custom-testcase">
          <Textarea className="w-full h-full" placeholder="輸入自訂測試" />
        </TabsContent> */}
        <TabsContent value="submit-result" className="overflow-auto flex-1-1">
          <div className="mx-1">
            {isLoading ?
              <Loading /> :
              <div>
                {!data ?
                  "暫無測試結果。" :
                  <ResultShow kind={data?.kind} runTime={data?.runTime} memory={data?.memory} />
                }
              </div>
            }
            {/* {data?.kind == "Accept" && bOP &&
              <Button color="success" variant="outlined" size="small" sx={{ mt: 1 }}>上傳此次程式碼為範例程式</Button>
            } */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const ResultShow = ({
  kind,
  name,
  runTime,
  memory,
}) => {

  return (
    <Box>
      <div>{switchKind(kind)}</div>
      {!!name && <div>lang: {name}</div>}
      {!!runTime && <div>runTime: {runTime} ms</div>}
      {!!memory && <div>memory: {memory} Kb</div>}
    </Box>
  )
}

export { ResultShow, switchKind }

const switchKind = (kind = null) => {
  switch (kind) {
    case "System":
      return <span className="text-red-600 font-bold">System Error</span>
    case "Accept":
      return <span className="text-emerald-600 font-bold">Accept</span>
    default:
      return <span className="text-red-600 font-bold">{kind}</span>
  }
}