import mongoose from 'mongoose'

const DailySessionSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: [true, 'กรุณาระบุฟาร์ม']
  },
  date: {
    type: String,
    required: [true, 'กรุณาระบุวันที่'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD']
  },
  session: {
    type: String,
    required: [true, 'กรุณาระบุรอบ'],
    enum: {
      values: ['morning', 'evening'],
      message: 'รอบต้องเป็น morning หรือ evening เท่านั้น'
    }
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  totalMilk: {
    type: Number,
    default: 0,
    min: [0, 'ปริมาณนมไม่สามารถติดลบได้']
  },
  cowCount: {
    type: Number,
    default: 0,
    min: [0, 'จำนวนโคไม่สามารถติดลบได้']
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Create unique compound index
DailySessionSchema.index({ farmId: 1, date: 1, session: 1 }, { unique: true })
DailySessionSchema.index({ farmId: 1, date: -1, session: 1 })

export default mongoose.models.DailySession || mongoose.model('DailySession', DailySessionSchema)