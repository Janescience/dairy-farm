// Thailand timezone utilities

export const getTodayThailand = () => {
  return new Date().toLocaleDateString('sv-SE', {
    timeZone: 'Asia/Bangkok'
  }) // Returns: "2024-01-15"
}

export const getYesterdayThailand = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toLocaleDateString('sv-SE', {
    timeZone: 'Asia/Bangkok'
  })
}

export const getNowThailand = () => {
  return new Date(new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Bangkok'
  }))
}

export const formatThaiDateTime = (date) => {
  return new Date(date).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatThaiDate = (date) => {
  return new Date(date).toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export const formatThaiDateISO = (date) => {
  return new Date(date).toLocaleDateString('sv-SE', {
    timeZone: 'Asia/Bangkok'
  })
}

export const getCurrentSession = () => {
  const now = new Date(new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Bangkok'
  }))
  const hour = now.getHours()

  if (hour < 12) {
    return 'morning'
  } else {
    return 'evening'
  }
}

export const getSessionDisplayName = (session) => {
  return session === 'morning' ? 'เช้า' : 'เย็น'
}