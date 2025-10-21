"use client";

import { useBlogs } from "@/hooks/useBlogs";
import { Blog } from "@/types/blog.type";
import { useMemo, useState } from "react";
import DataTable from "@/components/shared/DataTable";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  ColumnPinningState,
} from "@tanstack/react-table";
import { formatDateTimeLocale } from "@/helpers/timeFormatter";
import GlobalSearch from "@/components/shared/GlobalSearch";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import TooltipButton from "@/components/shared/TooltipButton";
import CustomTag from "@/components/shared/CustomTag";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBlog } from "@/routes/blog";
import { toast } from "sonner";
import DialogButton from "@/components/shared/DialogButton";

const ListBlogs = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categoryOptions = [], isLoading: categoriesLoading } = useCategories();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ["actions"],
    left: ["title"],
  });

  const filters = useMemo(() => {
    return columnFilters.reduce(
      (acc, filter) => {
        if (Array.isArray(filter.value)) {
          acc[filter.id] = filter.value.join(",");
        } else {
          acc[filter.id] = filter.value;
        }
        return acc;
      },
      {} as Record<string, any>
    );
  }, [columnFilters]);

  const sort = useMemo(() => {
    if (sorting.length === 0) {
      return {
        sort_by: "created_on",
        sort_order: "DESC" as const,
      };
    }

    const sort = sorting[0];
    return {
      sort_by: sort.id,
      sort_order: sort.desc ? ("DESC" as const) : ("ASC" as const),
    };
  }, [sorting]);

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: globalSearch,
      ...filters,
      ...sort,
    }),
    [pagination.pageIndex, pagination.pageSize, filters, sort, globalSearch]
  );

  const { data: articles, isLoading } = useBlogs(queryParams);

  const deleteBlogMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["allBlogs"] });
      toast.success(data.message);
    },
    onError: err => {
      const errorMessage = err?.message || "Blog delete error";
      toast.error(errorMessage);
    }
  })

  const handleView = (blog: Blog) => {
    console.log("View blog:", blog);
    router.push(`/blogs/${blog.id}`);
  };

  const handleEdit = (blog: Blog) => {
    router.push(`/blogs/edit/${blog.id}`);
  };

  const handleDelete = async (blog: Blog) => {
    await deleteBlogMutation.mutateAsync(blog.id);
  };

  const handleAddNew = () => {
    router.push("/blogs/new");
  };

  const columns = useMemo<ColumnDef<Blog, any>[]>(
    () => [
      {
        accessorKey: "title",
        header: () => <span>Title</span>,
        cell: info => info.getValue(),
        enableColumnFilter: true,
        enableSorting: true,
        enableResizing: true,
        enablePinning: true,
        size: 600,
        minSize: 300,
        maxSize: 800,
        meta: {
          filterConfig: {
            type: "text",
            placeholder: "Search title...",
          },
        },
      },

      {
        accessorKey: "category",
        header: () => <span>Category</span>,
        cell: info => {
          const color = info.getValue()?.color;
          const name = info.getValue()?.name;
          return <CustomTag color={color} label={name} />;
        },
        accessorFn: row => row.category,
        enableColumnFilter: true,
        enableSorting: false,
        enableResizing: true,
        size: 300,
        minSize: 150,
        maxSize: 400,
        meta: {
          filterConfig: {
            type: "multiSelect",
            placeholder: "Search category...",
            options: categoryOptions,
            isLoading: categoriesLoading,
          },
        },
      },
      {
        accessorKey: "tags",
        header: () => <span>Tags</span>,
        cell: info => info.getValue(),
        enableColumnFilter: true,
        enableSorting: false,
        enableResizing: true,
        size: 300,
        minSize: 150,
        maxSize: 400,
        meta: {
          filterConfig: {
            type: "text",
            placeholder: "Search tags...",
          },
        },
      },

      {
        accessorKey: "published_at",
        header: () => <span>Published At</span>,
        cell: info => formatDateTimeLocale(info.getValue()),
        enableColumnFilter: true,
        enableSorting: true,
        enableResizing: true,
        size: 300,
        minSize: 150,
        maxSize: 600,
        meta: {
          filterConfig: {
            type: "dateRange",
          },
        },
      },
      {
        accessorKey: "status",
        header: () => <span>Status</span>,
        cell: info => info.getValue(),
        enableColumnFilter: true,
        enableSorting: true,
        enableResizing: true,
        size: 300,
        minSize: 150,
        maxSize: 300,
        meta: {
          filterConfig: {
            type: "select",
            options: [
              { label: "Draft", value: "DRAFT" },
              { label: "Published", value: "PUBLISHED" },
              { label: "Archived", value: "ARCHIVED" },
            ],
            placeholder: "Filter status...",
          },
        },
      },
      {
        accessorKey: "created_on",
        header: () => <span>Created At</span>,
        cell: info => formatDateTimeLocale(info.getValue()),
        enableColumnFilter: true,
        enableSorting: true,
        enableResizing: true,
        size: 300,
        minSize: 150,
        maxSize: 600,
        meta: {
          filterConfig: {
            type: "dateRange",
          },
        },
      },
      {
        accessorKey: "author",
        header: () => <span>Author</span>,
        cell: info => info.getValue(),
        accessorFn: row => row.author.name,
        enableColumnFilter: false,
        enableSorting: false,
        enableResizing: true,
        size: 300,
        minSize: 150,
        maxSize: 400,
        meta: {
          filterConfig: {
            type: "text",
            placeholder: "Search author...",
          },
        },
      },
      {
        accessorKey: "views_count",
        header: () => <span>View Counts</span>,
        cell: info => info.getValue(),
        enableColumnFilter: false,
        enableSorting: false,
        enableResizing: true,
        size: 200,
        minSize: 150,
        maxSize: 400,
        meta: {},
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <TooltipButton
              icon={<Eye className="h-4 w-4" />}
              variant="outline"
              size="sm"
              onClick={() => handleView(row.original)}
              className="h-8 px-8"
              tooltip="view"
            />
            <TooltipButton
              icon={<Pencil className="h-4 w-4" />}
              variant="default"
              size="sm"
              onClick={() => handleEdit(row.original)}
              className="h-8 px-8"
              tooltip="edit"
            />
            <DialogButton
              icon={<Trash className="h-4 w-4" />}
              onClick={() => handleDelete(row.original)}
              title="Are you sure you want to delete this blog?"
              description="This action cannot be undone. This will delete the blog."
              variant="destructive"
            />
          </div>
        ),
        size: 120,
        enablePinning: true,
      },
    ],
    [categoryOptions]
  );

  const centerTextColumns = ["author", "category", "tags", "published_at", "created_on", "views_count", "status"];

  return (
    <div className="p-4 space-y-4">
      {/* Header with Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Blogs</h1>
              <p className="text-gray-600">Manage all your blogs.</p>
            </div>
            <Button size="lg" onClick={handleAddNew}>
              <Plus className="h-8 w-8" />
              New Blog
            </Button>
          </div>
          <GlobalSearch
            value={globalSearch}
            onChange={setGlobalSearch}
            placeholder="Search articles, authors, categories..."
            disabled={isLoading}
            debounce={500}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={articles?.data}
        pageCount={articles?.meta?.totalPages ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        showFilters={showFilters}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        sorting={sorting}
        onSortingChange={setSorting}
        columnPinning={columnPinning}
        onColumnPinningChange={setColumnPinning}
        isLoading={isLoading}
        centerTextColumns={centerTextColumns}
      />
    </div>
  );
};

export default ListBlogs;
