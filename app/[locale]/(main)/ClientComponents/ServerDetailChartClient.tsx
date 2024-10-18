"use client"

import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import { Card, CardContent } from "@/components/ui/card";
import useSWR from "swr";
import { NezhaAPISafe } from "../../types/nezha-api";
import { formatNezhaInfo, formatRelativeTime, formatTime, nezhaFetcher } from "@/lib/utils";
import getEnv from "@/lib/env-entry";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";


type cpuChartData = {
    timeStamp: string;
    cpu: number;
}

type memChartData = {
    timeStamp: string;
    mem: number;
    swap: number;
}

type networkChartData = {
    timeStamp: string;
    upload: number;
    download: number;
}

export default function ServerDetailChartClient({
    server_id,
}: {
    server_id: number;
}) {
    const { data, error } = useSWR<NezhaAPISafe>(
        `/api/detail?server_id=${server_id}`,
        nezhaFetcher,
        {
            refreshInterval: Number(getEnv("NEXT_PUBLIC_NezhaFetchInterval")) || 5000,
        },
    );

    if (error) {
        return (
            <>
                <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-medium opacity-40">{error.message}</p>
                    <p className="text-sm font-medium opacity-40">
                        {/* {t("chart_fetch_error_message")} */}
                        fetch_error_message
                    </p>
                </div>
            </>
        );
    }
    if (!data) return null;

    return (
        <section className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-3">
            <CpuChart data={data} />
            <MemChart data={data} />
            <NetworkChart data={data} />
        </section>
    )
}

