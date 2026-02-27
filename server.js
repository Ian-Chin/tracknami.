import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { Client } from '@notionhq/client'

const app = express()
app.use(cors())
app.use(express.json())

const notion = new Client({ auth: process.env.NOTION_TOKEN })

const DATABASE_ID = process.env.NOTION_DATABASE_ID
const DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID
const TEAM_DATABASE_ID = process.env.NOTION_TEAM_DATABASE_ID
const TEAM_DATA_SOURCE_ID = process.env.NOTION_TEAM_DATA_SOURCE_ID
const LEAVE_DATABASE_ID = process.env.NOTION_LEAVE_DATABASE_ID
const LEAVE_DATA_SOURCE_ID = process.env.NOTION_LEAVE_DATA_SOURCE_ID

// API Routes

app.get('/api/health', async (_req, res) => {
  try {
    const me = await notion.users.me({})
    res.json({ ok: true, user: me.name })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.get('/api/database', async (_req, res) => {
  try {
    const id = DATABASE_ID
    const db = await notion.databases.retrieve({ database_id: id })
    res.json(db)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/entries', async (_req, res) => {
  try {
    const id = DATABASE_ID
    const response = await notion.dataSources.query({
      data_source_id: DATA_SOURCE_ID,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    })
    const entries = response.results.map(mapPage)
    res.json(entries)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/entries', async (req, res) => {
  try {
    const id = DATABASE_ID
    const { name, status, priority, date } = req.body

    const properties = {
      Name: { title: [{ text: { content: name } }] },
    }
    if (status) properties.Status = { select: { name: status } }
    if (priority) properties.Priority = { select: { name: priority } }
    if (date) properties.Date = { date: { start: date } }

    const page = await notion.pages.create({
      parent: { database_id: id },
      properties,
    })

    res.json(mapPage(page))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/entries/:id', async (req, res) => {
  try {
    const { name, status, priority, date } = req.body
    const properties = {}

    if (name !== undefined) properties.Name = { title: [{ text: { content: name } }] }
    if (status !== undefined) properties.Status = { select: { name: status } }
    if (priority !== undefined) properties.Priority = { select: { name: priority } }
    if (date !== undefined) properties.Date = { date: date ? { start: date } : null }

    const page = await notion.pages.update({
      page_id: req.params.id,
      properties,
    })

    res.json(mapPage(page))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/entries/:id', async (req, res) => {
  try {
    await notion.pages.update({
      page_id: req.params.id,
      archived: true,
    })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Team Routes

app.get('/api/team', async (_req, res) => {
  try {
    const response = await notion.dataSources.query({
      data_source_id: TEAM_DATA_SOURCE_ID,
      sorts: [{ property: 'Name', direction: 'ascending' }],
    })
    const members = response.results.map(mapTeamMember)
    res.json(members)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/team/:id', async (req, res) => {
  try {
    const { status } = req.body
    const page = await notion.pages.update({
      page_id: req.params.id,
      properties: {
        Status: { select: { name: status } },
      },
    })
    res.json(mapTeamMember(page))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Leave/Calendar Routes

app.get('/api/leave', async (_req, res) => {
  try {
    const response = await notion.dataSources.query({
      data_source_id: LEAVE_DATA_SOURCE_ID,
      sorts: [{ property: 'Start Date', direction: 'ascending' }],
    })
    const records = response.results.map(mapLeaveRecord)
    res.json(records)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

function mapLeaveRecord(page) {
  const props = page.properties
  return {
    id: page.id,
    title: props.Name?.title?.[0]?.plain_text || '',
    member: props['Team Member']?.rich_text?.[0]?.plain_text || '',
    type: props.Type?.select?.name || '',
    startDate: props['Start Date']?.date?.start || null,
    endDate: props['End Date']?.date?.start || null,
  }
}

function mapTeamMember(page) {
  const props = page.properties
  return {
    id: page.id,
    name: props.Name?.title?.[0]?.plain_text || '',
    role: props.Role?.rich_text?.[0]?.plain_text || '',
    status: props.Status?.select?.name || 'Available',
    email: props.Email?.email || '',
    department: props.Department?.select?.name || '',
  }
}

function mapPage(page) {
  const props = page.properties
  return {
    id: page.id,
    name: props.Name?.title?.[0]?.plain_text || '',
    status: props.Status?.select?.name || 'Not Started',
    priority: props.Priority?.select?.name || 'Medium',
    date: props.Date?.date?.start || null,
    createdAt: page.created_time,
  }
}

const PORT = 3001
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`))
