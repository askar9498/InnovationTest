import React from 'react';

interface IdeaSubmissionModalProps {
    show: boolean;
    handleClose: () => void;
    // TODO: Add data prop for editing if needed
}

const IdeaSubmissionModal: React.FC<IdeaSubmissionModalProps> = ({ show, handleClose }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal" style={{ display: 'block' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add/Edit Idea Submission</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        {/* TODO: Implement form with different UI/style here */}
                        <p>Modal body content goes here.</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                        {/* TODO: Add submit button */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdeaSubmissionModal; 