import weaviate from 'weaviate-client';

// Types for Weaviate v3
type WeaviateClient = any; // weaviate-client v3 doesn't export proper types

let client: WeaviateClient | null = null;

/**
 * Initialize Weaviate client (singleton pattern)
 */
export function getWeaviateClient(): WeaviateClient {
  if (!client) {
    const url = process.env.WEAVIATE_URL;
    const apiKey = process.env.WEAVIATE_API_KEY;

    if (!url || !apiKey) {
      throw new Error('WEAVIATE_URL and WEAVIATE_API_KEY must be set in environment');
    }

    // Remove protocol from URL
    const cleanHost = url.replace('https://', '').replace('http://', '');

    // client = weaviate.client({
    //   host: url , // Full URL with https://
    //   apiKey: apiKey,
    //   headers: {
    //     'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
    //   },
    // });


     client = weaviate.connectToWeaviateCloud(url, {
      authCredentials: {
        apiKey: apiKey,
      },
      headers: {
        'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
      },
    });

    
    console.log('✅ Weaviate client initialized');
  }

  return client;
}

/**
 * Create the Memory class schema in Weaviate
 */
export async function createSchema(): Promise<void> {
  const client = getWeaviateClient();

  try {
    // Check if schema exists
    const existingSchema = await client.schema.getter().do();
    const classExists = existingSchema.classes?.some(
      (cls: any) => cls.class === 'Memory'
    );

    if (classExists) {
      console.log('ℹ️  Memory schema already exists');
      return;
    }

    // Create schema
    const classObj = {
      class: 'Memory',
      description: 'Chronicle team memories',
      vectorizer: 'none',
      properties: [
        {
          name: 'memoryId',
          dataType: ['text'],
          description: 'Unique memory identifier',
        },
        {
          name: 'title',
          dataType: ['text'],
          description: 'Memory title',
        },
        {
          name: 'description',
          dataType: ['text'],
          description: 'Full description',
        },
        {
          name: 'type',
          dataType: ['text'],
          description: 'Memory type',
        },
        {
          name: 'teamId',
          dataType: ['text'],
          description: 'Team identifier',
        },
        {
          name: 'userId',
          dataType: ['text'],
          description: 'User identifier',
        },
        {
          name: 'tags',
          dataType: ['text[]'],
          description: 'Tags array',
        },
        {
          name: 'severity',
          dataType: ['text'],
          description: 'Severity level',
        },
        {
          name: 'aiSummary',
          dataType: ['text'],
          description: 'AI summary',
        },
        {
          name: 'aiCategory',
          dataType: ['text'],
          description: 'AI category',
        },
        {
          name: 'createdAt',
          dataType: ['text'],
          description: 'Creation timestamp',
        },
        {
          name: 'status',
          dataType: ['text'],
          description: 'Memory status',
        },
      ],
    };

    await client.schema.classCreator().withClass(classObj).do();
    console.log('✅ Memory schema created');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('ℹ️  Schema already exists');
    } else {
      console.error('❌ Schema creation error:', error);
      throw error;
    }
  }
}

/**
 * Store memory with embedding
 */
export async function storeMemoryEmbedding(
  memoryId: string,
  memory: Record<string, any>,
  embedding: number[]
): Promise<string> {
  const client = getWeaviateClient();

  try {
    const result = await client.data
      .creator()
      .withClassName('Memory')
      .withProperties({
        memoryId: memoryId,
        title: memory.title || '',
        description: memory.description || '',
        type: memory.type || '',
        teamId: memory.teamId || 'demo-team',
        userId: memory.userId || 'demo-user',
        tags: memory.tags || [],
        severity: memory.severity || '',
        aiSummary: memory.aiSummary || '',
        aiCategory: memory.aiCategory || '',
        createdAt: memory.createdAt || new Date().toISOString(),
        status: memory.status || 'active',
      })
      .withVector(embedding)
      .do();

    console.log(`✅ Memory stored: ${result.id}`);
    return result.id;
  } catch (error) {
    console.error('❌ Store error:', error);
    throw error;
  }
}

/**
 * Search memories by vector similarity
 */
