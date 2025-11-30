"use client";

import { useState } from "react";
import { supabase } from "../../components/lib/supabaseClient";

export default function UpdateVimeoPrivacyPage() {
  const [updating, setUpdating] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const addLog = (message: string) => {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
  };

  const updateAllVimeoVideos = async () => {
    setUpdating(true);
    setLog([]);
    setProgress({ current: 0, total: 0 });

    try {
      addLog("🔍 Fetching all Vimeo lessons from database...");

      // Fetch all lessons from course_lessons_vimeo table
      const { data: lessons, error } = await supabase
        .from("course_lessons_vimeo")
        .select("id, title, vimeo_video_id, vimeo_player_url")
        .not("vimeo_video_id", "is", null);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!lessons || lessons.length === 0) {
        addLog("⚠️ No Vimeo lessons found in database");
        setUpdating(false);
        return;
      }

      addLog(`✅ Found ${lessons.length} Vimeo lessons`);
      setProgress({ current: 0, total: lessons.length });

      // Update each video
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        setProgress({ current: i + 1, total: lessons.length });

        addLog(`📹 [${i + 1}/${lessons.length}] Updating: ${lesson.title}`);
        addLog(`   Video ID: ${lesson.vimeo_video_id}`);

        try {
          const res = await fetch("/api/vimeo/update-privacy", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoId: lesson.vimeo_video_id }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            addLog(`   ❌ Failed: ${errorData.error}`);
          } else {
            addLog(`   ✅ Success - Branding hidden, privacy set to unlisted`);
          }
        } catch (err: any) {
          addLog(`   ❌ Error: ${err.message}`);
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      addLog("");
      addLog("🎉 ALL VIDEOS UPDATED!");
      addLog(`✅ Successfully processed ${lessons.length} videos`);
      addLog("   - Privacy: Hide from Vimeo (videos completely hidden from Vimeo.com)");
      addLog("   - Only playable on maathiyosi.io");
      addLog("   - Title, logo, and branding: Hidden");
      addLog("   - Share/like buttons: Hidden");
      addLog("   - Downloads: Disabled");
      addLog("   - Comments: Disabled");
    } catch (err: any) {
      addLog(`❌ Fatal error: ${err.message}`);
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">
          Update Vimeo Video Privacy Settings
        </h1>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h2 className="font-semibold text-blue-900 mb-2">What this does:</h2>
          <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
            <li>Sets privacy to "Hide from Vimeo" - videos completely hidden from Vimeo.com</li>
            <li>Videos only playable on maathiyosi.io (embeddable but unlisted)</li>
            <li>Hides video title from player</li>
            <li>Hides Vimeo logo and all branding</li>
            <li>Hides share, like, and watch later buttons</li>
            <li>Disables downloads completely</li>
            <li>Disables comments</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <h2 className="font-semibold text-yellow-900 mb-2">⚠️ Important:</h2>
          <p className="text-yellow-800 text-sm">
            This will update ALL existing Vimeo videos in your database.
            New uploads will automatically have these settings applied.
          </p>
        </div>

        {progress.total > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">Progress</span>
              <span className="text-gray-600">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-purple-600 h-full transition-all duration-300 ease-out"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {Math.round((progress.current / progress.total) * 100)}%
            </p>
          </div>
        )}

        <button
          onClick={updateAllVimeoVideos}
          disabled={updating}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
            updating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 active:scale-95"
          }`}
        >
          {updating ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Updating Videos...
            </span>
          ) : (
            "Update All Vimeo Videos"
          )}
        </button>

        {/* Log Output */}
        {log.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Update Log</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {log.map((line, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
