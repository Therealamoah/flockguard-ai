import { backendApi } from './backendApi';

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB

// Gets a signed upload slot from the backend, then uploads the file
// straight to Cloudinary from the browser (never through our server) --
// the signature proves the upload was authorized for this farm's folder.
export async function uploadEvidence(file, onProgress) {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('File is too large (25MB max)');
  }

  const { signature, timestamp, folder, apiKey, cloudName } = await backendApi.post('/api/uploads/signature', {});

  const resourceType = file.type.startsWith('video') ? 'video' : 'image';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({ url: data.secure_url, type: resourceType, name: file.name });
      } else {
        reject(new Error('Upload to Cloudinary failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Upload to Cloudinary failed'));
    xhr.send(formData);
  });
}
