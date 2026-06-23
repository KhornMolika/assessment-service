import type { ReactNode } from "react";
import Pagination from "@/src/components/ui/navigation/Pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type PaginatedCollectionCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  headerAction?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  emptyState?: ReactNode;
  isEmpty?: boolean;
  headerClassName?: string;
  className?: string;
  contentClassName?: string;
  bodyClassName?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    pageSizeOptions?: number[];
    itemLabel: string;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
};

export function PaginatedCollectionCard({
  title,
  description,
  headerAction,
  toolbar,
  children,
  emptyState,
  isEmpty = false,
  headerClassName,
  className,
  contentClassName,
  bodyClassName,
  pagination,
}: PaginatedCollectionCardProps) {
  const hasHeader = title || description || headerAction;

  return (
    <Card className={className}>
      {hasHeader ? (
        <CardHeader className={joinClasses("flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", headerClassName)}>
          <div className="space-y-1">
            {title ? <CardTitle>{title}</CardTitle> : null}
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {headerAction}
        </CardHeader>
      ) : null}

      <CardContent className={joinClasses("space-y-6", contentClassName)}>
        {toolbar}
        <div className={bodyClassName}>{isEmpty ? emptyState : children}</div>
      </CardContent>

      {!isEmpty && pagination ? <Pagination {...pagination} /> : null}
    </Card>
  );
}
