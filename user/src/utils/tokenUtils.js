const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateToken() {
  let token = ''
  for (let i = 0; i < 4; i += 1) {
    token += CHARSET[Math.floor(Math.random() * CHARSET.length)]
  }
  return token
}

export function generateUniqueToken(existingTokens = []) {
  const used = new Set(
    existingTokens
      .map((token) => String(token ?? '').trim().toUpperCase())
      .filter(Boolean),
  )

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const token = generateToken()
    if (!used.has(token)) return token
  }

  throw new Error('Unable to generate a unique token')
}
