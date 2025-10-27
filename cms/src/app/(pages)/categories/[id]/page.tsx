"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { deleteCategory, getCategory } from "@/routes/category";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import TooltipButton from "@/components/shared/TooltipButton";
import { Button } from "@/components/ui/button";
import DialogButton from "@/components/shared/DialogButton";
import { Category } from "@/types/category.type";
import { toast } from "sonner";
import CustomTag from "@/components/shared/CustomTag";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/helpers/timeFormatter";

interface Props {}

const ViewCategoryPage: React.FC<Props> = () => {
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

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async data => {
      toast.success(data.message || "Category deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push("/categories");
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.message || "Failed to delete category";
      toast.error(errorMessage);
    },
  });

  const handleGoBack = () => {
    router.push("/categories");
  };

  const handleDelete = async () => {
    await deleteCategoryMutation.mutateAsync(id);
  };

  const handleEdit = () => {
    router.push(`/categories/edit/${id}`);
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
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TooltipButton
            tooltip="go back"
            icon={<ArrowLeft className="h-5 w-5" />}
            variant="ghost"
            onClick={handleGoBack}
          />
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-200">{categoryData.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">Category details and information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={handleEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <DialogButton
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => handleDelete()}
            size="lg"
            title="Are you sure you want to delete this category?"
            description="This action cannot be undone. This will delete the category and remove it from all associated blogs."
            variant="destructive"
            label="delete"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name and Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg font-semibold mt-2 capitalize">{categoryData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Slug</label>
                <p className="text-lg font-mono mt-2 text-muted-foreground">{categoryData.slug}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-base mt-2 text-foreground/80">
                {categoryData.description || <span className="text-muted-foreground italic">No description</span>}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Color and Tag Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Color & Tag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Color</label>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-12 h-12 rounded-lg border" style={{ backgroundColor: categoryData.color }} />
                <span className="font-mono text-sm">{categoryData.color}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-3">Preview</label>
              <CustomTag color={categoryData.color} label={categoryData.name} />
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Associated Blogs</label>
              <div className="mt-3">
                <Badge variant="secondary" className="text-base px-3 py-2">
                  {categoryData.blogCount} blog{categoryData.blogCount !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-3">
                <Badge variant={categoryData.isActive ? "default" : "secondary"}>
                  {categoryData.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-sm mt-2 text-foreground/80">{formatDateTime(categoryData.createdOn)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="text-sm mt-2 text-foreground/80">{formatDateTime(categoryData.updatedOn)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">ID</label>
              <p className="text-xs mt-2 font-mono text-muted-foreground break-all">{categoryData.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewCategoryPage;
