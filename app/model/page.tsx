import React from 'react';
import DashboardLayout from '../dashboard-layout';

export default function ModelPage() {
  return (
    <DashboardLayout>
    <div>
      <h1 className="text-3xl font-bold mb-4">Model</h1>
      <p>Here you can view and adjust the AI model parameters for image analysis.</p>
    </div>
    </DashboardLayout>
  );
}