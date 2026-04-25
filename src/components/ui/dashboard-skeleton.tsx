"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-8 w-64 bg-muted rounded" />
        </div>
        <div className="h-12 w-40 bg-muted rounded-xl" />
      </div>

      {/* Completion Card */}
      <Card className="overflow-hidden bg-card">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="h-5 w-24 bg-muted rounded-full" />
            <div className="h-8 w-full bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
          <div className="text-right">
            <div className="h-12 w-16 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card">
            <CardContent className="p-5">
              <div className="flex justify-between mb-4">
                <div className="h-9 w-9 bg-muted rounded-lg" />
                <div className="h-4 w-4 bg-muted rounded" />
              </div>
              <div className="h-7 w-12 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="bg-card">
          <CardHeader className="border-b">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 bg-muted rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-muted rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-6">
          <Card className="bg-card">
            <CardHeader>
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-4 w-48 bg-muted rounded" />
              </div>
            </CardHeader>
            <CardContent className="grid gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-11 w-full bg-muted rounded-lg" />
              ))}
            </CardContent>
          </Card>
          <div className="h-32 w-full bg-muted rounded-xl border" />
        </div>
      </div>
    </div>
  );
}
