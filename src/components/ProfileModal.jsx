import React from 'react';

const ProfileModal = ({ profiles, currentProfile, onSelect, onCancel }) => {
  return (
    <div className="modal" style={{display: 'block'}}>
      <h2 style={{marginTop: 0}}>Select Profile</h2>
      <div className="profile-list">
        {profiles.map(p => (
          <div key={p.id} className="profile-item-row">
            <button
              className={`pill ${currentProfile === p.name ? 'active' : ''}`}
              onClick={() => onSelect(p.name)}
              style={{justifyContent: 'flex-start', flex: 1}}
            >
              <span className="material-icons">{p.icon}</span>
              <span>{p.name} Profile</span>
            </button>
          </div>
        ))}
      </div>
      <div className="form-actions" style={{marginTop: '2rem'}}>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default ProfileModal;
