import { notion, mapTimeLog } from './_lib/notion.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await notion.dataSources.query({
        data_source_id: process.env.NOTION_TIMELOG_DATA_SOURCE_ID,
        sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      })
      res.json(response.results.map(mapTimeLog))
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, hours, date, notes, taskId, projectId, personId } = req.body
      const properties = {
        Name: { title: [{ text: { content: name } }] },
        Hours: { number: hours },
      }
      if (date) properties.Date = { date: { start: date } }
      if (notes) properties.Notes = { rich_text: [{ text: { content: notes } }] }
      if (taskId) properties.Task = { relation: [{ id: taskId }] }
      if (projectId) properties.Project = { relation: [{ id: projectId }] }
      if (personId) properties.Person = { people: [{ id: personId }] }
      const page = await notion.pages.create({
        parent: { database_id: process.env.NOTION_TIMELOG_DATABASE_ID },
        properties,
      })
      res.json(mapTimeLog(page))
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
