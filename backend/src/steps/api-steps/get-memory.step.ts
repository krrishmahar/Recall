

import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { memoryService } from '../../services/memory.service'
import { memorySchema } from '../../types/memory.types'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetMemory',
  description: 'Gets a single memory by ID',
  method: 'GET',
  path: '/memories/:id',
  flows: ['memory-flow'],
  responseSchema: {
    200: memorySchema,
    404: z.object({ error: z.string() }),
  },
  emits: [],
  includeFiles: ['../../types/memory.types.ts', '../../services/memory.service.ts'],
}

export const handler: Handlers['GetMemory'] = async (req: any, { logger, state }: any) => {
  const { id } = req.pathParams

  logger.info('Getting memory', { memoryId: id })

  const memory = await memoryService.getById(id, state)

  if (!memory) {
    logger.warn('Memory not found', { memoryId: id })
    return {
      status: 404,
      body: { error: 'Memory not found' },
    }
  }

  return {
    status: 200,
    body: memory,
  }
}