"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CategoryForm from "../../components/CategoryForm";
import { getCategory, updateCategory } from "../../../../../routes/category";
import TooltipButton from "../../../../../components/shared/TooltipButton";
import { convertTitleToSlug } from "../../../../../helpers/slugConverter";
import { CategoryFormData, categorySchema } from "../../../../../lib/zod/categoryForm";
import { Button } from "../../../../../components/ui/button";

const EditCategoryPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    select: data => data.data,
    enabled: !!id,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return updateCategory(id, data);
    },
    onSuccess: data => {
      toast.success(data.message || "Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["category", id] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push(`/categories/${id}`);
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || "Failed to update category";
      toast.error(errorMessage);
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
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      color: "",
    },
  });

  useEffect(() => {
    if (categoryData) {
      reset({
        name: categoryData.name,
        description: categoryData.description || "",
        color: categoryData.color,
      });
    }
  }, [categoryData, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    const slug = convertTitleToSlug(data.name);

    const payload: CategoryFormData = {
      ...data,
      slug,
    };

    await updateCategoryMutation.mutateAsync(payload);
  };

  const handleCategorySubmit = () => {
    handleSubmit(data => onSubmit(data))();
  };

  const handleGoBack = () => {
    router.back();
  };

  if (categoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Category not found</p>
          <Button variant="outline" className="mt-4" onClick={handleGoBack}>
            Go Back
          </Button>
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
                icon={<ArrowLeft className="h-5 w-5" />}
                variant="ghost"
                onClick={handleGoBack}
              />
              <div>
                <h1 className="text-4xl font-bold">Edit Category</h1>
                <p className="text-gray-600 dark:text-secondary-200">Update your category information.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="lg"
                disabled={isSubmitting || updateCategoryMutation.isPending}
                variant="default"
                onClick={handleCategorySubmit}
              >
                <Save className="h-4 w-4" />
                {updateCategoryMutation.isPending || isSubmitting ? "Updating..." : "Update Category"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1">
        <form>
          <CategoryForm register={register} control={control} watch={watch} errors={errors} setValue={setValue} />
        </form>
      </div>
    </div>
  );
};

export default EditCategoryPage;
