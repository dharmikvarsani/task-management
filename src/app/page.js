"use client";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-6 space-y-4">
        <h1 className="text-2xl font-bold">Welcome!</h1>
        <p className="text-gray-600">
          This is your dashboard. Use the sidebar to navigate through your tasks and users.
        </p>
      </main>
    </div>
  );
}
