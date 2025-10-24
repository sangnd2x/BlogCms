"use client";

import { BarChart3, Calendar, FileText, Users } from "lucide-react";
import SummaryStatCard from "@/components/shared/SummaryStatCard";
import DashboardLoading from "@/app/(pages)/dashboard/loading";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBlogs } from "@/hooks/useBlogs";
import { useRouter } from "next/navigation";
import BlogCard from "../../../components/shared/BlogCard";

const DashboardPage = () => {
  const router = useRouter();

  const { data, isLoading, isError, error } = useDashboard();
  const { data: blogs } = useBlogs();

  const totalBlogs = data?.data?.totalBlogs;
  const totalViewCounts = data?.data?.totalViewCounts;
  const totalUsers = data?.data?.totalUsers;

  const handleViewAll = () => {
    router.push("/blogs");
  };

  const handleCreate = () => {
    router.push("/blogs/new");
  };

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
          <p className="text-red-600 mt-1">{error?.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your blog.</p>
      </div>

      <div className="flex justify-between items-center gap-4 mt-4">
        <SummaryStatCard
          title="Total Articles"
          value={totalBlogs}
          subtitle="+12.5% from last month"
          icon={<FileText />}
        />
        <SummaryStatCard
          title="Total View Counts"
          value={totalViewCounts}
          subtitle="+12.5% from last month"
          icon={<FileText />}
        />
        <SummaryStatCard title="Total Users" value={totalUsers} subtitle="+12.5% from last month" icon={<FileText />} />
        <SummaryStatCard title="Total Users" value={totalUsers} subtitle="+12.5% from last month" icon={<FileText />} />
      </div>

      {/* Recent Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Articles
              <Button variant="ghost" size="sm" className="text-primary" onClick={handleViewAll}>
                View all
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {blogs?.data?.slice(0, 4).map((blog, index) => (
              <BlogCard blog={blog} key={index} />
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start cur" variant="outline" onClick={handleCreate}>
              <FileText className="w-4 h-4 mr-2" />
              Write New Blog
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Post
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
