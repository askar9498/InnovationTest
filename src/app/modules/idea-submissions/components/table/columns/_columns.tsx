import {ColumnDef} from '@tanstack/react-table'
import { IdeaSubmissionDto, Accuracy } from '../../../core/_models'
import { AccuracyCell } from './AccuracyCell'
import { ActionCell } from './ActionCell'

// Define a type for the props that columns might need (e.g., callbacks)
interface IdeaSubmissionsColumnProps {
  // Renamed to match the handler in IdeaSubmissionsList
  onAccuracyChangeClick: (id: number, currentAccuracy: Accuracy) => void;
  onViewDetails?: (id: number) => void;
}

// Update the column definition to accept props and return the array
export const ideaSubmissionsColumns = ({ onAccuracyChangeClick, onViewDetails }: IdeaSubmissionsColumnProps): ColumnDef<IdeaSubmissionDto>[] => {
  return [
    {
      header: 'شناسه',
      accessorKey: 'id',
    },
    {
      header: 'عنوان',
      accessorKey: 'title',
    },
    {
      header: 'خلاصه ایده',
      accessorKey: 'description',
    },
    {
      header: 'نام نویسنده',
      accessorKey: 'createdByUserName',
    },
    {
      header: 'تاریخ ثبت',
      accessorKey: 'entryDate',
      cell: ({ row }) => new Date(row.original.entryDate).toLocaleDateString('fa-IR'),
    },
    {
      header: 'وضعیت',
      accessorKey: 'accuracy',
      cell: ({ row }) => <AccuracyCell accuracy={row.original.accuracy} />,
    },
    {
      header: 'عملیات',
      id: 'actions',
      // Pass the new click handler and the current accuracy to ActionCell
      cell: ({ row }) => <ActionCell ideaSubmissionId={row.original.id} currentAccuracy={row.original.accuracy} onViewDetails={onViewDetails} onAccuracyChangeClick={function (id: number, currentAccuracy: Accuracy): void {
        throw new Error('Function not implemented.');
      } } />,
    },
    // Add more columns as needed (e.g., actions)
  ]
} 