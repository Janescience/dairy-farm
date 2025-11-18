import mongoose from 'mongoose'

const CowSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: [true, 'กรุณาระบุฟาร์ม']
  },
  name: {
    type: String,
    required: [true, 'กรุณาระบุชื่อโค'],
    trim: true,
    maxLength: [50, 'ชื่อโคไม่ควรเกิน 50 ตัวอักษร']
  },
  age: {
    type: Number,
    min: [0, 'อายุไม่สามารถติดลบได้'],
    max: [30, 'อายุไม่ควรเกิน 30 ปี']
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    lowercase: true
  },
  birthDate: {
    type: Date
  },
  entryDate: {
    type: Date
  },
  purchasePrice: {
    type: Number,
    min: [0, 'ราคาซื้อไม่สามารถติดลบได้']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Create indexes
CowSchema.index({ farmId: 1, isActive: 1 })
CowSchema.index({ farmId: 1, name: 1 })

export default mongoose.models.Cow || mongoose.model('Cow', CowSchema)