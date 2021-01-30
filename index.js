const inquirer = require('inquirer')

const api = require('./api/api')
const rfid = require('./rfid/rfid')

;(async () => {
  let rfidInstance
  try {
    rfidInstance = await rfid()
  } catch (error) {
    console.error('rfid not working')
    process.exit(1)
  }

  const { privateKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'privateKey',
      message: 'What is your private key?'
    }
  ])

  const apiInstance = api('production')

  console.log('getting things...')
  const things = await apiInstance.get('v1/things', privateKey)
  console.log('ready...')
  
  let thingPlacedNumber = 0
  const thingPlaced = async (rfidFunctions) => {
    const thing = things[thingPlacedNumber]
  
    const writeUrl = `https://sticky.to/${thing.id}`
    await rfidFunctions.writeUrl(writeUrl)
    console.log(`(${thingPlacedNumber}) written "${thing.name}" -> "${writeUrl}"!`)
    thingPlacedNumber += 1
  
    if (thingPlacedNumber === things.length) {
      console.log('out of things!')
      rfidInstance.off('beep', thingPlaced) 
      console.log('all done!')
      process.exit(0)
    }
  }
  
  rfidInstance.on('beep', thingPlaced) 
})()
