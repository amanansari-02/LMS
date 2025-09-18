import type { IDashboard } from "@/interface/dashboard";
import ModuleService from "@/services/ModuleService";
import { formatVideoTime } from "@/utils/common-functions";
import { BookOpen, CheckCircle, Clock, Play } from "lucide-react";
import { useEffect, useState } from "react";

export default function LearningAnalysis() {
  const [data, setData] = useState<IDashboard>({
    percentage: 0,
    total_enrolled: 0,
    total_completed: 0,
    total_time_taken: 0,
  });
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const dashboard = async () => {
    const res = await ModuleService.getDashboard(user.id);
    setData(res.data.data);
  };

  useEffect(() => {
    dashboard();
  }, []);

  return (
    <div>
      <div className="mt-2 p-4">
        <div className="flex">
          <div>
            <div className="text-lg text-start font-semibold">
              My Learning Dashboard
            </div>
            <div className="w-28 h-1 bg-primary mt-1 rounded"></div>
          </div>

          {/* Progress Circle + Label */}
          <div className="flex justify-center items-center gap-2 mb-4 ml-8">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#853de9"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={
                    2 * Math.PI * 20 -
                    (data.percentage / 100) * (2 * Math.PI * 20)
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold">
                {data.percentage || 0}%
              </div>
            </div>
            <span className="text-gray-700 text-sm font-medium">
              Learning Completion
            </span>
          </div>
        </div>

        <div className="max-w-2xl  p-4">
          <div className="grid grid-cols-2 gap-5">
            {/* Enrolled Card */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between h-36 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-3xl font-bold">
                    {data.total_enrolled || 0}
                  </div>
                  <div className="text-sm opacity-90 mt-1">
                    Modules Enrolled
                  </div>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Completed Card */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between h-36 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-3xl font-bold">
                    {data.total_completed || 0}
                  </div>
                  <div className="text-sm opacity-90 mt-1">
                    Modules Completed
                  </div>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-3">
                <div
                  className="bg-white h-1.5 rounded-full"
                  style={{
                    width: `${
                      data.total_enrolled
                        ? Math.round(
                            (data.total_completed / data.total_enrolled) * 100
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="text-xs mt-1">
                {data.total_enrolled
                  ? Math.round(
                      (data.total_completed / data.total_enrolled) * 100
                    )
                  : 0}
                % completion rate
              </div>
            </div>

            {/* Time Card - Full Width */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-2xl p-6 shadow-lg col-span-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-3xl font-bold">
                    {formatVideoTime(data.total_time_taken) || 0}
                  </div>
                  <div className="text-sm opacity-90 mt-1">
                    Content Consumed
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="flex items-center mt-4 text-sm">
                <div className="flex items-center mr-6">
                  <Play className="w-4 h-4 mr-1" />
                  <span>{data.total_completed} videos watched</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
