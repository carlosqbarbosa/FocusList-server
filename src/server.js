require('dotenv').config()
const express = require('express')
const cors = require('cors')

const routes = require('./routes') 

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', routes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(40))
  console.log('FOCUS LIST SERVER ONLINE')
  console.log(`URL: http://localhost:${PORT}`)
  console.log(`Data: ${new Date().toLocaleString()}`)
  console.log('='.repeat(40) + '\n')
})
