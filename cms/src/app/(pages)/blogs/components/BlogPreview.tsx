import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Eye, FolderOpenIcon, Tag, User } from "lucide-react";
import { formatDateTime } from "@/helpers/timeFormatter";
import DOMPurify from "dompurify";
import { Blog, BlogStatus } from "@/types/blog.type";

interface Props {
  data?: Blog;
  title?: string;
  tags?: string[];
  content?: string;
  username?: string;
  category?: string;
  categoryOptions?: { label: string; value: string }[];
  mode: "edit" | "view";
}

const BlogPreview: React.FC<Props> = ({
  data,
  title,
  category,
  tags = [],
  content,
  username,
  categoryOptions = [],
  mode,
}) => {
  const getCategoryLabel = () => {
    const selectedCategory = categoryOptions.find(opt => opt.value === category);
    return selectedCategory?.label || "";
  };

  const displayTitle = data?.title || title;
  const displayContent = data?.content || content;
  const displayTags = data?.tags || tags;
  const displayAuthor = data?.user?.name || username;
  const displayCategory = data?.category?.name || getCategoryLabel();
  const displayStatus = data?.status || null;
  const displayPublishedAt = data?.publishedAt;
  const displayViewsCount = data?.viewsCount || 0;

  const sanitizedHTML = (content?: string): string => {
    if (!content) {
      return "<p class='text-muted-foreground italic'>Start writing to see preview...</p>";
    }

    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "a",
        "img",
        "blockquote",
        "code",
        "pre",
        "mark",
        "span",
        "s",
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "class", "target", "rel", "style"],
    });
  };

  const getStatusColor = (status: BlogStatus): string => {
    switch (status) {
      case BlogStatus.PUBLISHED:
        return "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300";
      case BlogStatus.DRAFT:
        return "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300";
      case BlogStatus.SCHEDULED:
        return "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300";
      case BlogStatus.ARCHIVED:
        return "bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300";
      default:
        return "bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300";
    }
  };

  // Calculate estimated read time from content
  const calculateReadTime = (content?: string): number => {
    if (!content) {
      return 0;
    }
    const wordsPerMinute = 200; // Average reading speed
    const text = content.replace(/<[^>]*>/g, ""); // Strip HTML tags
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Blog stats
  const stats = {
    totalViews: data?.viewsCount,
    avgReadTime: calculateReadTime(data?.content),
  };

  return (
    <div className={cn("border rounded-xl flex flex-col", mode === "edit" ? "h-[800px] overflow-hidden" : "")}>
      {mode === "view" ? (
        <div className="space-y-4 p-8">
          {/* Status Badge */}
          <Badge
            variant="outline"
            className={cn(
              "w-fit px-3 py-1 text-sm border rounded-2xl",
              getStatusColor(displayStatus ?? BlogStatus.DRAFT)
            )}
          >
            {displayStatus}
          </Badge>

          {/* Title */}
          <h1 className="text-4xl font-bold break-words">{displayTitle}</h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-4 items-center text-secondary-700 dark:text-secondary-200 text-sm">
            {/* Author */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{displayAuthor}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDateTime(displayPublishedAt)}</span>
            </div>

            {/* Category */}
            <div className="flex items-center gap-2">
              <FolderOpenIcon className="h-4 w-4" />
              <span>{displayCategory}</span>
            </div>

            {/* Views Count */}
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{displayViewsCount}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 items-center flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {displayTags.map(tag => (
              <Badge variant="secondary" key={tag} className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-secondary-300 dark:bg-secondary-900 rounded-t-xl py-1 px-4 items-center">
          <span className="font-semibold text-md">Preview</span>
        </div>
      )}

      {mode == "view" ? <hr className="my-2 mx-4" /> : null}

      {/* Content */}
      <div className={cn("preview-content overflow-y-auto", mode === "view" ? "px-8" : "px-4 pb-8")}>
        <div dangerouslySetInnerHTML={{ __html: sanitizedHTML(displayContent) }} />
      </div>

      {mode == "view" ? <hr className="my-8 mx-4" /> : null}

      {mode == "view" ? (
        <div className="flex flex-row gap-4 items-center justify-end m-4">
          {/* Total Views */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Eye className="h-4 w-4" />
              <span>Total Views</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalViews?.toLocaleString()}</p>
          </div>

          {/* Avg. Read Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              <span>Avg. Read Time</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgReadTime} min</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BlogPreview;
