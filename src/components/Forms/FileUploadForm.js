import React from 'react';
import './Forms.css';

const FileUploadForm = ({ onUpload }) => {
  return (
    <div className="card">
      <div className="upload-section">
        <h3>Upload Bank Statement</h3>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={onUpload}
        />
      </div>
    </div>
  );
};

export default FileUploadForm; 