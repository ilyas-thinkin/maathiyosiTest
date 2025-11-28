// src/app/components/lib/vimeoClient.ts
// Vimeo API client utilities

const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN!;
const VIMEO_API_BASE_URL = process.env.VIMEO_API_BASE_URL || 'https://api.vimeo.com';

export interface VimeoFolder {
  uri: string;
  name: string;
  created_time: string;
  modified_time: string;
  folder_id: string;
}

export interface VimeoUploadResponse {
  uri: string;
  upload: {
    upload_link: string;
    approach: string;
    size: number;
    status: string;
  };
  link: string;
  player_embed_url: string;
}

export interface VimeoVideo {
  uri: string;
  name: string;
  link: string;
  player_embed_url: string;
  duration: number;
  width: number;
  height: number;
  created_time: string;
  status: string;
}

/**
 * Create a new folder in Vimeo
 */
export async function createVimeoFolder(folderName: string): Promise<VimeoFolder> {
  const response = await fetch(`${VIMEO_API_BASE_URL}/me/projects`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VIMEO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.vimeo.*+json;version=3.4'
    },
    body: JSON.stringify({
      name: folderName
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Vimeo folder: ${response.status} ${error}`);
  }

  const data = await response.json();

  // Extract folder ID from URI (e.g., /users/123/projects/456 -> 456)
  const folderId = data.uri.split('/').pop();

  return {
    uri: data.uri,
    name: data.name,
    created_time: data.created_time,
    modified_time: data.modified_time,
    folder_id: folderId
  };
}

/**
 * Create a video upload URL in Vimeo
 */
export async function createVimeoUpload(
  fileName: string,
  fileSize: number,
  folderId?: string
): Promise<VimeoUploadResponse> {
  const body: any = {
    upload: {
      approach: 'tus',
      size: fileSize.toString()
    },
    name: fileName
  };

  // If folder ID is provided, add it to the request
  if (folderId) {
    body.folder_uri = `/me/projects/${folderId}`;
  }

  const response = await fetch(`${VIMEO_API_BASE_URL}/me/videos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VIMEO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.vimeo.*+json;version=3.4'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Vimeo upload: ${response.status} ${error}`);
  }

  return await response.json();
}

/**
 * Get video details from Vimeo
 */
export async function getVimeoVideo(videoId: string): Promise<VimeoVideo> {
  const response = await fetch(`${VIMEO_API_BASE_URL}/videos/${videoId}`, {
    headers: {
      'Authorization': `Bearer ${VIMEO_ACCESS_TOKEN}`,
      'Accept': 'application/vnd.vimeo.*+json;version=3.4'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Vimeo video: ${response.status} ${error}`);
  }

  return await response.json();
}

/**
 * Delete a video from Vimeo
 */
export async function deleteVimeoVideo(videoId: string): Promise<void> {
  const response = await fetch(`${VIMEO_API_BASE_URL}/videos/${videoId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${VIMEO_ACCESS_TOKEN}`,
      'Accept': 'application/vnd.vimeo.*+json;version=3.4'
    }
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.text();
    throw new Error(`Failed to delete Vimeo video: ${response.status} ${error}`);
  }
}

/**
 * Delete a folder from Vimeo
 */
export async function deleteVimeoFolder(folderId: string): Promise<void> {
  const response = await fetch(`${VIMEO_API_BASE_URL}/me/projects/${folderId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${VIMEO_ACCESS_TOKEN}`,
      'Accept': 'application/vnd.vimeo.*+json;version=3.4'
    }
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.text();
    throw new Error(`Failed to delete Vimeo folder: ${response.status} ${error}`);
  }
}

/**
 * Extract video ID from Vimeo URI
 * @example /videos/123456 -> 123456
 */
export function extractVimeoVideoId(uri: string): string {
  return uri.split('/').pop() || '';
}
