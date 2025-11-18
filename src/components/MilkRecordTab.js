import { Loader2, Trash2, X, Check, Sun, Moon, BarChart3, Calculator } from 'lucide-react'
import { createPortal } from 'react-dom'
import Avatar from './Avatar'
import Button from './Button'

export default function MilkRecordTab({
  selectedFarmId,
  selectedSession,
  cows,
  availableCows,
  editingRecord,
  setEditingRecord,
  errors,
  recordsError,
  recordsLoading,
  sessionRecords,
  records,
  handleEditRecord,
  handleUpdateRecord,
  handleDeleteRecord
}) {

  return (
    <div className="min-h-screen bg-white relative">
      {/* Content */}
      <div className="relative z-10">
      {/* Summary */}
      {records && records.length > 0 && (
        (() => {
          const morningRecords = records.filter(record => record.session === 'morning')
          const eveningRecords = records.filter(record => record.session === 'evening')
          const morningMilk = morningRecords.reduce((sum, record) => sum + record.milkAmount, 0)
          const eveningMilk = eveningRecords.reduce((sum, record) => sum + record.milkAmount, 0)
          const totalMilk = morningMilk + eveningMilk
          const avgMilk = totalMilk / records.length

          return (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-0 shadow-[0_8px_32px_rgba(0,0,0,0.08)] mb-6 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-50/30 via-white/50 to-green-50/30">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Sun size={18} className="text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{morningMilk.toFixed(2)}</div>
                    <div className="text-sm font-medium text-gray-600">เช้า • {morningRecords.length} ตัว</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Moon size={18} className="text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{eveningMilk.toFixed(2)}</div>
                    <div className="text-sm font-medium text-gray-600">เย็น • {eveningRecords.length} ตัว</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Calculator size={18} className="text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{avgMilk.toFixed(2)}</div>
                    <div className="text-sm font-medium text-gray-600">เฉลี่ย</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <BarChart3 size={18} className="text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{totalMilk.toFixed(2)}</div>
                    <div className="text-sm font-medium text-gray-600">รวมทั้งวัน</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })()
      )}

      {/* Error Message */}
      {recordsError && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-500 px-3 py-2 rounded-lg mb-4 text-lg font-thin shadow-sm">
          {recordsError}
        </div>
      )}

      {/* No cows message */}
      {selectedFarmId && cows.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-500 px-3 py-2 rounded-lg mb-4 shadow-sm">
          <p className="text-lg font-thin">ยังไม่มีโคในฟาร์มนี้ กรุณาไปเพิ่มโคในหน้าตั้งค่าก่อน</p>
        </div>
      )}

      {/* Today's Records */}
      <div className="mb-38">
        {recordsLoading ? (
          <div className="p-6 text-center">
            <Loader2 size={32} className="animate-spin mx-auto text-gray-300" />
            <p className="mt-2 text-lg font-thin text-gray-300">กำลังโหลดข้อมูล...</p>
          </div>
        ) : sessionRecords.length === 0 ? (
          <div className="p-6 text-center text-lg font-thin text-gray-400">
            ยังไม่มีการบันทึกข้อมูลรอบนี้
          </div>
        ) : (
          <div className="space-y-3">
            {sessionRecords.sort((a, b) => b.milkAmount - a.milkAmount).map((record, index) => (
              <div
                key={record._id}
                onClick={() => handleEditRecord(record)}
                className="group relative"
                style={{ position: 'relative', zIndex: 1 }}
              >
                  {/* Modern Glass Card */}
                  <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl border-0 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] transition-all duration-500 cursor-pointer group-hover:scale-[1.02] group-hover:bg-white">

                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-green-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        {/* Left: Avatar + Info */}
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl shadow-lg flex items-center justify-center">
                              <Avatar
                                username={record.cowId.name}
                                size={40}
                                className="rounded-xl"
                              />
                            </div>
                            {/* Ranking indicator */}
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{index + 1}</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 truncate">
                                {record.cowId.name}
                              </h3>
                              {/* Session badge */}
                              <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                selectedSession === 'morning'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {selectedSession === 'morning' ? 'เช้า' : 'เย็น'}
                              </div>
                            </div>
                   
                          </div>
                        </div>

                        {/* Right: Amount */}
                        <div className="text-right flex-shrink-0 ml-4">
                          <div className="flex items-baseline space-x-1">
                            <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                              {record.milkAmount.toFixed(2)}
                            </span>
                            <span className="text-sm font-medium text-gray-500">กก.</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar visualization */}
                      <div className="mt-3 mb-1">
                        {(() => {
                          const target = selectedSession === 'morning' ? 30 : 20
                          const percentage = (record.milkAmount / target) * 100
                          return (
                            <>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-1000 group-hover:from-blue-500 group-hover:to-green-500"
                                  style={{
                                    width: `${Math.min(percentage, 100)}%`
                                  }}
                                ></div>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-400">ปริมาณการผลิต</span>
                                <span className="text-xs text-gray-500 font-medium">
                                  {percentage.toFixed(0)}% ของเป้าหมาย ({target} กก.)
                                </span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Interactive edit indicator */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                      <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                    </div>

                    {/* Subtle corner accent */}
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-50 to-transparent rounded-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal - Portal */}
      {editingRecord && createPortal(
        <div className="fixed inset-0 z-[99999]" style={{zIndex: 99999}}>
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
            onClick={() => setEditingRecord(null)}
          ></div>

          {/* Modal panel - Modern Glass Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.12)] border-t border-white/20 transform transition-all duration-300 max-h-[80vh] overflow-y-auto">
            <div className="p-6 pb-28">
              {/* Modern handle bar */}
              <div className="w-12 h-1 bg-gray-300/60 rounded-full mx-auto mb-6"></div>

              <form onSubmit={handleUpdateRecord} className="space-y-4">
                {/* แถวแรก: Avatar, ชื่อ, รอบ, ปริมาณน้ำนม */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center shadow-md">
                      <Avatar
                        username={editingRecord.cowId.name}
                        size={32}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {editingRecord.cowId.name}
                      </h3>
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        editingRecord.session === 'morning'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        รอบ{editingRecord.session === 'morning' ? 'เช้า' : 'เย็น'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="100"
                        value={editingRecord.milkAmount}
                        onChange={(e) => setEditingRecord(prev => ({ ...prev, milkAmount: e.target.value }))}
                        className={`w-24 bg-white/80 backdrop-blur-sm border rounded-xl px-3 py-2 text-lg font-semibold focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 text-right shadow-sm transition-all duration-200 ${
                          errors.editMilkAmount ? 'border-red-400 ring-red-400/50' : 'border-gray-200/50'
                        }`}
                        placeholder="0.0"
                        autoFocus
                      />
                      <span className="text-lg font-medium text-gray-600">กก.</span>
                    </div>
                  </div>
                </div>

                {/* Error Messages */}
                {errors.editMilkAmount && (
                  <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-xl shadow-sm">
                    <p className="text-sm font-medium">{errors.editMilkAmount}</p>
                  </div>
                )}

                {errors.editSubmit && (
                  <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-xl shadow-sm">
                    <p className="text-sm font-medium">{errors.editSubmit}</p>
                  </div>
                )}

              </form>

              {/* Fixed Bottom Button Row */}
              <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 p-4">
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant="danger"
                    size="lg"
                    onClick={() => {
                      if (confirm('คุณต้องการลบบันทึกนี้หรือไม่?')) {
                        handleDeleteRecord(editingRecord._id)
                        setEditingRecord(null)
                      }
                    }}
                    disabled={recordsLoading}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 text-white font-bold h-12 rounded-xl shadow-md"
                  >
                    ลบ
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => setEditingRecord(null)}
                    disabled={recordsLoading}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 border-0 text-white font-bold h-12 rounded-xl shadow-md"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={recordsLoading}
                    loading={recordsLoading}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 font-bold h-12 rounded-xl shadow-md"
                    onClick={(e) => {
                      e.preventDefault()
                      document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
                    }}
                  >
                    บันทึก
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      </div>
    </div>
  )
}