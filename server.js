import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { Client } from '@notionhq/client'

const app = express()
app.use(cors())
app.use(express.json())

const notion = new Client({ auth: process.env.NOTION_TOKEN })

const PROJECTS_DATABASE_ID = process.env.NOTION_PROJECTS_DATABASE_ID
const PROJECTS_DATA_SOURCE_ID = process.env.NOTION_PROJECTS_DATA_SOURCE_ID
const TASKS_DATABASE_ID = process.env.NOTION_TASKS_DATABASE_ID
const TASKS_DATA_SOURCE_ID = process.env.NOTION_TASKS_DATA_SOURCE_ID

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    const me = await notion.users.me({})
    res.json({ ok: true, user: me.name })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

// ── Projects ──

app.get('/api/projects', async (_req, res) => {
  try {
    const response = await notion.dataSources.query({
      data_source_id: PROJECTS_DATA_SOURCE_ID,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    })
    const projects = response.results.map(mapProject)
    res.json(projects)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/projects', async (req, res) => {
  try {
    const { name, state, date, category } = req.body
    const properties = {
      Name: { title: [{ text: { content: name } }] },
    }
    if (state) properties.State = { status: { name: state } }
    if (date) properties.Date = { date: { start: date } }
    if (category && category.length > 0) {
      properties.Category = { multi_select: category.map(c => ({ name: c })) }
    }
    const page = await notion.pages.create({
      parent: { database_id: PROJECTS_DATABASE_ID },
      properties,
    })
    res.json(mapProject(page))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/projects/:id', async (req, res) => {
  try {
    const { name, state, date, category } = req.body
    const properties = {}
    if (name !== undefined) properties.Name = { title: [{ text: { content: name } }] }
    if (state !== undefined) properties.State = { status: { name: state } }
    if (date !== undefined) properties.Date = { date: date ? { start: date } : null }
    if (category !== undefined) {
      properties.Category = { multi_select: category.map(c => ({ name: c })) }
    }
    const page = await notion.pages.update({ page_id: req.params.id, properties })
    res.json(mapProject(page))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await notion.pages.update({ page_id: req.params.id, archived: true })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Tasks ──

app.get('/api/tasks', async (_req, res) => {
  try {
    const response = await notion.dataSources.query({
      data_source_id: TASKS_DATA_SOURCE_ID,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    })
    const tasks = response.results.map(mapTask)
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/tasks', async (req, res) => {
  try {
    const { name, projectId, completed, date, endDate, priority, estimatedTime } = req.body
    const properties = {
      Name: { title: [{ text: { content: name } }] },
    }
    if (projectId) properties.Project = { relation: [{ id: projectId }] }
    if (completed !== undefined) properties.Completed = { checkbox: completed }
    if (date) {
      const dateObj = { start: date }
      if (endDate) dateObj.end = endDate
      properties.Date = { date: dateObj }
    }
    if (priority) properties.Priority = { select: { name: priority } }
    if (estimatedTime) properties['Estimated Completion Time'] = { rich_text: [{ text: { content: estimatedTime } }] }

    const page = await notion.pages.create({
      parent: { database_id: TASKS_DATABASE_ID },
      properties,
    })
    res.json(mapTask(page))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { name, projectId, completed, date, endDate, priority, estimatedTime } = req.body
    const properties = {}
    if (name !== undefined) properties.Name = { title: [{ text: { content: name } }] }
    if (projectId !== undefined) properties.Project = { relation: projectId ? [{ id: projectId }] : [] }
    if (completed !== undefined) properties.Completed = { checkbox: completed }
    if (date !== undefined) {
      if (date) {
        const dateObj = { start: date }
        if (endDate) dateObj.end = endDate
        properties.Date = { date: dateObj }
      } else {
        properties.Date = { date: null }
      }
    }
    if (priority !== undefined) properties.Priority = { select: priority ? { name: priority } : null }
    if (estimatedTime !== undefined) properties['Estimated Completion Time'] = { rich_text: estimatedTime ? [{ text: { content: estimatedTime } }] : [] }

    const page = await notion.pages.update({ page_id: req.params.id, properties })
    res.json(mapTask(page))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await notion.pages.update({ page_id: req.params.id, archived: true })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Mappers ──

function mapProject(page) {
  const props = page.properties
  return {
    id: page.id,
    name: props.Name?.title?.[0]?.plain_text || '',
    state: props.State?.status?.name || 'Not Start',
    stateColor: props.State?.status?.color || 'default',
    date: props.Date?.date?.start || null,
    category: (props.Category?.multi_select || []).map(c => c.name),
    person: (props.Person?.people || []).map(p => ({ id: p.id, name: p.name, avatar: p.avatar_url })),
    progress: props.Progress?.formula?.number ?? 0,
    taskStats: props['Task Statistics']?.formula?.string || '',
    taskIds: (props.Tasks?.relation || []).map(r => r.id),
    createdAt: page.created_time,
  }
}

function mapTask(page) {
  const props = page.properties
  return {
    id: page.id,
    name: props.Name?.title?.[0]?.plain_text || '',
    projectId: props.Project?.relation?.[0]?.id || null,
    completed: props.Completed?.checkbox || false,
    date: props.Date?.date?.start || null,
    endDate: props.Date?.date?.end || null,
    priority: props.Priority?.select?.name || null,
    estimatedTime: props['Estimated Completion Time']?.rich_text?.[0]?.plain_text || '',
    remind: props.Remind?.formula?.string || '',
    createdAt: page.created_time,
  }
}

const PORT = 3001
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`))
