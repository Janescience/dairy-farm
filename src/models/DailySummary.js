import mongoose from 'mongoose'

const DailySummarySchema = new mongoose.Schema({
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
  cowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cow',
    required: [true, 'กรุณาระบุโค']
  },
  morningMilk: {
    type: Number,
    default: 0,
    min: [0, 'ปริมาณนมไม่สามารถติดลบได้']
  },
  eveningMilk: {
    type: Number,
    default: 0,
    min: [0, 'ปริมาณนมไม่สามารถติดลบได้']
  },
  totalMilk: {
    type: Number,
    default: 0,
    min: [0, 'ปริมาณนมไม่สามารถติดลบได้']
  }
}, {
  timestamps: true
})

// Create indexes
DailySummarySchema.index({ farmId: 1, date: -1, totalMilk: -1 })
DailySummarySchema.index({ farmId: 1, cowId: 1, date: -1 })
DailySummarySchema.index({ farmId: 1, date: 1, cowId: 1 }, { unique: true })

// Virtual for calculating total milk
DailySummarySchema.pre('save', function(next) {
  this.totalMilk = this.morningMilk + this.eveningMilk
  next()
})

export default mongoose.models.DailySummary || mongoose.model('DailySummary', DailySummarySchema)