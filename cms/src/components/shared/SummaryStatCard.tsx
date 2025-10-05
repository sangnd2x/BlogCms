"use client";

import React, { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  title: string;
  value: number | undefined;
  subtitle: string;
  icon: JSX.Element;
}

const SummaryStatCard: React.FC<Props> = ({ title, value, subtitle, icon }) => {
  return (
    <Card className="flex flex-col space-y-2 p-4 items-center justify-between text-sm border border-secondary-300 rounded-md min-w-32 w-96">
      <CardHeader className="flex items-center justify-between w-full">
        <CardTitle>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="flex flex-col items-start space-y-1 justify-start w-full">
        <p className="text-4xl font-bold">{value}</p>
        <span className="text-xs text-success-500">{subtitle}</span>
      </CardContent>
    </Card>
  );
};

export default SummaryStatCard;
