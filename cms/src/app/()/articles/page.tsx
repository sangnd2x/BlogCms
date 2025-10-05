"use client";

import { useArticles } from "@/hooks/useArticles";
import { createColumnHelper } from "@tanstack/table-core";
import { Article } from "@/types/article.type";
import { useMemo, useState } from "react";
import DataTable from "@/components/shared/DataTable";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { formatDateTimeLocale } from "@/helpers/timeFormatter";

const ArticlePage = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data: articles, isLoading } = useArticles({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const columHelper = createColumnHelper<Article>();
  const columns = useMemo<ColumnDef<Article, any>[]>(() => {
    return [
      columHelper.accessor("title", {
        cell: info => info.getValue(),
      }),
      columHelper.accessor("author", {
        cell: info => info.getValue().name,
      }),
      columHelper.accessor("category", {
        cell: info => info.getValue().name,
      }),
      columHelper.accessor("tags", {
        cell: info => info.getValue(),
      }),
      columHelper.accessor("published_at", {
        cell: info => formatDateTimeLocale(info.getValue()),
      }),
      columHelper.accessor("status", {
        cell: info => info.getValue(),
      }),
    ];
  }, []);

  return (
    <div>
      <DataTable
        columns={columns}
        data={articles?.data}
        pageCount={articles?.meta?.totalPages ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ArticlePage;
