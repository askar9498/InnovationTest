import React from 'react' // Removed useState as dropdown is removed
import { Link } from 'react-router-dom' // Assuming react-router-dom is used
import { KTIcon } from '../../../../../../_metronic/helpers'
import { Accuracy } from '../../../core/_models'

interface Props {
  ideaSubmissionId: number;
  currentAccuracy: Accuracy; // Add currentAccuracy prop
  onAccuracyChangeClick: (id: number, currentAccuracy: Accuracy) => void; // Rename and update callback prop
  onViewDetails?: (id: number) => void;
}

const ActionCell: React.FC<Props> = ({ ideaSubmissionId, currentAccuracy, onAccuracyChangeClick, onViewDetails }) => {
  // Removed state and handlers related to dropdown

  // Determine the icon based on currentAccuracy
  const accuracyIcon = currentAccuracy === Accuracy.Accepted ? 'pill' : 'check';

  return (
    <div className='d-flex justify-content-end flex-shrink-0'>
      {/* View Details Button */}
      {onViewDetails ? (
        <button
          className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
          title='مشاهده جزئیات'
          onClick={() => onViewDetails(ideaSubmissionId)}
        >
          <KTIcon iconName='eye' className='fs-3' />
        </button>
      ) : (
        <Link
          to={`/idea-submissions/${ideaSubmissionId}`}
          className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
          title='مشاهده جزئیات'
        >
          <KTIcon iconName='eye' className='fs-3' />
        </Link>
      )}

      {/* Change Accuracy Button - Now opens modal */}
      <button
        className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
        onClick={() => onAccuracyChangeClick(ideaSubmissionId, currentAccuracy)} // Call the new click handler
        title='تغییر وضعیت' // Translated title
      >
        <KTIcon iconName={accuracyIcon} className='fs-3' /> {/* Use the determined icon */}
      </button>

      {/* Removed the old accuracy dropdown */}
    </div>
  )
}

export { ActionCell } 