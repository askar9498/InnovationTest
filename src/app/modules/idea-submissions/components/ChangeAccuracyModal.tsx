import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import clsx from 'clsx';
import { KTIcon } from '../../../../_metronic/helpers';
import { IdeaSubmissionDto, Accuracy } from '../core/_models';
import { updateIdeaSubmissionAccuracy } from '../core/_requests'; // Import the API call

interface ChangeAccuracyModalProps {
  show: boolean;
  onClose: () => void;
  submissionId: number | null;
  currentAccuracy: Accuracy | null;
  onSuccess: () => void;
}

const accuracyOptions = [
  { value: Accuracy.Pending, label: 'در انتظار' },
  { value: Accuracy.Accepted, label: 'پذیرفته شده' },
  { value: Accuracy.Deleted, label: 'حذف شده' },
];

const ChangeAccuracyModal: React.FC<ChangeAccuracyModalProps> = ({
  show,
  onClose,
  submissionId,
  currentAccuracy,
  onSuccess,
}) => {
  const [initialAccuracy, setInitialAccuracy] = useState<Accuracy | null>(null);

  useEffect(() => {
    if (show && currentAccuracy !== null) {
      setInitialAccuracy(currentAccuracy);
      formik.setFieldValue('accuracy', currentAccuracy);
    }
  }, [show, currentAccuracy]);

  const formik = useFormik({
    initialValues: { accuracy: initialAccuracy },
    enableReinitialize: true, // Important to re-initialize form when initialAccuracy changes
    validationSchema: Yup.object().shape({
      accuracy: Yup.number()
        .oneOf(accuracyOptions.map(opt => opt.value), 'وضعیت انتخاب شده نامعتبر است')
        .required('انتخاب وضعیت الزامی است'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (submissionId === null) return;
      setSubmitting(true);
      try {
        // Ensure accuracy is treated as a number
        await updateIdeaSubmissionAccuracy(submissionId, values.accuracy as number);

        onSuccess(); // Call success callback
        // onClose(); // Close modal - parent handles this via onSuccess
      } catch (error) {
        console.error('Error updating accuracy:', error);
        // TODO: Handle error (e.g., show a toast)
        // toast.error('خطا در تغییر وضعیت ایده'); // Example toast
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!show) return null;

  return (
    <div
      className="modal show" // Use 'show' class to make it visible
      id="kt_modal_change_accuracy"
      tabIndex={-1}
      aria-hidden="true"
      role="dialog" // Add role for accessibility
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} // Inline style for backdrop
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose(); // Close modal on backdrop click
        }
      }}
    >
      <div className="modal-dialog modal-dialog-centered mw-650px">
        <div className="modal-content">
          <form className="form" onSubmit={formik.handleSubmit} noValidate>
            <div className="modal-header">
              <h2 className="fw-bold">تغییر وضعیت ایده</h2> {/* Translated */}
              {/* Close button */}
              <div
                onClick={onClose}
                className="btn btn-icon btn-sm btn-active-icon-primary"
              >
                <KTIcon iconName="cross" className="fs-1" />
              </div>
            </div>

            <div className="modal-body scroll-y mx-lg-5 pb-15">
              <div className="fv-row mb-8">
                <label className="required fs-6 fw-semibold mb-2">
                  وضعیت
                </label>
                <select
                  {...formik.getFieldProps('accuracy')}
                  className={clsx(
                    'form-select form-select-solid',
                    { 'is-invalid': formik.touched.accuracy && formik.errors.accuracy }
                  )}
                >
                  <option value="">وضعیت را انتخاب کنید</option>
                  {accuracyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formik.touched.accuracy && formik.errors.accuracy && (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{formik.errors.accuracy}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light me-3"
                onClick={onClose}
                disabled={formik.isSubmitting}
              >
                بستن
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formik.isSubmitting || !formik.isValid || !formik.touched.accuracy}
              >
                {formik.isSubmitting ? (
                  <span className="indicator-progress" style={{ display: 'block' }}>
                    در حال تغییر...
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                ) : (
                  <span className="indicator-label">ذخیره تغییرات</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangeAccuracyModal; 