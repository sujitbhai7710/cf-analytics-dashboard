/**
 * Cloudflare GraphQL Analytics API Client
 * 
 * Uses API Token authentication (secure, scoped permissions)
 * API Tokens can be created at: https://dash.cloudflare.com/profile/api-tokens
 * Required permissions: 
 * - Account Analytics:Read
 * - Workers Scripts:Read
 */

const CF_GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/**
 * Execute a GraphQL query against Cloudflare Analytics API
 */
export async function queryGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
  apiToken: string
): Promise<T> {
  const response = await fetch(CF_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GraphQL request failed: ${response.status} ${text}`);
  }
  
  const result: GraphQLResponse<T> = await response.json();
  
  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  if (!result.data) {
    throw new Error('No data returned from GraphQL query');
  }
  
  return result.data;
}

/**
 * Worker analytics data structure
 */
export interface WorkerAnalyticsPoint {
  sum: {
    requests: number;
    errors: number;
  };
  dimensions: {
    scriptName: string;
    datetime: string;
  };
}

/**
 * Get worker invocations analytics
 */
export async function getWorkerInvocations(
  accountId: string,
  apiToken: string,
  options: {
    scriptName?: string;
    start: Date;
    end: Date;
    limit?: number;
  }
): Promise<WorkerAnalyticsPoint[]> {
  const query = `
    query ($accountId: String!, $scriptName: String, $start: Time!, $end: Time!, $limit: Int!) {
      viewer {
        accounts(filter: { accountTag: $accountId }) {
          workersInvocationsAdaptive(
            limit: $limit,
            filter: {
              scriptName: $scriptName,
              datetime_geq: $start,
              datetime_lt: $end
            }
          ) {
            sum {
              requests
              errors
            }
            dimensions {
              scriptName
              datetime
            }
          }
        }
      }
    }
  `;
  
  try {
    const data = await queryGraphQL<{
      viewer: {
        accounts: Array<{
          workersInvocationsAdaptive: WorkerAnalyticsPoint[]
        }>
      }
    }>(query, {
      accountId,
      scriptName: options.scriptName || null,
      start: options.start.toISOString(),
      end: options.end.toISOString(),
      limit: options.limit || 1000
    }, apiToken);
    
    return data.viewer.accounts[0]?.workersInvocationsAdaptive || [];
  } catch (error) {
    console.error('GraphQL query failed:', error);
    return [];
  }
}

/**
 * HTTP request analytics data structure
 */
export interface HttpRequestData {
  dimensions: {
    clientRequestPath: string;
    clientCountryName: string;
    clientDeviceType: string;
    cacheStatus: string;
    clientRequestUserAgent?: string;
    datetime?: string;
    botScore?: number;
  };
  sum: {
    requests: number;
    cachedRequests: number;
  };
  avg: {
    responseTime: number;
  };
}

/**
 * Get HTTP requests analytics (for Pages/Zone)
 */
export async function getHttpRequests(
  zoneId: string,
  apiToken: string,
  options: {
    start: Date;
    end: Date;
    limit?: number;
  }
): Promise<HttpRequestData[]> {
  const query = `
    query ($zoneTag: String!, $start: Time!, $end: Time!, $limit: Int!) {
      viewer {
        zones(filter: { zoneTag: $zoneId }) {
          httpRequests1dGroups(
            limit: $limit,
            filter: {
              datetime_geq: $start,
              datetime_lt: $end
            }
          ) {
            dimensions {
              clientRequestPath
              clientCountryName
              clientDeviceType
              cacheStatus
            }
            sum {
              requests
              cachedRequests
            }
            avg {
              responseTime
            }
          }
        }
      }
    }
  `;
  
  try {
    const data = await queryGraphQL<{
      viewer: {
        zones: Array<{
          httpRequests1dGroups: HttpRequestData[]
        }>
      }
    }>(query, {
      zoneTag: zoneId,
      start: options.start.toISOString(),
      end: options.end.toISOString(),
      limit: options.limit || 1000
    }, apiToken);
    
    return data.viewer.zones[0]?.httpRequests1dGroups || [];
  } catch (error) {
    console.error('HTTP requests query failed:', error);
    return [];
  }
}

/**
 * Get bot detection data
 */
export async function getBotData(
  zoneId: string,
  apiToken: string,
  options: {
    start: Date;
    end: Date;
    limit?: number;
  }
): Promise<HttpRequestData[]> {
  const query = `
    query ($zoneTag: String!, $start: Time!, $end: Time!, $limit: Int!) {
      viewer {
        zones(filter: { zoneTag: $zoneId }) {
          httpRequests1dGroups(
            limit: $limit,
            filter: {
              datetime_geq: $start,
              datetime_lt: $end
            }
          ) {
            dimensions {
              clientRequestPath
              clientRequestUserAgent
              botScore
            }
            sum {
              requests
            }
          }
        }
      }
    }
  `;
  
  try {
    const data = await queryGraphQL<{
      viewer: {
        zones: Array<{
          httpRequests1dGroups: HttpRequestData[]
        }>
      }
    }>(query, {
      zoneTag: zoneId,
      start: options.start.toISOString(),
      end: options.end.toISOString(),
      limit: options.limit || 5000
    }, apiToken);
    
    return data.viewer.zones[0]?.httpRequests1dGroups || [];
  } catch (error) {
    console.error('Bot data query failed:', error);
    return [];
  }
}

/**
 * Get cache performance data
 */
export async function getCachePerformance(
  zoneId: string,
  apiToken: string,
  options: {
    start: Date;
    end: Date;
  }
): Promise<Array<{
  dimensions: { datetime: string; cacheStatus: string };
  sum: { requests: number; cachedRequests: number };
}>> {
  const query = `
    query ($zoneTag: String!, $start: Time!, $end: Time!) {
      viewer {
        zones(filter: { zoneTag: $zoneId }) {
          httpRequests1dGroups(
            limit: 500,
            filter: {
              datetime_geq: $start,
              datetime_lt: $end
            }
          ) {
            dimensions {
              datetime
              cacheStatus
            }
            sum {
              requests
              cachedRequests
            }
          }
        }
      }
    }
  `;
  
  try {
    const data = await queryGraphQL<{
      viewer: {
        zones: Array<{
          httpRequests1dGroups: Array<{
            dimensions: { datetime: string; cacheStatus: string };
            sum: { requests: number; cachedRequests: number };
          }>
        }>
      }
    }>(query, {
      zoneTag: zoneId,
      start: options.start.toISOString(),
      end: options.end.toISOString()
    }, apiToken);
    
    return data.viewer.zones[0]?.httpRequests1dGroups || [];
  } catch (error) {
    console.error('Cache performance query failed:', error);
    return [];
  }
}

/**
 * Test Cloudflare API connection
 */
export async function testCloudflareConnection(
  accountId: string,
  apiToken: string
): Promise<{ success: boolean; accountName?: string; error?: string }> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      if (response.status === 403) {
        return { 
          success: false, 
          error: 'API Token does not have permission to access this account. Make sure it has Account Analytics:Read permission.' 
        };
      }
      return { success: false, error: `API error: ${response.status}` };
    }
    
    const data = await response.json() as { result?: { name?: string } };
    return { 
      success: true, 
      accountName: data.result?.name || accountId 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get list of workers for an account
 */
export async function getWorkersList(
  accountId: string,
  apiToken: string
): Promise<Array<{ id: string; script: string; created_on: string; modified_on: string }>> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts`,
    {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch workers: ${response.status}`);
  }
  
  const data = await response.json() as { result: Array<{ id: string; script: string; created_on: string; modified_on: string }> };
  return data.result || [];
}
