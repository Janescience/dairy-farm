'use client'

import Image from 'next/image'
import { TrendingUp, Loader2, Sun, Moon, ArrowUp, ArrowDown, Minus,Milk } from 'lucide-react'
import { useFarms } from '../hooks/useFarms'
import { useDailySummary } from '../hooks/useDailySummary'
import { useChartData } from '../hooks/useChartData'
import { useMonthlyChartData } from '../hooks/useMonthlyChartData'
import { useYearlyChartData } from '../hooks/useYearlyChartData'
import { formatThaiDate } from '../lib/datetime'
import Avatar from '../components/Avatar'
import BottomNavigation from '../components/BottomNavigation'
import MilkChart from '../components/MilkChart'
import MonthlyChart from '../components/MonthlyChart'
import YearlyChart from '../components/YearlyChart'

export default function Home() {
  const { farms } = useFarms()
  const farmId = farms?.[0]?._id
  const { summary, loading: summaryLoading } = useDailySummary(farmId)
  const { chartData, loading: chartLoading, error: chartError } = useChartData(farmId)
  const { chartData: monthlyData, loading: monthlyLoading, error: monthlyError } = useMonthlyChartData(farmId)
  const { chartData: yearlyData, loading: yearlyLoading, error: yearlyError } = useYearlyChartData(farmId)

  // Component สำหรับแสดงการเปรียบเทียบ
  const DiffIndicator = ({ diff, showNumber = true }) => {
    if (diff > 0) {
      return (
        <span className="inline-flex items-center text-green-600 text-lg font-normal">
          <ArrowUp size={16} className="mr-1" />
          {showNumber && `+${diff.toFixed(2)}`}
        </span>
      )
    } else if (diff < 0) {
      return (
        <span className="inline-flex items-center text-red-600 text-lg font-normal">
          <ArrowDown size={16} className="mr-1" />
          {showNumber && diff.toFixed(2)}
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center text-gray-500 text-lg font-normal">
          <Minus size={16} className="mr-1" />
          {showNumber && "เท่าเดิม"}
        </span>
      )
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="p-4 pb-28">
        <div className="w-full max-w-md mx-auto">

        {/* Modern Glass Daily Summary */}
        {summaryLoading ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6 mb-6">
            <div className="flex items-center justify-center py-6">
              <Loader2 className="animate-spin mr-2" size={20} />
              <span className="text-gray-600 text-sm font-medium">กำลังโหลดข้อมูล...</span>
            </div>
          </div>
        ) : summary ? (
          <div className="space-y-3 mb-4">


            {/* Modern Glass Main Stats */}
            <div className="grid grid-cols-1 gap-4">
              {/* Total Daily Production */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mr-3">
                      <Milk size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">สรุปการรีดนมวันนี้</h2>
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-2">{summary.dayTotal.toFixed(2)}</h3>
                  <p className="text-lg text-gray-600 font-semibold mb-3">กิโลกรัม</p>
                  <div className="flex items-center justify-center space-x-2">
                    <DiffIndicator diff={summary.dayDiff} />
                  </div>
                </div>
              </div>

              {/* Modern Glass Session Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                        <Sun size={14} className="text-orange-100" />
                      </div>
                      <span className="font-semibold text-gray-900 text-base">รอบเช้า</span>
                    </div>
                    <DiffIndicator diff={summary.sessions.morning.diff} showNumber={false} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{summary.sessions.morning.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 font-medium mb-2">กิโลกรัม</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">{summary.sessions.morning.count} ตัว</span>
                      <span className="text-gray-400 font-medium">
                        {summary.sessions.morning.diff > 0 ? '+' : ''}{summary.sessions.morning.diff.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                        <Moon size={14} className="text-blue-100" />
                      </div>
                      <span className="font-semibold text-gray-900 text-base">รอบเย็น</span>
                    </div>
                    <DiffIndicator diff={summary.sessions.evening.diff} showNumber={false} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{summary.sessions.evening.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 font-medium mb-2">กิโลกรัม</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">{summary.sessions.evening.count} ตัว</span>
                      <span className="text-gray-400 font-medium">
                        {summary.sessions.evening.diff > 0 ? '+' : ''}{summary.sessions.evening.diff.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Glass Top Producers */}
              {summary.topProducers.length > 0 && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">โคที่รีดนมวันนี้</h3>
                    <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                      {summary.topProducers.length} ตัว
                    </span>
                  </div>
                  <div className="space-y-3">
                    {summary.topProducers.map((cow, index) => (
                      <div key={cow.name} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all duration-300 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-sm font-bold text-white">#{index + 1}</span>
                          </div>
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                            <Avatar username={cow.name} size={28} className="rounded-lg" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 text-base">{cow.name}</span>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <span className="text-sm text-gray-500 font-medium">ผลิต</span>
                              <span className="font-bold text-gray-900 text-sm">{cow.total.toFixed(2)} กก.</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <DiffIndicator diff={cow.diffTotal} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : farmId ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-0 p-8 mb-6">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Milk size={32} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium">ยังไม่มีข้อมูลน้ำนมสำหรับวันนี้</p>
              <p className="text-sm mt-2 text-gray-400">เริ่มบันทึกข้อมูลการรีดนมเพื่อดูสรุปผล</p>
            </div>
          </div>
        ) : null}

        {/* Charts Section */}
        <div className="space-y-6">
          {/* 10 Days Chart */}
          <MilkChart chartData={chartData} loading={chartLoading} error={chartError} />

          {/* Monthly Chart */}
          <MonthlyChart chartData={monthlyData} loading={monthlyLoading} error={monthlyError} />

          {/* Yearly Chart */}
          <YearlyChart chartData={yearlyData} loading={yearlyLoading} error={yearlyError} />
        </div>

        </div>
      </div>

      <BottomNavigation />
    </main>
  )
}