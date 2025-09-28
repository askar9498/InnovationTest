import React from 'react'
import clsx from 'clsx'
import { Accuracy } from '../../../core/_models'

interface Props {
  accuracy: Accuracy | undefined
}

const AccuracyCell: React.FC<Props> = ({ accuracy }) => {
  const getAccuracyText = (acc: Accuracy | undefined) => {
    switch (acc) {
      case Accuracy.Accepted:
        return "تایید شده";
      case Accuracy.Pending:
        return "در انتظار تایید";
      case Accuracy.Deleted:
        return "حذف شده";
      default:
        return "نامشخص";
    }
  };

  const getAccuracyClass = (acc: Accuracy | undefined) => {
    switch (acc) {
      case Accuracy.Accepted:
        return "badge badge-light-success";
      case Accuracy.Pending:
        return "badge badge-light-warning";
      case Accuracy.Deleted:
        return "badge badge-light-danger";
      default:
        return "badge badge-light-primary"; // Or a neutral style
    }
  };

  return (
    <span className={clsx(getAccuracyClass(accuracy), 'fs-7 fw-bold')}>
      {getAccuracyText(accuracy)}
    </span>
  );
};

export { AccuracyCell }; 