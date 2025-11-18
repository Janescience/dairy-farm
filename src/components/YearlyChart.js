import { Loader2, BarChart3, AlertTriangle, TrendingUp } from 'lucide-react'

export default function YearlyChart({ chartData, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin mr-2" size={20} />
          <span className="text-gray-600 text-sm font-medium">กำลังโหลดข้อมูลรายปี...</span>
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
          <p className="text-sm font-medium text-gray-500">ไม่สามารถโหลดข้อมูลรายปีได้</p>
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
          <p className="text-sm font-medium text-gray-500">ไม่มีข้อมูลรายปี</p>
        </div>
      </div>
    )
  }

  // Find max value for scaling
  const maxValue = Math.max(...chartData.map(d => d.total))
  const chartHeight = 140
  const chartWidth = 350
  const leftPadding = 20
  const rightPadding = 20
  const topPadding = 40

  // Create smooth area path
  const createAreaPath = () => {
    if (chartData.length === 0) return ''

    const stepX = (chartWidth - leftPadding - rightPadding) / (chartData.length - 1)
    const points = chartData.map((data, index) => ({
      x: leftPadding + (index * stepX),
      y: topPadding + (chartHeight - topPadding) - (maxValue > 0 ? (data.total / maxValue) * (chartHeight - topPadding) : 0)
    }))

    let path = `M ${leftPadding} ${chartHeight}`

    points.forEach((point, index) => {
      if (index === 0) {
        path += ` L ${point.x} ${point.y}`
      } else {
        const prevPoint = points[index - 1]
        const cp1x = prevPoint.x + (point.x - prevPoint.x) * 0.3
        const cp1y = prevPoint.y
        const cp2x = point.x - (point.x - prevPoint.x) * 0.3
        const cp2y = point.y
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`
      }
    })

    path += ` L ${rightPadding + (chartData.length - 1) * stepX} ${chartHeight} Z`
    return path
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
          <TrendingUp size={16} className="text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 text-xl">การรีดนมรายปี 5 ปีล่าสุด</h3>
      </div>

      <div className="w-full">
        <div className="relative w-full" style={{ height: chartHeight + 80 }}>
          <svg width="100%" height={chartHeight + topPadding} className="overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight + topPadding}`}>
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="yearlyAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
                  <stop offset="50%" stopColor="rgba(236, 72, 153, 0.2)" />
                  <stop offset="100%" stopColor="rgba(236, 72, 153, 0.05)" />
                </linearGradient>
                <linearGradient id="yearlyLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="50%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(percent => {
                const y = topPadding + (percent / 100) * (chartHeight - topPadding)
                return (
                  <line
                    key={percent}
                    x1={leftPadding}
                    y1={y}
                    x2={chartWidth - rightPadding}
                    y2={y}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )
              })}

              {/* Area fill */}
              <path
                d={createAreaPath()}
                fill="url(#yearlyAreaGradient)"
                className="opacity-80"
              />

              {/* Area stroke */}
              <path
                d={createAreaPath().replace(' Z', '')}
                fill="none"
                stroke="url(#yearlyLineGradient)"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              />

              {/* Data points */}
              {chartData.map((data, index) => {
                const stepX = (chartWidth - leftPadding - rightPadding) / (chartData.length - 1)
                const x = leftPadding + (index * stepX)
                const y = topPadding + (chartHeight - topPadding) - (maxValue > 0 ? (data.total / maxValue) * (chartHeight - topPadding) : 0)
                const isCurrentYear = data.year === new Date().getFullYear()

                return (
                  <g key={data.year}>
                    {/* Glow effect */}
                    <circle
                      cx={x}
                      cy={y}
                      r="10"
                      fill={isCurrentYear ? "rgba(236, 72, 153, 0.2)" : "rgba(168, 85, 247, 0.15)"}
                      className="animate-pulse"
                    />

                    {/* Data point */}
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill={isCurrentYear ? "#EC4899" : "#A855F7"}
                      stroke="white"
                      strokeWidth="2"
                      className="hover:scale-125 transition-all duration-300 cursor-pointer drop-shadow-md"
                    />

                    {/* Value label */}
                    {data.total > 0 && (
                      <g className="opacity-100">
                        <rect
                          x={x - 25}
                          y={Math.max(y - 35, topPadding - 30)}
                          width="50"
                          height="22"
                          rx="11"
                          fill="rgba(255, 255, 255, 0.95)"
                          stroke="rgba(0, 0, 0, 0.1)"
                          strokeWidth="1"
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                        />
                        <text
                          x={x}
                          y={Math.max(y - 21, topPadding - 16)}
                          textAnchor="middle"
                          className="fill-gray-800 font-bold text-sm"
                          fontSize="14"
                        >
                          {data.total >= 1000 ? `${Math.floor(data.total / 10) / 100}K` : data.total.toFixed(2)}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
          </svg>

          {/* Year labels */}
          <div className="relative mt-4 w-full" style={{ height: '40px' }}>
            {chartData.map((data, index) => {
              const stepX = (chartWidth - leftPadding - rightPadding) / (chartData.length - 1)
              const xPercent = ((leftPadding + (index * stepX)) / chartWidth) * 100
              return (
                <div
                  key={data.year}
                  className="absolute text-sm text-gray-600 font-medium text-center transform -translate-x-1/2"
                  style={{
                    left: `${xPercent}%`,
                    top: '0px'
                  }}
                >
                  {data.displayYear}
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
            <div className="text-sm font-medium text-gray-600 mb-1">รวม {chartData.length} ปี</div>
            <div className="text-xl font-bold text-gray-900">
              {chartData.reduce((sum, data) => sum + data.total, 0).toFixed(2)} กก.
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-1">เฉลี่ยต่อปี</div>
            <div className="text-xl font-bold text-gray-900">
              {(chartData.reduce((sum, data) => sum + data.total, 0) / chartData.length).toFixed(2)} กก.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}