import { Loader2, Calendar, AlertTriangle, BarChart3 } from 'lucide-react'

export default function MonthlyChart({ chartData, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin mr-2" size={20} />
          <span className="text-gray-600 text-sm font-medium">กำลังโหลดข้อมูลรายเดือน...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gradient-to-br from-red-200 to-red-300 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <p className="text-sm font-medium text-gray-500">ไม่สามารถโหลดข้อมูลรายเดือนได้</p>
        </div>
      </div>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">ไม่มีข้อมูลรายเดือน</p>
        </div>
      </div>
    )
  }

  // Find max value for scaling
  const maxValue = Math.max(...chartData.map(d => d.total))
  const chartHeight = 100

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
          <Calendar size={16} className="text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 text-xl">การรีดนมรายเดือน {chartData[0]?.year}</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4">
          {chartData.map((data, index) => {
            const percentage = maxValue > 0 ? (data.total / maxValue) * 100 : 0
            const isCurrentMonth = data.month === new Date().getMonth() + 1
            const strokeDasharray = 2 * Math.PI * 35 // circumference
            const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100

            return (
              <div key={`${data.year}-${data.month}`} className="flex flex-col items-center group">
                {/* Circular Progress */}
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                    {/* Background circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="6"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      fill="none"
                      stroke={isCurrentMonth ? "url(#currentMonthGradient)" : "url(#monthGradient)"}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000 ease-out"
                    />

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="monthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#A78BFA" />
                      </linearGradient>
                      <linearGradient id="currentMonthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center value */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-900">
                        {data.total >= 1000 ? `${Math.floor(data.total / 10) / 100}K` : data.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">กก.</div>
                    </div>
                  </div>
                </div>

                {/* Month label */}
                <div className="mt-3 text-sm text-gray-600 font-medium text-center">
                  {data.displayMonth}
                </div>

                {/* Percentage indicator */}
                <div className="text-xs text-gray-400 mt-1">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modern Glass Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100/50">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-1">รวมทั้งปี</div>
            <div className="text-xl font-bold text-gray-900">
              {chartData.reduce((sum, data) => sum + data.total, 0).toFixed(2)} กก.
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-1">เฉลี่ยต่อเดือน</div>
            <div className="text-xl font-bold text-gray-900">
              {(chartData.reduce((sum, data) => sum + data.total, 0) / 12).toFixed(2)} กก.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}