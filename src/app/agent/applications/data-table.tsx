import * as React from "react"
import { useRef, useEffect } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown, 
  Search, 
  Filter,
  SlidersHorizontal, 
  Download,
  Trash,
  Eye,
  EyeOff
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ErrorBoundary } from "./components/ErrorBoundary"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  onDelete?: (selectedRows: string[]) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey = "proposed_insured",
  onDelete,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    // Hide certain columns by default on mobile
    client_phone_number: window.innerWidth > 640,
    client_state: window.innerWidth > 640,
    point_of_sale: false,
    pms_form_filled_out: window.innerWidth > 640,
    split_with: window.innerWidth > 640,
    split_percentage: window.innerWidth > 640,
    payment_grid: window.innerWidth > 1024,
    payment_history: true, // Show payment history by default
    notes: false,
    notes_for_pay: false,
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [isUnmounting, setIsUnmounting] = React.useState(false);
  
  // Generate a stable table ID for this instance to avoid key collisions
  const tableId = useRef(`data-table-${Math.random().toString(36).substring(2, 11)}`).current;

  // Effect to sync rowSelection state with parent if provided
  React.useEffect(() => {
    if (onDelete && JSON.stringify(onDelete) !== JSON.stringify(rowSelection)) {
      setRowSelection(onDelete)
    }
  }, [onDelete])

  // Handle cleanup when component unmounts
  useEffect(() => {
    return () => {
      setIsUnmounting(true);
    };
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })
  
  // Function to download the data as CSV
  const downloadCSV = () => {
    // Get only visible columns
    const visibleColumns = table.getAllColumns().filter(column => column.getIsVisible())
    
    // Create headers
    const headers = visibleColumns.map(column => {
      const headerText = column.columnDef.header as string
      return headerText || column.id
    }).join(',')
    
    // Create rows
    const rows = table.getFilteredRowModel().rows.map(row => {
      return visibleColumns.map(column => {
        const cellValue = row.getValue(column.id)
        // Handle string values with commas by wrapping in quotes
        if (typeof cellValue === 'string' && cellValue.includes(',')) {
          return `"${cellValue}"`
        }
        return cellValue
      }).join(',')
    }).join('\n')
    
    // Combine headers and rows
    const csv = `${headers}\n${rows}`
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'applications.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle bulk delete if provided
  const handleDelete = () => {
    if (onDelete) {
      const selectedRows = Object.keys(rowSelection).map(
        index => (data[parseInt(index)] as any).id
      )
      onDelete(selectedRows)
    }
  }

  // Apply row classes based on policy health if available
  const getRowClassName = (row: any) => {
    const baseClass = "legacy-applications-table-row";
    const statusClass = row.original?.rowClassName || '';
    return `${baseClass} ${statusClass}`;
  }

  // Format phone numbers for better display
  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return '';
    // Remove non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phoneNumber;
  };

  // Format currency values
  const formatCurrency = (amount: any) => {
    if (!amount && amount !== 0) return '';
    const numAmount = parseFloat(String(amount).replace(/[^0-9.-]+/g, ''));
    if (isNaN(numAmount)) return amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numAmount);
  };

  // Format date strings
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Apply formatting to cell values
  React.useEffect(() => {
    // Apply formatting to cell elements after render
    const applyCellFormatting = () => {
      // Format phone numbers
      document.querySelectorAll('.phone-cell').forEach((el: any) => {
        const phone = el.textContent;
        if (phone && phone.length > 0) {
          el.textContent = formatPhoneNumber(phone);
        }
      });

      // Format currency cells
      document.querySelectorAll('.currency-cell').forEach((el: any) => {
        const amount = el.textContent;
        if (amount && amount.length > 0) {
          el.textContent = formatCurrency(amount);
        }
      });

      // Format date cells
      document.querySelectorAll('.date-cell').forEach((el: any) => {
        const date = el.textContent;
        if (date && date.length > 0) {
          el.textContent = formatDate(date);
        }
      });
    };

    // Run after the table renders
    setTimeout(applyCellFormatting, 100);
  }, [table.getRowModel().rows]);

  // Styles for the component
  const componentStyles = {
    container: {
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    filterToolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '16px',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
    },
    searchContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: '320px',
    },
    searchInput: {
      paddingLeft: '36px',
      height: '38px',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      fontSize: '14px',
    },
    searchIcon: {
      position: 'absolute',
      left: '10px',
      color: '#6b7280',
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '13px',
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      transition: 'all 0.2s',
    },
    tableContainer: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
    },
    tableHeader: {
      backgroundColor: '#f0f4f8',
    },
    headerRow: {
      borderBottom: '1px solid #e5e7eb',
    },
    headerCell: {
      padding: '12px 16px',
      textAlign: 'left',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
    },
    tableBody: {
      backgroundColor: 'white',
    },
    tableRow: {
      borderBottom: '1px solid #f3f4f6',
      transition: 'background-color 0.2s',
    },
    tableRowHover: {
      backgroundColor: '#f9fafb',
    },
    tableCell: {
      padding: '12px 16px',
      fontSize: '14px',
      color: '#374151',
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
    },
    paginationInfo: {
      fontSize: '13px',
      color: '#4b5563',
    },
    paginationControls: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
    },
    paginationButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      padding: '6px 10px',
      fontSize: '13px',
      fontWeight: '500',
      backgroundColor: 'white',
      color: '#374151',
      border: '1px solid #d1d5db',
      transition: 'all 0.2s',
      cursor: 'pointer',
    },
    paginationButtonHover: {
      backgroundColor: '#f3f4f6',
      borderColor: '#b1b6bf',
    },
    paginationText: {
      fontSize: '13px',
      color: '#6b7280',
    },
    visibilityDropdown: {
      position: 'relative',
    },
  };

  return (
    <TooltipProvider>
      <div style={componentStyles.container} className="legacy-applications-table-container">
        <div style={componentStyles.filterToolbar} className="legacy-applications-table-toolbar">
          <div style={componentStyles.searchContainer} className="legacy-applications-search-container">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search all columns..."
              value={globalFilter || ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 legacy-applications-search-input"
            />
          </div>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex" onClick={() => table.resetColumnVisibility()}>
              <Filter className="mr-2 h-3.5 w-3.5" />
              Reset Columns
            </Button>
            <Select>
              <SelectTrigger className="h-8">
                <div className="flex items-center">
                  <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                  <span>View</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {table.getAllColumns().filter(column => column.getCanHide()).map(column => {
                  return (
                    <div key={column.id} className="flex items-center space-x-2 p-1">
                      <Checkbox
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        id={column.id}
                        className="applications-page checkbox"
                      />
                      <label htmlFor={column.id} className="text-sm">
                        {column.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    </div>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div style={componentStyles.tableContainer} className="legacy-table-container">
          <Table 
            style={componentStyles.table}
            className="legacy-applications-table"
          >
            <TableHeader 
              style={componentStyles.tableHeader}
              className="legacy-applications-table-header"
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow 
                  key={`${tableId}-header-${headerGroup.id}`}
                  style={componentStyles.headerRow}
                  className="legacy-applications-table-header-row"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead 
                        key={`${tableId}-header-cell-${header.id}`}
                        style={componentStyles.headerCell}
                        className="legacy-applications-table-header-cell"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody 
              style={componentStyles.tableBody}
              className="legacy-applications-table-body"
            >
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <ErrorBoundary key={`${tableId}-row-${row.id}-${index}`}>
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      data-status={(row.original as any)?.status || ""}
                      data-policy-health={(row.original as any)?.policy_health || ""}
                      data-paid-status={(row.original as any)?.paid_status || ""}
                      style={{
                        ...componentStyles.tableRow,
                        ...(row.original?.rowClassName ? { backgroundColor: 'var(--status-bg-color)', color: 'var(--status-text-color)' } : {})
                      }}
                      className={`applications-table-row ${row.original?.rowClassName}`}
                    >
                      {row.getVisibleCells().map((cell: any) => {
                        // Create a stable cell key
                        const cellKey = `${tableId}-row-${row.id}-cell-${cell.id}`;
                        
                        return (
                          <TableCell 
                            key={cellKey} 
                            style={componentStyles.tableCell}
                            className="applications-table-cell"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  </ErrorBoundary>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Search className="h-8 w-8 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No applications found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div 
          style={componentStyles.paginationContainer}
          className="legacy-pagination-container"
        >
          <div 
            style={componentStyles.paginationInfo}
            className="legacy-pagination-info"
          >
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} applications
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="legacy-select-trigger h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top" className="legacy-select-content">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`} className="legacy-select-item">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div 
              style={componentStyles.paginationControls}
              className="legacy-pagination-controls"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    style={componentStyles.paginationButton}
                    className="legacy-pagination-button"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>First page</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    style={componentStyles.paginationButton}
                    className="legacy-pagination-button"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous page</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    style={componentStyles.paginationButton}
                    className="legacy-pagination-button"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next page</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    style={componentStyles.paginationButton}
                    className="legacy-pagination-button"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Last page</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
} 