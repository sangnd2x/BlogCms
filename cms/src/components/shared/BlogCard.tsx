import { Blog, BlogStatus } from "@/types/blog.type";
import React from "react";

interface Props {
  blog: Blog;
}

const BlogCard: React.FC<Props> = ({ blog }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-foreground">{blog.title}</h4>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
          <span>{blog.user.name}</span>
          <span>•</span>
          <span>{blog.publishedAt}</span>
          <span>•</span>
          <span>{blog.viewsCount} views</span>
        </div>
      </div>
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          blog.status === BlogStatus.PUBLISHED ? "bg-success-200 text-success border" : "bg-warning-200 text-warning"
        }`}
      >
        {blog.status}
      </span>
    </div>
  );
};

export default BlogCard;
