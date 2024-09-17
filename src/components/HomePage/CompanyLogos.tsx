import React from 'react';

const logoPlaceholders = [
  require('../../assets/images/cv2_logo.png'),              // CV2 Logo
  require('../../assets/images/google_maps_logo.png'),      // Google Maps Logo
  require('../../assets/images/matplotlib_logo.png'),       // Matplotlib Logo
  require('../../assets/images/pandas_logo.png'),           // Pandas Logo
  require('../../assets/images/python_logo.png'),           // Python Logo
  require('../../assets/images/pytorch_logo.png'),          // PyTorch Logo
  require('../../assets/images/sikit_learn_logo.png'),      // Scikit Learn Logo
  require('../../assets/images/spreadsheets_logo.png'),     // Spreadsheets Logo
];

export default function CompanyLogos() {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Technologies We Use</h3>
      <div className="grid grid-cols-4 gap-4">
        {logoPlaceholders.map((logo, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-center">
            <img src={logo} alt={`Company Logo ${index + 1}`} className="max-w-full max-h-full object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}
