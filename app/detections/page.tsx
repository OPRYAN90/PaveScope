import React from 'react';
import DashboardLayout from '../dashboard-layout';

export default function DetectionsPage() {
  return (
    <DashboardLayout>
    <main>
      <div>
        <h1 className="text-3xl font-bold mb-4">Detections</h1>
        <p>This page displays the results of AI detections on processed images.</p>
      </div>
      </main>
    </DashboardLayout>
  );
}