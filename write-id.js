const inquirer = require('inquirer')
const rfid = require('./rfid/rfid')

;(async () => {
  let id

  console.log('ready')

  let rfidInstance
  try {
    rfidInstance = await rfid()
  } catch (error) {
    console.error(error)
    return process.exit(1)
  }

  const thingPlaced = async (rfidFunctions) => {
    ({ id } = await inquirer.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'ID?'
      }
    ]))
    const writeUrl = `https://sticky.to/${id.trim()}`
    await rfidFunctions.writeUrl(writeUrl)
    console.log(`written "${writeUrl}"!`)
  }

  rfidInstance.on('beep', thingPlaced)
})()
