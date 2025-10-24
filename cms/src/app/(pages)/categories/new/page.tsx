"use client";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { CategoryFormData, categorySchema } from "../../../../lib/zod/categoryForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import TooltipButton from "../../../../components/shared/TooltipButton";
import { Button } from "../../../../components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCategory } from "../../../../routes/category";
import CategoryForm from "../components/CategoryForm";
import { convertTitleToSlug } from "../../../../helpers/slugConverter";

const NewCategoryPage: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return createCategory(data);
    },
    onSuccess: data => {
      toast?.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // router.push("/categories");
    },
    onError: err => {
      const errorMessage = err?.message || "Failed to create category";
      toast?.error(errorMessage);
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    const slug = convertTitleToSlug(data.name);

    const payload: CategoryFormData = {
      ...data,
      slug,
    };

    await createCategoryMutation.mutateAsync(payload);
  };

  const handleCategorySubmit = () => {
    handleSubmit(data => onSubmit(data))();
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
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

  const handleGoBack = () => {
    router.back();
  };

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
                <h1 className="text-4xl font-bold">New Category</h1>
                <p className="text-gray-600 dark:text-secondary-200">Create a new category.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="lg" disabled={false} variant="default" onClick={handleCategorySubmit}>
                <Save />
                {createCategoryMutation.isPending || isSubmitting ? "Save Category..." : "Save Category"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/*  Body */}
      <div className="flex-1 gap-2">
        <form>
          <CategoryForm register={register} control={control} watch={watch} errors={errors} setValue={setValue} />
        </form>
      </div>
    </div>
  );
};

export default NewCategoryPage;
