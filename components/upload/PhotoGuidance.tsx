'use client';

export default function PhotoGuidance() {
  return (
    <div className="w-full bg-card border border-card-border rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-foreground mb-6">Photo Guidance</h3>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Good Photo Section */}
        <div className="flex-1 border border-success-light bg-success-light/20 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-lg font-medium text-success">Good Photo</h4>
          </div>
          
          <div className="mb-6 relative w-full h-48 bg-white rounded-md border border-card-border overflow-hidden flex items-center justify-center">
            {/* CSS Illustration - Good */}
            <div className="relative w-16 h-32 flex flex-col items-center">
              <div className="w-10 h-10 bg-success/80 rounded-full mb-1"></div>
              <div className="w-16 h-20 bg-success/80 rounded-t-xl rounded-b-md"></div>
            </div>
            {/* Sun/Light icon */}
            <div className="absolute top-3 right-3">
              <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span> Full body visible
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span> Good, even lighting
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span> Facing camera directly
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span> Unobstructed view
            </li>
          </ul>
        </div>

        {/* Needs Improvement Section */}
        <div className="flex-1 border border-error-light bg-error-light/20 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4 className="text-lg font-medium text-amber-700">Needs Improvement</h4>
          </div>
          
          <div className="mb-6 relative w-full h-48 bg-slate-900 rounded-md border border-card-border overflow-hidden flex items-center justify-center">
            {/* CSS Illustration - Bad */}
            <div className="relative w-24 h-40 flex flex-col items-center opacity-40 translate-y-8">
              <div className="w-12 h-12 bg-white rounded-full mb-1"></div>
              <div className="w-20 h-28 bg-white rounded-t-xl rounded-b-md"></div>
            </div>
            
            {/* Crop marks */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-error"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-error"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-error"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-error"></div>
          </div>
          
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">•</span> Cropped body parts
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">•</span> Very dark or backlit
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">•</span> Multiple people in frame
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">•</span> Blurry or low resolution
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
