import { notion, mapProject } from './_lib/notion.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await notion.dataSources.query({
        data_source_id: process.env.NOTION_PROJECTS_DATA_SOURCE_ID,
        sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      })
      res.json(response.results.map(mapProject))
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, state, date, category, person } = req.body
      const properties = {
        Name: { title: [{ text: { content: name } }] },
      }
      if (state) properties.State = { status: { name: state } }
      if (date) properties.Date = { date: { start: date } }
      if (category && category.length > 0) {
        properties.Category = { multi_select: category.map(c => ({ name: c })) }
      }
      if (person && person.length > 0) {
        properties.Person = { people: person.map(id => ({ id })) }
      }
      const page = await notion.pages.create({
        parent: { database_id: process.env.NOTION_PROJECTS_DATABASE_ID },
        properties,
      })
      res.json(mapProject(page))
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