export async function searchMemories(
  queryEmbedding: number[],
  teamId: string,
  limit: number = 5
): Promise<any[]> {
  const client = getWeaviateClient();

  try {
    const result = await client.graphql
      .get()
      .withClassName('Memory')
      .withFields('memoryId title description type tags aiSummary aiCategory createdAt status')
      .withNearVector({
        vector: queryEmbedding,
        certainty: 0.7,
      })
      .withWhere({
        path: ['teamId'],
        operator: 'Equal',
        valueText: teamId,
      })
      .withLimit(limit)
      .do();

    const memories = result.data?.Get?.Memory || [];
    console.log(`✅ Found ${memories.length} memories`);
    return memories;
  } catch (error) {
    console.error('❌ Search error:', error);
    return [];
  }
}

/**
 * Get memory by ID
 */
export async function getMemoryById(memoryId: string): Promise<any | null> {
  const client = getWeaviateClient();

  try {
    const result = await client.graphql
      .get()
      .withClassName('Memory')
      .withFields('memoryId title description type tags aiSummary aiCategory createdAt status teamId userId')
      .withWhere({
        path: ['memoryId'],
        operator: 'Equal',
        valueText: memoryId,
      })
      .withLimit(1)
      .do();

    const memories = result.data?.Get?.Memory || [];
    return memories.length > 0 ? memories[0] : null;
  } catch (error) {
    console.error('❌ Get memory error:', error);
    return null;
  }
}

/**
 * Get all team memories
 */
export async function getAllTeamMemories(
  teamId: string,
  limit: number = 20,
  offset: number = 0
): Promise<any[]> {
  const client = getWeaviateClient();

  try {
    const result = await client.graphql
      .get()
      .withClassName('Memory')
      .withFields('memoryId title description type tags aiSummary aiCategory createdAt status')
      .withWhere({
        path: ['teamId'],
        operator: 'Equal',
        valueText: teamId,
      })
      .withLimit(limit)
      .withOffset(offset)
      .do();

    const memories = result.data?.Get?.Memory || [];
    console.log(`✅ Retrieved ${memories.length} team memories`);
    return memories;
  } catch (error) {
    console.error('❌ Get team memories error:', error);
    return [];
  }
}

/**
 * Get memories by type
 */
export async function getMemoriesByType(
  teamId: string,
  type: 'future' | 'decision' | 'failure' | 'context',
  limit: number = 20
): Promise<any[]> {
  const client = getWeaviateClient();

  try {
    const result = await client.graphql
      .get()
      .withClassName('Memory')
      .withFields('memoryId title description type tags aiSummary createdAt status')
      .withWhere({
        operator: 'And',
        operands: [
          {
            path: ['teamId'],
            operator: 'Equal',
            valueText: teamId,
          },
          {
            path: ['type'],
            operator: 'Equal',
            valueText: type,
          },
        ],
      })
      .withLimit(limit)
      .do();

    const memories = result.data?.Get?.Memory || [];
    console.log(`✅ Found ${memories.length} ${type} memories`);
    return memories;
  } catch (error) {
    console.error(`❌ Get ${type} memories error:`, error);
    return [];
  }
}

/**
 * Delete memory
 */
export async function deleteMemory(weaviateId: string): Promise<void> {
  const client = getWeaviateClient();

  try {
    await client.data
      .deleter()
      .withClassName('Memory')
      .withId(weaviateId)
      .do();

    console.log(`✅ Memory deleted: ${weaviateId}`);
  } catch (error) {
    console.error('❌ Delete error:', error);
    throw error;
  }
}

/**
 * Update memory
 */
export async function updateMemory(
  weaviateId: string,
  updates: Record<string, any>
): Promise<void> {
  const client = getWeaviateClient();

  try {
    await client.data
      .updater()
      .withClassName('Memory')
      .withId(weaviateId)
      .withProperties(updates)
      .do();

    console.log(`✅ Memory updated: ${weaviateId}`);
  } catch (error) {
    console.error('❌ Update error:', error);
    throw error;
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const client = getWeaviateClient();
    const meta = await client.misc.metaGetter().do();
    console.log('✅ Weaviate healthy:', meta.version);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}

/**
 * Delete all team memories (CAUTION!)
 */
export async function deleteAllMemories(teamId: string): Promise<number> {
  const client = getWeaviateClient();

  try {
    const result = await client.batch
      .objectsBatchDeleter()
      .withClassName('Memory')
      .withWhere({
        path: ['teamId'],
        operator: 'Equal',
        valueText: teamId,
      })
      .do();

    const deletedCount = result.results?.successful || 0;
    console.log(`✅ Deleted ${deletedCount} memories`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Delete all error:', error);
    throw error;
  }
}