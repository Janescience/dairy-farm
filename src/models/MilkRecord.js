import mongoose from 'mongoose'

const MilkRecordSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: [true, 'กรุณาระบุฟาร์ม']
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailySession',
    required: [true, 'กรุณาระบุรอบการรีดนม']
  },
  cowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cow',
    required: [true, 'กรุณาระบุโค']
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
  milkAmount: {
    type: Number,
    required: [true, 'กรุณาระบุปริมาณนม'],
    min: [0, 'ปริมาณนมไม่สามารถติดลบได้'],
    max: [100, 'ปริมาณนมไม่ควรเกิน 100 กก.ต่อรอบ']
  }
}, {
  timestamps: true
})

// Create indexes for performance
MilkRecordSchema.index({ farmId: 1, date: 1, session: 1 }) // Main query index
MilkRecordSchema.index({ farmId: 1, cowId: 1, date: 1 }) // Summary queries
MilkRecordSchema.index({ sessionId: 1 }) // Session lookups
MilkRecordSchema.index({ createdAt: 1 }) // Sorting by creation time

// Unique constraint: one record per cow per session per day
MilkRecordSchema.index({ farmId: 1, cowId: 1, date: 1, session: 1 }, { unique: true })

export default mongoose.models.MilkRecord || mongoose.model('MilkRecord', MilkRecordSchema)