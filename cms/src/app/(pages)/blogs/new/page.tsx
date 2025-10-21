"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import TooltipButton from "@/components/shared/TooltipButton";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useAppSelector } from "@/lib/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlogFormData, blogFormSchema } from "@/lib/zod/blogForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBlog } from "@/routes/blog";
import { toast } from "sonner";
import BlogPreview from "@/app/(pages)/blogs/components/BlogPreview";
import BlogForm from "@/app/(pages)/blogs/components/BlogForm";
import { useForm } from "react-hook-form";
import { BlogStatus } from "@/types/blog.type";

const NewBlogPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAppSelector(state => state.auth);
  const { data: categoryOptions = [], isLoading: categoriesLoading } = useCategories();

  const [submitType, setSubmitType] = useState<"draft" | "publish" | null>(null);

  const createBlogMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      return createBlog(data);
    },
    onSuccess: data => {
      toast?.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      router.push("/blogs");
    },
    onError: err => {
      const errorMessage = err?.message || "Failed to create blog";
      toast?.error(errorMessage);
    },
    onSettled: () => {
      setSubmitType(null);
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      category_id: "",
      tags: [],
      author_id: user?.id || "",
    },
  });

  const onSubmit = async (data: BlogFormData, statusValue: BlogStatus) => {
    const slug = convertTitleToSlug(data.title);

    const payload: BlogFormData = {
      ...data,
      slug,
      status: statusValue === BlogStatus.PUBLISHED ? BlogStatus.PUBLISHED : BlogStatus.DRAFT,
    };

    if (statusValue === BlogStatus.PUBLISHED) {
      payload.published_at = new Date().toISOString();
    }

    await createBlogMutation.mutateAsync(payload);
  };

  const handleSaveDraft = () => {
    handleSubmit(data => onSubmit(data, BlogStatus.DRAFT))();
  };

  const handlePublish = () => {
    handleSubmit(data => onSubmit(data, BlogStatus.PUBLISHED))();
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setValue("tags", [...tags, tag], { shouldValidate: true });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter(tag => tag !== tagToRemove),
      { shouldValidate: true }
    );
  };

  const convertTitleToSlug = (title: string) => {
    if (!title) {
      return;
    }

    return title
      .toLowerCase() // Convert to lowercase
      .trim() // Remove leading/trailing whitespace
      .normalize("NFD") // Normalize unicode characters (e.g., é → e)
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics/accents
      .replace(/[^\w\s-]/g, "") // Remove special characters except word chars, spaces, and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };

  const title = watch("title");
  const content = watch("content");
  const category = watch("category_id");
  const tags = watch("tags") || [];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center justify-between gap-4">
              <TooltipButton
                tooltip="go back"
                icon={<ArrowLeft className="h8 w-8" />}
                variant="ghost"
                onClick={handleGoBack}
              />
              <div>
                <h1 className="text-4xl font-bold">New Blog</h1>
                <p className="text-gray-600 dark:text-secondary-200">Create a new blog.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="lg"
                disabled={isSubmitting || createBlogMutation.isPending}
                variant="outline"
                onClick={handleSaveDraft}
              >
                <Save />
                {createBlogMutation.isPending ? "Save Draft..." : "Save Draft"}
              </Button>
              <Button
                type="button"
                size="lg"
                disabled={isSubmitting || createBlogMutation.isPending}
                onClick={handlePublish}
              >
                {createBlogMutation.isPending ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/*  Body */}
      <div className="flex gap-2">
        <form
          id="blog-form"
          onSubmit={e => e.preventDefault()}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          className="flex-1"
        >
          <BlogForm
            register={register}
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            categoryOptions={categoryOptions}
            categoriesLoading={categoriesLoading}
            username={user?.name}
            userId={user?.id}
          />
        </form>
      </div>
    </div>
  );
};

export default NewBlogPage;
