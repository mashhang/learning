"use client";

export default function SettingsModal() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <p>Adjust your preferences and security settings.</p>
      <div className="mt-4">
        <label className="block mb-2">
          <span className="text-gray-600">Theme</span>
          <select className="w-full p-2 border rounded">
            <option>System</option>
            <option>Light</option>
            <option>Dark</option>
          </select>
        </label>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Save Settings
        </button>
      </div>
    </div>
  );
}
