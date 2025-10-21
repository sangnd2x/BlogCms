import { Blog, BlogStatus } from "@/types/blog.type";
import React from "react";

interface Props {
  article: Blog;
}

const ArticleCard: React.FC<Props> = ({ article }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-foreground">{article.title}</h4>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
          <span>{article.author.name}</span>
          <span>•</span>
          <span>{article.published_at}</span>
          <span>•</span>
          <span>{article.views_count} views</span>
        </div>
      </div>
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          article.status === BlogStatus.PUBLISHED
            ? "bg-success-200 text-success border"
            : "bg-warning-200 text-warning"
        }`}
      >
        {article.status}
      </span>
    </div>
  );
};

export default ArticleCard;
