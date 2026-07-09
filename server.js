import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000
const customersPath = path.resolve(process.cwd(), 'public', 'mock', 'customers.json')

app.get('/api/customers', (req, res) => {
  if (!fs.existsSync(customersPath)) return res.status(404).send('Not found')
  const data = JSON.parse(fs.readFileSync(customersPath, 'utf8'))
  res.json(data)
})

app.post('/api/customers', (req, res) => {
  try {
    const body = req.body
    if (!body || !body.name) return res.status(400).json({ error: 'Invalid body' })

    const list = fs.existsSync(customersPath)
      ? JSON.parse(fs.readFileSync(customersPath, 'utf8'))
      : []

    const id = `cust-${String(Math.floor(Math.random() * 90000) + 10000)}`
    const createdAt = new Date().toISOString().split('T')[0]
    const newCustomer = {
      id,
      name: body.name,
      phone: body.phone || '',
      email: body.email || '',
      address: body.address || '',
      createdAt,
    }

    list.push(newCustomer)
    fs.writeFileSync(customersPath, JSON.stringify(list, null, 2), 'utf8')

    res.status(201).json(newCustomer)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save customer' })
  }
})

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})
