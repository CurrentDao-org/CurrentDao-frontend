'use client';

import React from 'react';
import { LocationPrivacy } from '@/types/location';

interface PrivacyControlsProps {
  privacy: LocationPrivacy;
  onUpdatePrivacy: (newPrivacy: Partial<LocationPrivacy>) => void;
}

const PrivacyControls: React.FC<PrivacyControlsProps> = ({ privacy, onUpdatePrivacy }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Privacy Controls</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Hide Precise Location</p>
            <p className="text-sm text-gray-500">Only show your approximate area to others.</p>
          </div>
          <button
            onClick={() => onUpdatePrivacy({ hideLocation: !privacy.hideLocation })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              privacy.hideLocation ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                privacy.hideLocation ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blur Radius (meters): {privacy.blurRadius}m
          </label>
          <input
            type="range"
            min="0"
            max="1000"
            step="50"
            value={privacy.blurRadius}
            onChange={(e) => onUpdatePrivacy({ blurRadius: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Increases the uncertainty of your location shared with others.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Share with Contacts Only</p>
            <p className="text-sm text-gray-500">Only verified contacts can see your location.</p>
          </div>
          <button
            onClick={() => onUpdatePrivacy({ shareWithContactsOnly: !privacy.shareWithContactsOnly })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              privacy.shareWithContactsOnly ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                privacy.shareWithContactsOnly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyControls;
