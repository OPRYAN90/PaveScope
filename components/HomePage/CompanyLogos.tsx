import Image from 'next/image';

const logoPlaceholders = [
  '/images/cv2_logo.png',              // CV2 Logo
  '/images/google_maps_logo.png',      // Google Maps Logo
  '/images/matplotlib_logo.png',       // Matplotlib Logo
  '/images/pandas_logo.png',           // Pandas Logo
  '/images/python_logo.png',           // Python Logo
  '/images/pytorch_logo.png',          // PyTorch Logo
  '/images/sikit_learn_logo.png',      // Scikit Learn Logo
  '/images/spreadsheets_logo.png',     // Spreadsheets Logo
];

export default function CompanyLogos() {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Technologies We Use</h3>
      <div className="grid grid-cols-4 gap-4">
        {logoPlaceholders.map((logo, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-center">
            <Image src={logo} alt={`Company Logo ${index + 1}`} width={100} height={100} objectFit="contain" />
          </div>
        ))}
      </div>
    </div>
  );
}
