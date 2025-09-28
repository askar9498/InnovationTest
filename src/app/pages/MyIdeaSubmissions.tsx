import React, { useState } from 'react';
import IdeaSubmissionsList from '../modules/idea-submissions/components/IdeaSubmissionsList';
import { IdeaSubmissionDetailsPage } from '../modules/idea-submissions/components/IdeaSubmissionDetailsPage';
import { Modal } from 'react-bootstrap';

const MyIdeaSubmissions: React.FC = () => {
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // هندل انتخاب ایده برای نمایش جزئیات
  const handleViewDetails = (id: number) => {
    setSelectedIdeaId(id);
    setShowDetails(true);
  };

  // هندل بستن مودال جزئیات
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedIdeaId(null);
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'sans' }}>
      <h2 className="fw-bold mb-5">پیشنهادهای من</h2>
      {/* لیست ایده‌ها */}
      <IdeaSubmissionsList onViewDetails={handleViewDetails} onlyMine={true} />

      {/* مودال نمایش جزئیات و تایم‌لاین */}
      <Modal show={showDetails} onHide={handleCloseDetails} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title  style={{ fontFamily: 'sans' }} dir='rtl'>جزئیات ایده</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedIdeaId && <IdeaSubmissionDetailsPage ideaId={selectedIdeaId} showTimeline={true} />}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MyIdeaSubmissions; 