import mongoose from 'mongoose'

const FarmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'กรุณาระบุชื่อฟาร์ม'],
    trim: true,
    maxLength: [100, 'ชื่อฟาร์มไม่ควรเกิน 100 ตัวอักษร']
  },
  location: {
    type: String,
    required: [true, 'กรุณาระบุที่ตั้งฟาร์ม'],
    trim: true,
    maxLength: [200, 'ที่ตั้งไม่ควรเกิน 200 ตัวอักษร']
  },
  owner: {
    type: String,
    required: [true, 'กรุณาระบุเจ้าของฟาร์ม'],
    trim: true,
    maxLength: [100, 'ชื่อเจ้าของไม่ควรเกิน 100 ตัวอักษร']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Create index
FarmSchema.index({ name: 1 })
FarmSchema.index({ isActive: 1 })

export default mongoose.models.Farm || mongoose.model('Farm', FarmSchema)