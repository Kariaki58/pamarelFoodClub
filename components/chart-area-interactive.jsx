"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart showing orders and returns"

const chartData = [
  { date: "2024-04-01", orders: 222, returns: 15 },
  { date: "2024-04-02", orders: 97, returns: 8 },
  { date: "2024-04-03", orders: 167, returns: 12 },
  { date: "2024-04-04", orders: 242, returns: 18 },
  { date: "2024-04-05", orders: 373, returns: 25 },
  { date: "2024-04-06", orders: 301, returns: 22 },
  { date: "2024-04-07", orders: 245, returns: 19 },
  { date: "2024-04-08", orders: 409, returns: 30 },
  { date: "2024-04-09", orders: 59, returns: 5 },
  { date: "2024-04-10", orders: 261, returns: 20 },
  { date: "2024-04-11", orders: 327, returns: 25 },
  { date: "2024-04-12", orders: 292, returns: 21 },
  { date: "2024-04-13", orders: 342, returns: 28 },
  { date: "2024-04-14", orders: 137, returns: 11 },
  { date: "2024-04-15", orders: 120, returns: 9 },
  { date: "2024-04-16", orders: 138, returns: 10 },
  { date: "2024-04-17", orders: 446, returns: 33 },
  { date: "2024-04-18", orders: 364, returns: 27 },
  { date: "2024-04-19", orders: 243, returns: 18 },
  { date: "2024-04-20", orders: 89, returns: 7 },
  { date: "2024-04-21", orders: 137, returns: 11 },
  { date: "2024-04-22", orders: 224, returns: 17 },
  { date: "2024-04-23", orders: 138, returns: 10 },
  { date: "2024-04-24", orders: 387, returns: 29 },
  { date: "2024-04-25", orders: 215, returns: 16 },
  { date: "2024-04-26", orders: 75, returns: 6 },
  { date: "2024-04-27", orders: 383, returns: 28 },
  { date: "2024-04-28", orders: 122, returns: 9 },
  { date: "2024-04-29", orders: 315, returns: 23 },
  { date: "2024-04-30", orders: 454, returns: 34 },
  { date: "2024-05-01", orders: 165, returns: 12 },
  { date: "2024-05-02", orders: 293, returns: 22 },
  { date: "2024-05-03", orders: 247, returns: 18 },
  { date: "2024-05-04", orders: 385, returns: 29 },
  { date: "2024-05-05", orders: 481, returns: 36 },
  { date: "2024-05-06", orders: 498, returns: 37 },
  { date: "2024-05-07", orders: 388, returns: 29 },
  { date: "2024-05-08", orders: 149, returns: 11 },
  { date: "2024-05-09", orders: 227, returns: 17 },
  { date: "2024-05-10", orders: 293, returns: 22 },
  { date: "2024-05-11", orders: 335, returns: 25 },
  { date: "2024-05-12", orders: 197, returns: 15 },
  { date: "2024-05-13", orders: 197, returns: 15 },
  { date: "2024-05-14", orders: 448, returns: 34 },
  { date: "2024-05-15", orders: 473, returns: 35 },
  { date: "2024-05-16", orders: 338, returns: 25 },
  { date: "2024-05-17", orders: 499, returns: 37 },
  { date: "2024-05-18", orders: 315, returns: 23 },
  { date: "2024-05-19", orders: 235, returns: 18 },
  { date: "2024-05-20", orders: 177, returns: 13 },
  { date: "2024-05-21", orders: 82, returns: 6 },
  { date: "2024-05-22", orders: 81, returns: 6 },
  { date: "2024-05-23", orders: 252, returns: 19 },
  { date: "2024-05-24", orders: 294, returns: 22 },
  { date: "2024-05-25", orders: 201, returns: 15 },
  { date: "2024-05-26", orders: 213, returns: 16 },
  { date: "2024-05-27", orders: 420, returns: 31 },
  { date: "2024-05-28", orders: 233, returns: 17 },
  { date: "2024-05-29", orders: 78, returns: 6 },
  { date: "2024-05-30", orders: 340, returns: 25 },
  { date: "2024-05-31", orders: 178, returns: 13 },
  { date: "2024-06-01", orders: 178, returns: 13 },
  { date: "2024-06-02", orders: 470, returns: 35 },
  { date: "2024-06-03", orders: 103, returns: 8 },
  { date: "2024-06-04", orders: 439, returns: 33 },
  { date: "2024-06-05", orders: 88, returns: 7 },
  { date: "2024-06-06", orders: 294, returns: 22 },
  { date: "2024-06-07", orders: 323, returns: 24 },
  { date: "2024-06-08", orders: 385, returns: 29 },
  { date: "2024-06-09", orders: 438, returns: 33 },
  { date: "2024-06-10", orders: 155, returns: 12 },
  { date: "2024-06-11", orders: 92, returns: 7 },
  { date: "2024-06-12", orders: 492, returns: 37 },
  { date: "2024-06-13", orders: 81, returns: 6 },
  { date: "2024-06-14", orders: 426, returns: 32 },
  { date: "2024-06-15", orders: 307, returns: 23 },
  { date: "2024-06-16", orders: 371, returns: 28 },
  { date: "2024-06-17", orders: 475, returns: 36 },
  { date: "2024-06-18", orders: 107, returns: 8 },
  { date: "2024-06-19", orders: 341, returns: 26 },
  { date: "2024-06-20", orders: 408, returns: 31 },
  { date: "2024-06-21", orders: 169, returns: 13 },
  { date: "2024-06-22", orders: 317, returns: 24 },
  { date: "2024-06-23", orders: 480, returns: 36 },
  { date: "2024-06-24", orders: 132, returns: 10 },
  { date: "2024-06-25", orders: 141, returns: 11 },
  { date: "2024-06-26", orders: 434, returns: 33 },
  { date: "2024-06-27", orders: 448, returns: 34 },
  { date: "2024-06-28", orders: 149, returns: 11 },
  { date: "2024-06-29", orders: 103, returns: 8 },
  { date: "2024-06-30", orders: 446, returns: 34 },
]

const chartConfig = {
  orders: {
    label: "Orders",
    color: "var(--primary)",
  },
  returns: {
    label: "Returns",
    color: "var(--destructive)",
  }
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    const today = new Date("2024-06-30") // Using the last date in our dataset as "today"
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate && date <= today
    })
  }, [timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Orders Overview</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total orders and returns for the last {timeRange === "90d" ? "3 months" : timeRange === "30d" ? "30 days" : "7 days"}
          </span>
          <span className="@[540px]/card:hidden">
            Last {timeRange === "90d" ? "3 months" : timeRange === "30d" ? "30 days" : "7 days"}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex">
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a time range">
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillReturns" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-returns)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-returns)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }} />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot" />
              } />
            <Area
              dataKey="orders"
              type="natural"
              fill="url(#fillOrders)"
              stroke="var(--color-orders)"
              stackId="a" />
            <Area
              dataKey="returns"
              type="natural"
              fill="url(#fillReturns)"
              stroke="var(--color-returns)"
              stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}