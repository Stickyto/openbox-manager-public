const assert = require('assert/strict')
const EventEmitter = require('events')
const { NFC } = require('nfc-pcsc')
const ndef = require('@taptrack/ndef')

const GET_READER_TIMEOUT = 5000
const BLOCK_OFFSET = 4
const BLOCK_SIZE = 4
const BLOCKS = 12

const encapsulate = (data, blockSize = 4) => {
  assert(data.length < 0xfffe, 'Maximal NDEF message size exceeded')
  const prefix = Buffer.allocUnsafe(data.length > 0xfe ? 4 : 2)
  prefix[0] = 0x03 // NDEF type
  if (data.length > 0xfe) {
    prefix[1] = 0xff
    prefix.writeInt16BE(data.length, 2)
  } else {
    prefix[1] = data.length
  }
  const suffix = Buffer.from([0xfe])
  const totalLength = prefix.length + data.length + suffix.length
  const excessLength = totalLength % blockSize
  const rightPadding = excessLength > 0 ? blockSize - excessLength : 0
  const newLength = totalLength + rightPadding
  return Buffer.concat([prefix, data, suffix], newLength)
}

const getReader = () => {
  return new Promise((resolve, reject) => {
    const nfc = new NFC()
    nfc.on('error', err => {})
    const timeout = setTimeout(
      () => {
        return reject(`no reader available in ${GET_READER_TIMEOUT}ms`)
      },
      GET_READER_TIMEOUT
    )
    nfc.on('reader', reader => {
      reader.on('error', err => {})
      clearTimeout(timeout)
      return resolve(reader)
    })
  })
  
}

const writeBytes = async (reader, buffer) => {
  await reader.write(BLOCK_OFFSET, buffer, BLOCK_SIZE)
}

const writeUrl = async (reader, url) => {
  const textRecord = ndef.Utils.createUriRecord(url)
  const message = new ndef.Message([textRecord])
  const bytes = message.toByteArray()
  const buffer = encapsulate(Buffer.from(bytes.buffer))
  await writeBytes(reader, buffer)
}

// const writeText = async (reader, text) => {
//   const paddedText = text.padEnd(BLOCKS, ' ')
//   const buffer = Buffer.allocUnsafe(BLOCKS)
//   buffer.fill(0)
//   buffer.write(paddedText)
//   await writeBytes(reader, buffer)
// }

const bufferToTypedArray = (buffer) => {
  return new Uint8Array(buffer)
}

const bufferToPureArray = (buffer) => {
  const typedArray = bufferToTypedArray(buffer)
  const pureArray = []
  pureArray.push.apply(pureArray, typedArray)
  return pureArray
}

const byteToBits = (byte) => {
  // console.log('[byteToBits]', byte)
  const bits = []
  for (var i = 7; i >= 0; i--) {
    const bit = byte & (1 << i) ? '1' : '0'
    bits.push(bit)
  }
  return bits.join('')
}

const printSomething = (something) => {
  return something.toString()
  // .trimEnd()
}

const rfid = async () => {
  const ee = new EventEmitter()
  const reader = await getReader()

  reader.on('card', async card => {
    try {
      const buffer = await reader.read(BLOCK_OFFSET, BLOCKS, BLOCK_SIZE)
      const { uid } = card

      const typedArray = bufferToTypedArray(buffer)
      const pureArray = bufferToPureArray(buffer)
      const pureArrayAsBits = pureArray.map(byte => byteToBits(byte))

      ee.emit(
        'beep',
        {
          uid,
          typedArray,
          pureArray,
          pureArrayAsBits,
          printed: printSomething(pureArray),
          writeUrl: (url) => writeUrl(reader, url)
        }
      )
    } catch (error) {
      console.error('error!')
      console.error(error)
    }
  })

  return {
    on: (event, callback) => ee.on(event, callback),
    off: (event, callback) => ee.off(event, callback)
  }
}

module.exports = rfid
