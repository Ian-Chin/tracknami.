import { Client } from '@notionhq/client'

export const notion = new Client({ auth: process.env.NOTION_TOKEN })

export function mapProject(page) {
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

export function mapTask(page) {
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

export function mapTimeLog(page) {
  const props = page.properties
  return {
    id: page.id,
    name: props.Name?.title?.[0]?.plain_text || '',
    hours: props.Hours?.number ?? 0,
    date: props.Date?.date?.start || null,
    notes: props.Notes?.rich_text?.[0]?.plain_text || '',
    taskId: props.Task?.relation?.[0]?.id || null,
    projectId: props.Project?.relation?.[0]?.id || null,
    person: props.Person?.people?.[0] ? { id: props.Person.people[0].id, name: props.Person.people[0].name, avatar: props.Person.people[0].avatar_url } : null,
    createdAt: page.created_time,
  }
}
