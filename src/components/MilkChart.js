import { Loader2, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react'

export default function MilkChart({ chartData, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin mr-2" size={20} />
          <span className="text-gray-600 text-sm font-medium">กำลังโหลดข้อมูลกราฟ...</span>
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
          <p className="text-sm font-medium text-gray-500">ไม่สามารถโหลดข้อมูลกราฟได้</p>
        </div>
      </div>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <BarChart3 size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">ไม่มีข้อมูลสำหรับกราฟ</p>
        </div>
      </div>
    )
  }

  // Find max value for scaling
  const maxValue = Math.max(...chartData.map(d => d.total))
  const chartHeight = 200
  const pointSpacing = 60
  const leftPadding = 40
  const rightPadding = 40
  const chartWidth = Math.max(600, (chartData.length - 1) * pointSpacing) + leftPadding + rightPadding

  // Create SVG path for smooth curved line chart
  const createSmoothPath = () => {
    if (chartData.length === 0) return ''
    if (chartData.length === 1) {
      const x = leftPadding
      const y = chartHeight - (maxValue > 0 ? (chartData[0].total / maxValue) * chartHeight : 0)
      return `M ${x} ${y}`
    }

    const stepX = (chartWidth - leftPadding - rightPadding) / (chartData.length - 1)
    const points = chartData.map((data, index) => ({
      x: leftPadding + (index * stepX),
      y: chartHeight - (maxValue > 0 ? (data.total / maxValue) * chartHeight : 0)
    }))

    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1]
      const currentPoint = points[i]

      // Control points for smooth curve
      const cp1x = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.3
      const cp1y = prevPoint.y
      const cp2x = currentPoint.x - (currentPoint.x - prevPoint.x) * 0.3
      const cp2y = currentPoint.y

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentPoint.x} ${currentPoint.y}`
    }

    return path
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
          <TrendingUp size={16} className="text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 text-xl">การรีดนม 10 วันล่าสุด</h3>
      </div>

      <div className="overflow-x-auto overflow-y-visible pb-8" style={{ maxHeight: '400px' }}>
        <div className="relative" style={{ width: chartWidth, height: chartHeight + 80, minWidth: '100%', paddingTop: '30px' }}>
          <svg width={chartWidth} height={chartHeight} className="overflow-visible" style={{ marginTop: '30px' }}>
            {/* Grid lines */}
            {[0, 20, 40, 60, 80, 100].map(percent => {
              const y = (percent / 100) * chartHeight
              return (
                <line
                  key={percent}
                  x1={leftPadding}
                  y1={y}
                  x2={chartWidth - rightPadding}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              )
            })}

            {/* Vertical grid lines */}
            {chartData.map((_, index) => {
              const stepX = (chartWidth - leftPadding - rightPadding) / (chartData.length - 1)
              const x = leftPadding + (index * stepX)
              return (
                <line
                  key={index}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={chartHeight}
                  stroke="#f9fafb"
                  strokeWidth="1"
                />
              )
            })}

            {/* Modern gradient line */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
              </linearGradient>
            </defs>

            {/* Area fill under curve */}
            <path
              d={createSmoothPath() + ` L ${leftPadding + ((chartData.length - 1) * (chartWidth - leftPadding - rightPadding) / (chartData.length - 1))} ${chartHeight} L ${leftPadding} ${chartHeight} Z`}
              fill="url(#areaGradient)"
            />

            {/* Modern gradient curved line */}
            <path
              d={createSmoothPath()}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />

            {/* Modern gradient data points */}
            {chartData.map((data, index) => {
              const stepX = (chartWidth - leftPadding - rightPadding) / (chartData.length - 1)
              const x = leftPadding + (index * stepX)
              const y = chartHeight - (maxValue > 0 ? (data.total / maxValue) * chartHeight : 0)
              const isToday = index === chartData.length - 1

              return (
                <g key={data.date}>
                  {/* Glow effect */}
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={isToday ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.15)"}
                    className="animate-pulse"
                  />

                  {/* Modern gradient point */}
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill={isToday ? "url(#todayGradient)" : "url(#pointGradient)"}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:scale-125 transition-all duration-300 cursor-pointer drop-shadow-md"
                  />

                  {/* Value label with modern styling */}
                  {data.total > 0 && (
                    <g>
                      {/* Background pill */}
                      <rect
                        x={x - 20}
                        y={Math.max(y - 30, 5)}
                        width="40"
                        height="20"
                        rx="10"
                        fill="rgba(255, 255, 255, 0.9)"
                        stroke="rgba(0, 0, 0, 0.1)"
                        strokeWidth="1"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                      />
                      <text
                        x={x}
                        y={Math.max(y - 17, 18)}
                        textAnchor="middle"
                        className="fill-gray-800 font-bold text-sm"
                        fontSize="12"
                      >
                        {data.total.toFixed(2)}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {/* Additional gradients for points */}
            <defs>
              <radialGradient id="pointGradient" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#3B82F6" />
              </radialGradient>
              <radialGradient id="todayGradient" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#10B981" />
              </radialGradient>
            </defs>
          </svg>

          {/* Date labels */}
          <div className="relative mt-4" style={{ width: chartWidth, height: '30px' }}>
            {chartData.map((data, index) => {
              const stepX = (chartWidth - leftPadding - rightPadding) / (chartData.length - 1)
              const x = leftPadding + (index * stepX)
              return (
                <div
                  key={data.date}
                  className="absolute text-sm text-gray-500 text-center font-medium"
                  style={{
                    left: `${x - 25}px`,
                    width: '50px',
                    top: '0px'
                  }}
                >
                  {data.displayDate}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modern Glass Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100/50">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-1">รวม 10 วัน</div>
            <div className="text-xl font-bold text-gray-900">
              {chartData.reduce((sum, data) => sum + data.total, 0).toFixed(2)} กก.
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-1">เฉลี่ยต่อวัน</div>
            <div className="text-xl font-bold text-gray-900">
              {(chartData.reduce((sum, data) => sum + data.total, 0) / chartData.length).toFixed(2)} กก.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}