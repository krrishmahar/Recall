

import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { memoryService } from '../../services/memory.service'
import { memorySchema, memoryStatusSchema, memoryTypeSchema } from '../../types/memory.types'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'SearchMemories',
  description: 'Search and filter memories',
  method: 'GET',
  path: '/memories',
  flows: ['memory-flow'],
  queryParams: [
    {
      name: 'status',
      description: 'Filter by status: active, scheduled, triggered, archived',
    },
    {
      name: 'type',
      description: 'Filter by type: future, decision, failure, context',
    },
    {
      name: 'teamId',
      description: 'Filter by team ID',
    },
  ],
  responseSchema: {
    200: z.object({
      memories: z.array(memorySchema),
      count: z.number(),
    }),
  },
  emits: [],
  includeFiles: ['../../types/memory.types.ts', '../../services/memory.service.ts'],
}

export const handler: Handlers['SearchMemories'] = async (req: any, { logger, state }:any) => {
  const statusParam = req.queryParams.status as string | undefined
  const typeParam = req.queryParams.type as string | undefined
  const teamIdParam = req.queryParams.teamId as string | undefined

  logger.info('Searching memories', { 
    statusFilter: statusParam, 
    typeFilter: typeParam,
    teamId: teamIdParam 
  })

  // Validate status if provided
  let status = undefined
  if (statusParam) {
    const result = memoryStatusSchema.safeParse(statusParam)
    if (result.success) {
      status = result.data
    }
  }

  // Get memories with filters
  let memories = await memoryService.getAll(state, status, teamIdParam)

  // Apply type filter if provided
  if (typeParam) {
    const typeResult = memoryTypeSchema.safeParse(typeParam)
    if (typeResult.success) {
      memories = memories.filter(m => m.type === typeResult.data)
    }
  }

  logger.info('Memories retrieved', { count: memories.length })

  return {
    status: 200,
    body: {
      memories,
      count: memories.length,
    },
  }
}