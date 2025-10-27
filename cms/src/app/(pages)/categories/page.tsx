"use client";
import { Plus, FolderOpen, Edit2, MoreVertical, Trash2, Eye, Pencil, Trash } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { useCategories } from "../../../hooks/useCategories";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../../routes/category";
import CustomTag from "../../../components/shared/CustomTag";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import TooltipButton from "../../../components/shared/TooltipButton";
import DialogButton from "../../../components/shared/DialogButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCategory } from "../../../routes/category";
import { toast } from "sonner";

interface Props {}

const ListCategoriesPage: React.FC<Props> = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete category");
    },
  });

  const handleAddNew = () => {
    router.push("/categories/new");
  };

  const handleView = (id: string) => {
    router.push(`/categories/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/categories/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleViewBlogs = (categoryId: string) => {
    // Navigate to blogs page with category filter applied
    router.push(`/blogs?categoryId=${categoryId}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header and button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-200">Categories</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage all your categories.</p>
        </div>
        <Button size="lg" onClick={handleAddNew}>
          <Plus className="h-8 w-8" />
          New Category
        </Button>
      </div>

      {/* list categories */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Posts</TableHead>
              <TableHead className="w-12 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories?.data?.map(category => (
                <TableRow key={category.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium capitalize">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <CustomTag color={category.color} label={category.name} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{category.description}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => handleViewBlogs(category.id)}
                      title={`View ${category.blogCount} blog${category.blogCount !== 1 ? 's' : ''} in this category`}
                    >
                      {category.blogCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <TooltipButton
                      icon={<Eye className="h-4 w-4" />}
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(category.id)}
                      className="h-8 px-8"
                      tooltip="view"
                    />
                    <TooltipButton
                      icon={<Pencil className="h-4 w-4" />}
                      variant="default"
                      size="sm"
                      onClick={() => handleEdit(category.id)}
                      className="h-8 px-8"
                      tooltip="edit"
                    />
                    <DialogButton
                      icon={<Trash className="h-4 w-4" />}
                      onClick={() => handleDelete(category.id)}
                      title="Are you sure you want to delete this category?"
                      description="This action cannot be undone. This will delete the category."
                      variant="destructive"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ListCategoriesPage;