function CpuChart({ data }: { data: NezhaAPISafe }) {
    const [cpuChartData, setCpuChartData] = useState([] as cpuChartData[]);

    const { cpu } = formatNezhaInfo(data);

    useEffect(() => {
        if (data) {
            const timestamp = Date.now().toString();
            const newData = [
                ...cpuChartData,
                { timeStamp: timestamp, cpu: cpu },
            ];
            if (newData.length > 30) {
                newData.shift();
            }
            setCpuChartData(newData);
        }
    }, [data]);

    const chartConfig = {
        cpu: {
            label: "CPU",
        },
    } satisfies ChartConfig

    return (
        <Card className=" rounded-sm">
            <CardContent className="px-6 py-3">
                <section className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <p className="text-md font-medium">
                            CPU
                        </p>
                        <section className="flex items-center gap-2">
                            <p className="text-xs text-end w-10 font-medium">
                                {cpu.toFixed(0)}%
                            </p>
                            <AnimatedCircularProgressBar
                                className="size-3 text-[0px]"
                                max={100}
                                min={0}
                                value={cpu}
                                primaryColor="hsl(var(--chart-1))"
                            />
                        </section>
                    </div>
                    <ChartContainer config={chartConfig} className="aspect-auto h-[130px] w-full">
                        <AreaChart
                            accessibilityLayer
                            data={cpuChartData}
                            margin={{
                                top: 12,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="timeStamp"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={200}
                                interval="preserveStartEnd"
                                tickFormatter={(value) => formatRelativeTime(value)}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                mirror={true}
                                tickMargin={-15}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Area
                                isAnimationActive={false}
                                dataKey="cpu"
                                type="step"
                                fill="hsl(var(--chart-1))"
                                fillOpacity={0.3}
                                stroke="hsl(var(--chart-1))"
                            />
                        </AreaChart>
                    </ChartContainer>
                </section>
            </CardContent>
        </Card>
    )
}

function MemChart({ data }: { data: NezhaAPISafe }) {
    const [memChartData, setMemChartData] = useState([] as memChartData[]);

    const { mem, swap } = formatNezhaInfo(data);

    useEffect(() => {
        if (data) {
            const timestamp = Date.now().toString();
            const newData = [
                ...memChartData,
                { timeStamp: timestamp, mem: mem, swap: swap },
            ];
            if (newData.length > 30) {
                newData.shift();
            }
            setMemChartData(newData);
        }
    }, [data]);

    const chartConfig = {
        mem: {
            label: "Mem",
        },
        swap: {
            label: "Swap",
        },
    } satisfies ChartConfig

    return (
        <Card className=" rounded-sm">
            <CardContent className="px-6 py-3">
                <section className="flex flex-col gap-1">
                    <div className="flex items-center">
                        <section className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <p className=" text-xs text-muted-foreground">Mem</p>
                                <div className="flex items-center gap-2">
                                    <AnimatedCircularProgressBar
                                        className="size-3 text-[0px]"
                                        max={100}
                                        min={0}
                                        value={mem}
                                        primaryColor="hsl(var(--chart-1))"
                                    />
                                    <p className="text-xs font-medium">
                                        {mem.toFixed(0)}%
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <p className=" text-xs text-muted-foreground">Swap</p>
                                <div className="flex items-center gap-2">
                                    <AnimatedCircularProgressBar
                                        className="size-3 text-[0px]"
                                        max={100}
                                        min={0}
                                        value={swap}
                                        primaryColor="hsl(var(--chart-4))"
                                    />
                                    <p className="text-xs font-medium">
                                        {swap.toFixed(0)}%
                                    </p>
                                </div>
                            </div>

                        </section>
                    </div>
                    <ChartContainer config={chartConfig} className="aspect-auto h-[130px] w-full">
                        <AreaChart
                            accessibilityLayer
                            data={memChartData}
                            margin={{
                                top: 12,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="timeStamp"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={200}
                                interval="preserveStartEnd"
                                tickFormatter={(value) => formatRelativeTime(value)}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                mirror={true}
                                tickMargin={-15}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Area
                                isAnimationActive={false}
                                dataKey="mem"
                                type="step"
                                fill="hsl(var(--chart-1))"
                                fillOpacity={0.3}
                                stroke="hsl(var(--chart-1))"
                            />
                            <Area
                                isAnimationActive={false}
                                dataKey="swap"
                                type="step"
                                fill="hsl(var(--chart-4))"
                                fillOpacity={0.3}
                                stroke="hsl(var(--chart-4))"
                            />
                        </AreaChart>
                    </ChartContainer>
                </section>
            </CardContent>
        </Card>
    )

}


function NetworkChart({ data }: { data: NezhaAPISafe }) {
    const [networkChartData, setNetworkChartData] = useState([] as networkChartData[]);

    const { up, down } = formatNezhaInfo(data);

    useEffect(() => {
        if (data) {
            const timestamp = Date.now().toString();
            const newData = [
                ...networkChartData,
                { timeStamp: timestamp, upload: up, download: down },
            ];
            if (newData.length > 30) {
                newData.shift();
            }
            setNetworkChartData(newData);
        }
    }, [data]);

    let maxDownload = Math.max(...networkChartData.map((item) => item.download));
    maxDownload = Math.ceil(maxDownload);
    if (maxDownload < 1) {
        maxDownload = 1;
    }

    const chartConfig = {
        upload: {
            label: "Upload",
        },
        download: {
            label: "Download",
        },
    } satisfies ChartConfig

    return (
        <Card className=" rounded-sm">
            <CardContent className="px-6 py-3">
                <section className="flex flex-col gap-1">
                    <div className="flex items-center">
                        <section className="flex items-center gap-4">
                            <div className="flex flex-col w-20">
                                <p className="text-xs text-muted-foreground">Upload</p>
                                <div className="flex items-center gap-1">
                                    <span className="relative inline-flex  size-1.5 rounded-full bg-[hsl(var(--chart-1))]"></span>
                                    <p className="text-xs font-medium">
                                        {up.toFixed(2)} M/s
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col w-20">
                                <p className=" text-xs text-muted-foreground">Download</p>
                                <div className="flex items-center gap-1">
                                    <span className="relative inline-flex  size-1.5 rounded-full bg-[hsl(var(--chart-4))]"></span>
                                    <p className="text-xs font-medium">
                                        {down.toFixed(2)} M/s
                                    </p>
                                </div>
                            </div>

                        </section>
                    </div>
                    <ChartContainer config={chartConfig} className="aspect-auto h-[130px] w-full">
                        <LineChart
                            accessibilityLayer
                            data={networkChartData}
                            margin={{
                                top: 12,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="timeStamp"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={200}
                                interval="preserveStartEnd"
                                tickFormatter={(value) => formatRelativeTime(value)}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                mirror={true}
                                tickMargin={-15}
                                type="number"
                                minTickGap={50}
                                interval="preserveStartEnd"
                                domain={[1, maxDownload]}
                                tickFormatter={(value) => `${value.toFixed(0)}M/s`}
                            />
                            <Line
                                isAnimationActive={false}
                                dataKey="upload"
                                type="linear"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={1}
                                dot={false}
                            />
                            <Line
                                isAnimationActive={false}
                                dataKey="download"
                                type="linear"
                                stroke="hsl(var(--chart-4))"
                                strokeWidth={1}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                </section>
            </CardContent>
        </Card>
    )
}