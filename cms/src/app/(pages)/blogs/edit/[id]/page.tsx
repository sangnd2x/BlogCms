"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import TooltipButton from "@/components/shared/TooltipButton";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useAppSelector } from "@/lib/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlogFormData, blogFormSchema } from "@/lib/zod/blogForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBlog, updateBlog } from "@/routes/blog";
import { toast } from "sonner";
import BlogForm from "@/app/(pages)/blogs/components/BlogForm";
import { useForm } from "react-hook-form";
import { BlogStatus } from "@/types/blog.type";

const EditBlogPage = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const { user } = useAppSelector(state => state.auth);
  const { data: categoryOptions = [], isLoading: categoriesLoading } = useCategories();

  const { data: blog, isLoading: blogLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlog(id),
    select: data => {
      return data.data;
    },
    enabled: !!id,
  });

  const updateBlogMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      return updateBlog(id, data);
    },
    onSuccess: async data => {
      toast?.success(data.message);
      await queryClient.invalidateQueries({
        queryKey: ["blog", id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["blogs"],
      });
      router.push("/blogs");
    },
    onError: err => {
      const errorMessage = err?.message || "Failed to create blog";
      toast?.error(errorMessage);
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    mode: "onChange",
    defaultValues: {
      images: [],
    },
  });

  useEffect(() => {
    if (blog && categoryOptions.length > 0) {
      console.log("Category from API:", blog.category_id);
      console.log("Available options:", categoryOptions);

      // Verify the category exists in options
      const categoryExists = categoryOptions.some(opt => opt.value === blog.category_id);

      if (!categoryExists) {
        console.error("Category not found in options!");
        // Handle this case - maybe set to empty string or show error
      }

      reset({
        title: blog.title,
        content: blog.content,
        category_id: blog.category_id,
        tags: blog.tags || [],
        author_id: blog.author_id,
        images: [],
      });
    }
  }, [blog, categoryOptions, reset]);

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

    await updateBlogMutation.mutateAsync(payload);
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

  if (blogLoading || categoriesLoading) {
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
                <h1 className="text-4xl font-bold">Edit Blog</h1>
                <p className="text-gray-600 dark:text-secondary-200">Edit your blog.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="lg"
                disabled={isSubmitting || updateBlogMutation.isPending}
                variant="outline"
                onClick={handleSaveDraft}
              >
                <Save />
                {updateBlogMutation.isPending ? "Save Draft..." : "Save Draft"}
              </Button>
              <Button
                type="button"
                size="lg"
                disabled={isSubmitting || updateBlogMutation.isPending}
                onClick={handlePublish}
              >
                {updateBlogMutation.isPending ? "Publishing..." : "Publish"}
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

export default EditBlogPage;
