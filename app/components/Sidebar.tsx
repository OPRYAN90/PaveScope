function Sidebar() {
  // ... existing code ...

  return (
    <div className="flex h-screen">
      {/* Adjust the width of the sidebar */}
      <div className="flex flex-col w-56 bg-blue-600 text-white">
        // ... existing sidebar content ...
      </div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}