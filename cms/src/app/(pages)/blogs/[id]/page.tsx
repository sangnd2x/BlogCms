"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { deleteBlog, getBlog } from "@/routes/blog";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import TooltipButton from "@/components/shared/TooltipButton";
import { Button } from "@/components/ui/button";
import DialogButton from "@/components/shared/DialogButton";
import { BlogStatus } from "@/types/blog.type";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import BlogPreview from "@/app/(pages)/blogs/components/BlogPreview";

interface Props {}

const ViewBlogPage: React.FC<Props> = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: blogData, isLoading: blogLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlog(id),
    select: data => data.data,
    enabled: !!id,
  });

  const deleteBlogMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: async data => {
      await queryClient.invalidateQueries({ queryKey: ["allBlogs"] });
      toast.success(data.message);
    },
    onError: err => {
      const errorMessage = err?.message || "Blog delete error";
      toast.error(errorMessage);
    },
  });

  const handleGoBack = () => {
    router.replace(`/blogs`);
  };

  const handleDelete = async () => {
    await deleteBlogMutation.mutateAsync(id);
  };

  const handleEdit = () => {
    router.push(`/blogs/edit/${id}`);
  };

  const sanitizedHTML = (content?: string) => {
    if (!content) {
      return "";
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
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "class", "target", "rel"],
    });
  };

  const getStatusColor = (status?: BlogStatus) => {
    if (!status) {
      return;
    }

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

  if (blogLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto" />
          <p className="mt-4 text-secondary-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <TooltipButton
          tooltip="go back"
          icon={<ArrowLeft className="h8 w-8" />}
          variant="ghost"
          onClick={handleGoBack}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={handleEdit}>
            <Pencil />
            Edit
          </Button>
          <DialogButton
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => handleDelete()}
            size="lg"
            title="Are you sure you want to delete this blog?"
            description="This action cannot be undone. This will delete the blog."
            variant="destructive"
            label="delete"
          />
        </div>
      </div>

      <BlogPreview data={blogData} mode="view" />
    </div>
  );
};

export default ViewBlogPage;
