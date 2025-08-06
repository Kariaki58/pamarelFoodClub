import PlanComponent from "@/components/PlanComponent"
import { Suspense } from "react"


export default function Registration() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanComponent />
    </Suspense>
  )
}